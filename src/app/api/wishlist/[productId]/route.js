import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectDB from '@/lib/mongodb';
import Wishlist from '@/models/Wishlist';

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { productId } = params;

    await connectDB();

    const wishlist = await Wishlist.findOne({ user: session.user.id });

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