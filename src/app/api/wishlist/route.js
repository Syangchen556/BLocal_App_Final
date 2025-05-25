import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Wishlist from '@/models/Wishlist';

// Get user's wishlist
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    let wishlist = await Wishlist.findOne({ user: session.user.id })
      .populate({
        path: 'items.product',
        select: 'name description price imageUrl shop',
        populate: {
          path: 'shop',
          select: 'name'
        }
      });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: session.user.id,
        items: []
      });
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
    const session = await getServerSession(authOptions);
    
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

    await connectDB();

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