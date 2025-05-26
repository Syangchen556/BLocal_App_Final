import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/mongodb';
import Shop from '@/models/Shop';
import User from '@/models/User';

// Manual validation function
function validateShopData(data) {
  const errors = [];
  
  // Validate required fields
  if (!data.name || data.name.length < 3 || data.name.length > 50) {
    errors.push('Name must be between 3 and 50 characters');
  }
  
  if (!data.description || data.description.length < 10 || data.description.length > 500) {
    errors.push('Description must be between 10 and 500 characters');
  }
  
  // Validate address if provided
  if (data.address) {
    if (!data.address.street) errors.push('Street address is required');
    if (!data.address.city) errors.push('City is required');
    if (!data.address.state) errors.push('State is required');
    if (!data.address.zipCode) errors.push('ZIP code is required');
  } else {
    errors.push('Address is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// GET /api/shops - Get all shops (filtered by user role)
export async function GET(request) {
  try {
    const session = await auth();
    await dbConnect();
    
    const query = {};
    const options = {
      populate: [
        {
          path: 'owner',
          select: 'id name email image'
        },
        {
          path: 'products',
          select: 'id name price images'
        }
      ],
      sort: { createdAt: -1 }
    };

    // If admin, return all shops
    if (session?.user?.role === 'ADMIN') {
      const shops = await Shop.find(query, null, options);
      return NextResponse.json(shops);
    }

    // If seller, return their shop
    if (session?.user?.role === 'SELLER') {
      const shop = await Shop.findOne({ owner: session.user.id }, null, options);
      return NextResponse.json(shop ? [shop] : []);
    }

    // For regular users, only return approved and active shops
    query.isActive = true;
    query.status = 'APPROVED';
    const shops = await Shop.find(query, null, options);
    return NextResponse.json(shops);

  } catch (error) {
    console.error('Error fetching shops:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shops', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/shops - Create a new shop
export async function POST(request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'SELLER') {
      return NextResponse.json(
        { error: 'Only sellers can create shops' },
        { status: 403 }
      );
    }

    await dbConnect();

    // Check if user already has a shop
    // For test accounts, we need to handle the case where the ID is an email
    let existingShop;
    try {
      // First try to find by email for test accounts
      existingShop = await Shop.findOne({ ownerEmail: session.user.email });
      
      // If not found, try to find by owner ID (for real MongoDB ObjectIds)
      if (!existingShop && session.user.id.length === 24) {
        existingShop = await Shop.findOne({ owner: session.user.id });
      }
      
      if (existingShop) {
        return NextResponse.json(
          { error: 'You already have a shop' },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error('Error checking existing shop:', error);
      // Continue execution even if check fails
    }

    let data;
    try {
      data = await request.json();
      console.log('Received shop data:', data);
      
      // Validate input data
      const validation = validateShopData(data);
      if (!validation.isValid) {
        console.log('Validation failed:', validation.errors);
        return NextResponse.json(
          { error: 'Invalid shop data', details: validation.errors },
          { status: 400 }
        );
      }
    } catch (jsonError) {
      console.error('Error parsing JSON:', jsonError);
      return NextResponse.json(
        { error: 'Invalid JSON data', details: jsonError.message },
        { status: 400 }
      );
    }

    // Create shop request in the database
    console.log('Creating shop request with data:', {
      ...data,
      owner: session.user.id,
      ownerEmail: session.user.email
    });
    
    // Prepare shop data
    const shopData = {
      ...data,
      status: 'inactive', // Use 'inactive' instead of 'PENDING' to avoid enum validation issues
      isActive: false,   // Shop is not active until approved
      ownerEmail: session.user.email, // Always store the email for reference
      ownerName: session.user.name,   // Store the name for reference
      verification: {
        isVerified: false,
        verifiedAt: null,
        verifiedBy: null
      },
      statistics: {
        totalSales: 0,
        totalOrders: 0,
        totalProducts: 0
      },
      rating: {
        average: 0,
        count: 0
      },
      statusHistory: [{
        status: 'inactive',
        timestamp: new Date(),
        message: 'Shop registration submitted for admin review',
        updatedBy: session.user.email // Use email as updatedBy for test accounts
      }]
    };
    
    // For test accounts, we need to handle the case where the ID is an email
    try {
      // Check if the ID is a valid MongoDB ObjectId
      if (/^[0-9a-fA-F]{24}$/.test(session.user.id)) {
        shopData.owner = session.user.id;
      } else {
        // For test accounts, create a temporary ObjectId
        const mongoose = await import('mongoose');
        shopData.owner = new mongoose.Types.ObjectId();
        console.log('Created temporary ObjectId for test account:', shopData.owner);
      }
    } catch (error) {
      console.error('Error setting owner ID:', error);
      // Create a fallback ObjectId if needed
      const mongoose = await import('mongoose');
      shopData.owner = new mongoose.Types.ObjectId();
    }
    
    // Create the shop request
    const shopRequest = await Shop.create(shopData);

    // Populate owner details
    await shopRequest.populate({
      path: 'owner',
      select: 'id name email image'
    });
    
    // Return success response with the request ID
    return NextResponse.json({
      success: true,
      message: 'Shop request submitted successfully. Waiting for admin approval.',
      requestId: shopRequest._id,
      status: 'pending'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating shop:', error);
    return NextResponse.json(
      { error: 'Failed to create shop', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/shops - Delete a shop
export async function DELETE(request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'SELLER') {
      return NextResponse.json(
        { error: 'Only sellers can manage shops' },
        { status: 403 }
      );
    }

    await dbConnect();

    const shop = await Shop.findOne({ owner: session.user.id });
    if (!shop) {
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 404 }
      );
    }

    // Soft delete by updating status
    shop.status = 'DELETED';
    shop.isActive = false;
    shop.statusHistory.push({
      status: 'DELETED',
      timestamp: new Date(),
      message: 'Shop deleted by owner',
      updatedBy: session.user.id
    });
    await shop.save();

    return NextResponse.json({ message: 'Shop deleted successfully' });
  } catch (error) {
    console.error('Error deleting shop:', error);
    return NextResponse.json(
      { error: 'Failed to delete shop', details: error.message },
      { status: 500 }
    );
  }
} 