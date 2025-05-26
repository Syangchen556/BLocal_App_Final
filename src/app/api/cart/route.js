import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import mongoose from 'mongoose';

// GET /api/cart - Get user's cart
export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await connectDB();
    
    // Handle both ObjectId and email-based user IDs
    let userId = session.user.id;
    
    const cart = await db.collection('carts').findOne({ userId: userId });

    return NextResponse.json({ items: cart?.items || [] });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/cart - Add item to cart
export async function POST(request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId, quantity } = await request.json();
    if (!productId || !quantity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = await connectDB();
    
    // Handle both ObjectId and email-based user IDs
    let userId = session.user.id;
    
    const cart = await db.collection('carts').findOne({ userId: userId });

    if (!cart) {
      // Create new cart
      await db.collection('carts').insertOne({
        userId: userId,
        items: [{ productId, quantity, product: productDetails }],
      });
    } else {
      const existingItem = cart.items.find(item => item.productId === productId);

      if (existingItem) {
        // Update quantity and product details
        await db.collection('carts').updateOne(
          { userId: userId, 'items.productId': productId },
          { 
            $set: { 
              'items.$.quantity': existingItem.quantity + quantity,
              'items.$.product': productDetails
            } 
          }
        );
      } else {
        // Add item
        await db.collection('carts').updateOne(
          { userId: userId },
          { $push: { items: { productId, quantity, product: productDetails } } }
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
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId, quantity } = await request.json();
    if (!productId || !quantity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = await connectDB();
    
    // Handle both ObjectId and email-based user IDs
    let userId = session.user.id;
    
    await db.collection('carts').updateOne(
      { userId: userId, 'items.productId': productId },
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
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await connectDB();
    const { productId } = await request.json();
    
    // Handle both ObjectId and email-based user IDs
    let userId = session.user.id;

    if (productId) {
      // Remove specific item
      await db.collection('carts').updateOne(
        { userId: userId },
        { $pull: { items: { productId } } }
      );
    } else {
      // Clear cart
      await db.collection('carts').deleteOne({ userId: userId });
    }

    return NextResponse.json({ message: 'Cart updated successfully' });
  } catch (error) {
    console.error('Error updating cart:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
