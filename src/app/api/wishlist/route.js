import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/mongodb';
import Wishlist from '@/models/Wishlist';
import User from '@/models/User';
import mongoose from 'mongoose';

// Get user's wishlist
export async function GET(req) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Handle both ObjectId and email-based user IDs
    let userId = session.user.id;
    let userQuery;
    
    // Check if the ID is a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(userId)) {
      userQuery = { _id: userId };
    } else {
      // If not a valid ObjectId, assume it's an email (for test accounts)
      userQuery = { email: userId };
      
      // Try to find the user by email
      const user = await User.findOne(userQuery);
      if (user) {
        userId = user._id;
      } else {
        // For test accounts that don't exist in the database yet
        // Create a temporary wishlist with the email as a string identifier
        return NextResponse.json({
          items: []
        });
      }
    }

    let wishlist = await Wishlist.findOne({ user: userId })
      .populate({
        path: 'items.product',
        select: 'name description price imageUrl shop',
        populate: {
          path: 'shop',
          select: 'name'
        }
      });

    if (!wishlist) {
      // Only create a new wishlist if we have a valid user ID
      if (mongoose.Types.ObjectId.isValid(userId)) {
        wishlist = await Wishlist.create({
          user: userId,
          items: []
        });
      } else {
        // Return an empty wishlist for test accounts
        wishlist = { items: [] };
      }
    }

    return NextResponse.json(wishlist);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json(
      { error: 'Error fetching wishlist' },
      { status: 500 }
    );
  }
}

// Add or remove item from wishlist
export async function POST(req) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { productId, action } = await req.json();

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    let wishlist = await Wishlist.findOne({ user: session.user.id });

    if (!wishlist) {
      wishlist = new Wishlist({
        user: session.user.id,
        items: []
      });
    }

    if (action === 'remove') {
      // Remove item from wishlist
      wishlist.items = wishlist.items.filter(
        item => item.product.toString() !== productId
      );
    } else {
      // Add item to wishlist if it doesn't exist
      const exists = wishlist.items.some(item => 
        item.product.toString() === productId
      );

      if (!exists) {
        wishlist.items.push({
          product: productId,
          addedAt: new Date()
        });
      }
    }

    await wishlist.save();

    // Populate the product details before sending response
    await wishlist.populate({
      path: 'items.product',
      select: 'name description price imageUrl shop',
      populate: {
        path: 'shop',
        select: 'name'
      }
    });

    return NextResponse.json(wishlist);
  } catch (error) {
    console.error('Error updating wishlist:', error);
    return NextResponse.json(
      { error: 'Error updating wishlist' },
      { status: 500 }
    );
  }
} 