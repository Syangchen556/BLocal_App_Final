import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectDB from '@/lib/mongodb';
import Cart from '@/models/Cart';

export async function GET(req) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const cart = await Cart.findOne({ user: session.user.id });
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