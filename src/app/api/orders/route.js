const { NextResponse } = require('next/server');
const { getServerSession } = require('next-auth/next');
const { authOptions } = require('@/lib/auth');
const { connectDB } = require('@/lib/mongodb');

// Get orders for the current user
async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
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
async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { items, shippingAddress, paymentMethod } = await req.json();
    if (!items || !shippingAddress || !paymentMethod) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = await connectDB();
    const order = {
      userId: session.user.id,
      items,
      shippingAddress,
      paymentMethod,
      status: 'pending',
      total: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('orders').insertOne(order);

    // Clear the user's cart after successful order
    await db.collection('carts').updateOne(
      { userId: session.user.id },
      { $set: { items: [], updatedAt: new Date() } }
    );

    return NextResponse.json({
      message: 'Order created successfully',
      orderId: result.insertedId
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Error creating order' }, { status: 500 });
  }
}

module.exports = { GET, POST }; 