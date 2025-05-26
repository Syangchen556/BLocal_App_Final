import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/mongodb';
import Cart from '@/models/Cart';
import User from '@/models/User';
import mongoose from 'mongoose';

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
        return NextResponse.json({ count: 0 });
      }
    }

    const cart = await Cart.findOne({ user: userId });
    const count = cart ? cart.items.length : 0;

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error fetching cart count:', error);
    return NextResponse.json(
      { error: 'Error fetching cart count' },
      { status: 500 }
    );
  }
} 