import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Get orders for the current user
export async function GET(req) {
  try {
    const session = await auth(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await connectDB();
    const orders = await db.collection('orders')
      .find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Error fetching orders' }, { status: 500 });
  }
}

// Create a new order
export async function POST(req) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { items, total } = await req.json();
    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Missing or invalid items' }, { status: 400 });
    }

    const db = await connectDB();
    
    // Generate a unique order number
    const orderNumber = 'ORD-' + Date.now().toString().slice(-8) + '-' + Math.floor(Math.random() * 1000);
    
    const order = {
      userId: session.user.id,
      orderNumber,
      items,
      status: 'pending',
      paymentStatus: 'unpaid',
      total: total || items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('orders').insertOne(order);

    // Don't clear the cart here - we'll do it after payment is confirmed
    // The cart will be cleared in the cart page after order is placed

    return NextResponse.json({
      message: 'Order created successfully',
      orderId: result.insertedId.toString(),
      orderNumber: orderNumber
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Error creating order' }, { status: 500 });
  }
}

// Update order status
export async function PUT(req) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId, status, paymentStatus } = await req.json();
    if (!orderId) {
      return NextResponse.json({ error: 'Missing order ID' }, { status: 400 });
    }

    const db = await connectDB();
    const updateData = {
      updatedAt: new Date()
    };

    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const result = await db.collection('orders').updateOne(
      { _id: new ObjectId(orderId), userId: session.user.id },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Order not found or not authorized' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Order updated successfully'
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Error updating order' }, { status: 500 });
  }
}