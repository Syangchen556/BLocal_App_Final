import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Shop from '@/models/Shop';

// GET /api/shops/[shopId]/orders - Get shop's orders
export async function GET(request, { params }) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Verify shop ownership
    const shop = await Shop.findOne({
      _id: params.shopId,
      owner: session.user.id
    });

    if (!shop) {
      return NextResponse.json(
        { error: 'Shop not found or unauthorized' },
        { status: 404 }
      );
    }

    // Get orders containing items from this shop
    const orders = await Order.find({
      'items.shop': params.shopId
    })
      .populate({
        path: 'items.product',
        select: 'name media.mainImage'
      })
      .populate({
        path: 'user',
        select: 'name email'
      })
      .sort({ createdAt: -1 });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching shop orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shop orders' },
      { status: 500 }
    );
  }
}

// PUT /api/shops/[shopId]/orders/[orderId] - Update order status
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Verify shop ownership
    const shop = await Shop.findOne({
      _id: params.shopId,
      owner: session.user.id
    });

    if (!shop) {
      return NextResponse.json(
        { error: 'Shop not found or unauthorized' },
        { status: 404 }
      );
    }

    const { orderId } = params;
    const { status, note } = await request.json();

    // Validate status transition
    const validStatuses = ['PROCESSING', 'SHIPPED', 'DELIVERED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Update order status
    const order = await Order.findOneAndUpdate(
      {
        _id: orderId,
        'items.shop': params.shopId
      },
      {
        $set: { status },
        $push: {
          statusHistory: {
            status,
            note,
            timestamp: new Date()
          }
        }
      },
      { new: true }
    )
      .populate({
        path: 'items.product',
        select: 'name media.mainImage'
      })
      .populate({
        path: 'user',
        select: 'name email'
      });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    );
  }
} 