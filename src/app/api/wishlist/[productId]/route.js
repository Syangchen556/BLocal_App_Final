import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/mongodb';
import Wishlist from '@/models/Wishlist';
import User from '@/models/User';
import mongoose from 'mongoose';

export async function DELETE(req, { params }) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { productId } = params;

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
        return NextResponse.json({
          message: 'Item removed from wishlist',
          success: true
        });
      }
    }

    const wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      return NextResponse.json(
        { error: 'Wishlist not found' },
        { status: 404 }
      );
    }

    // Remove item from wishlist
    wishlist.items = wishlist.items.filter(
      item => item.product.toString() !== productId
    );

    await wishlist.save();

    return NextResponse.json(wishlist);
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return NextResponse.json(
      { error: 'Error removing from wishlist' },
      { status: 500 }
    );
  }
} 