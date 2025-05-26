import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Shop from '@/models/Shop';
import Product from '@/models/Product';
import User from '@/models/User';

// Get all shops with additional data
export async function GET(req) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.role.toUpperCase() !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admins can access this endpoint' },
        { status: 403 }
      );
    }

    await connectDB();

    // Get all shops - we'll handle both regular shops and those created by test accounts
    // For test accounts, we stored the owner email directly in the shop document
    const allShops = await Shop.find().sort({ createdAt: -1 });
    
    // Process shops to get consistent format
    const shops = await Promise.all(allShops.map(async (shop) => {
      // Get product count
      const productCount = await Product.countDocuments({ shop: shop._id });
      
      // Determine owner info - either from the owner field or from ownerEmail/ownerName
      let ownerName = shop.ownerName || 'Unknown';
      let ownerEmail = shop.ownerEmail || 'Unknown';
      
      // If we have a valid owner ID, try to get the owner details
      if (shop.owner && /^[0-9a-fA-F]{24}$/.test(shop.owner.toString())) {
        try {
          const owner = await User.findById(shop.owner);
          if (owner) {
            ownerName = owner.name;
            ownerEmail = owner.email;
          }
        } catch (error) {
          console.error('Error fetching owner:', error);
        }
      }
      
      // Return formatted shop data
      return {
        _id: shop._id,
        name: shop.name,
        description: shop.description,
        logo: shop.media?.logo || '/images/default-shop.png',
        status: shop.status,
        isVerified: shop.verification?.isVerified || false,
        createdAt: shop.createdAt,
        ownerName,
        ownerEmail,
        productCount,
        rating: shop.rating?.average || 0,
        totalSales: shop.statistics?.totalSales || 0
      };
    }));
    
    // Sort shops to show inactive (pending) shops first
    shops.sort((a, b) => {
      // First sort by status - put inactive (pending) first
      if (a.status === 'inactive' && b.status !== 'inactive') return -1;
      if (a.status !== 'inactive' && b.status === 'inactive') return 1;
      // Then sort by creation date (newest first)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return NextResponse.json(shops);
  } catch (error) {
    console.error('Error fetching shops:', error);
    return NextResponse.json(
      { error: 'Error fetching shops' },
      { status: 500 }
    );
  }
}

// Update shop status
export async function PATCH(req) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.role.toUpperCase() !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admins can update shop status' },
        { status: 403 }
      );
    }

    const data = await req.json();
    const { shopId, status, message, notifySeller = false } = data;

    if (!shopId || !status) {
      return NextResponse.json(
        { error: 'Shop ID and status are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // First, find the shop to get the owner information
    const existingShop = await Shop.findById(shopId).populate('owner');
    
    if (!existingShop) {
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 404 }
      );
    }
    
    // Create update object
    const updateData = { 
      status,
      'verification.isVerified': status === 'active',
      'verification.verifiedAt': status === 'active' ? new Date() : null,
      $push: {
        statusHistory: {
          status,
          timestamp: new Date(),
          message: message || `Shop ${status} by admin`,
          updatedBy: session.user.email // Store email instead of ID for test accounts
        }
      }
    };
    
    // Only set verifiedBy if it's a valid ObjectId to avoid casting errors
    if (status === 'active') {
      // For test accounts, store the email instead of trying to use it as an ObjectId
      if (/^[0-9a-fA-F]{24}$/.test(session.user.id)) {
        updateData['verification.verifiedBy'] = session.user.id;
      } else {
        // For test accounts, store the admin's email in a separate field
        updateData['verifiedByEmail'] = session.user.email;
      }
    }
    
    // Update the shop status
    const shop = await Shop.findByIdAndUpdate(
      shopId,
      updateData,
      { new: true }
    );

    // Create notification for the shop owner if requested
    if (notifySeller && existingShop.owner) {
      try {
        // Create a notification in the database
        // This is a simplified version - in a real app, you'd have a Notification model
        await User.findByIdAndUpdate(
          existingShop.owner._id,
          {
            $push: {
              notifications: {
                type: 'SHOP_STATUS_CHANGE',
                title: `Shop ${status === 'active' ? 'Approved' : status === 'rejected' ? 'Rejected' : 'Status Updated'}`,
                message: message || `Your shop "${existingShop.name}" has been ${status === 'active' ? 'approved' : status}.`,
                isRead: false,
                createdAt: new Date()
              }
            }
          }
        );
        
        console.log(`Notification sent to seller (${existingShop.owner.email}) about shop status change to ${status}`);
      } catch (notificationError) {
        console.error('Error creating notification:', notificationError);
        // Continue execution even if notification fails
      }
    }

    return NextResponse.json({
      success: true,
      message: `Shop status updated to ${status}`,
      shop
    });
  } catch (error) {
    console.error('Error updating shop:', error);
    return NextResponse.json(
      { error: 'Error updating shop' },
      { status: 500 }
    );
  }
} 