import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';

// GET /api/cart - Get user's cart
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await connectDB();
    const cart = await db.collection('carts').findOne({ userId: session.user.id });
    
    return NextResponse.json({ items: cart?.items || [] });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/cart - Add item to cart
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId, quantity } = await request.json();
    if (!productId || !quantity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = await connectDB();
    const cart = await db.collection('carts').findOne({ userId: session.user.id });

    if (!cart) {
      // Create new cart
      await db.collection('carts').insertOne({
        userId: session.user.id,
        items: [{ productId, quantity }]
      });
    } else {
      // Update existing cart
      const existingItem = cart.items.find(item => item.productId === productId);
      
      if (existingItem) {
        // Update quantity if item exists
        await db.collection('carts').updateOne(
          { userId: session.user.id, 'items.productId': productId },
          { $set: { 'items.$.quantity': existingItem.quantity + quantity } }
        );
      } else {
        // Add new item
        await db.collection('carts').updateOne(
          { userId: session.user.id },
          { $push: { items: { productId, quantity } } }
        );
      }
    }

    return NextResponse.json({ message: 'Cart updated successfully' });
  } catch (error) {
    console.error('Error updating cart:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/cart - Update item quantity
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId, quantity } = await request.json();
    if (!productId || !quantity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = await connectDB();
    await db.collection('carts').updateOne(
      { userId: session.user.id, 'items.productId': productId },
      { $set: { 'items.$.quantity': quantity } }
    );

    return NextResponse.json({ message: 'Cart updated successfully' });
  } catch (error) {
    console.error('Error updating cart:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/cart - Clear cart or remove item
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await connectDB();
    const { productId } = await request.json();

    if (productId) {
      // Remove specific item
      await db.collection('carts').updateOne(
        { userId: session.user.id },
        { $pull: { items: { productId } } }
      );
    } else {
      // Clear entire cart
      await db.collection('carts').deleteOne({ userId: session.user.id });
    }

    return NextResponse.json({ message: 'Cart updated successfully' });
  } catch (error) {
    console.error('Error updating cart:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 