import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Shop from '@/models/Shop';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { orderId } = params;

    // Find order
    const order = await Order.findById(orderId)
      .populate('customer', 'name email phone')
      .populate('items.product', 'name images price')
      .populate('items.shop', 'name');

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check if user is authorized to view this order
    if (session.user.role === 'SELLER') {
      // Get seller's shop
      const shop = await Shop.findOne({ owner: session.user.id });
      if (!shop) {
        return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
      }

      // Check if order contains items from seller's shop
      const hasShopItems = order.items.some(item => item.shop._id.toString() === shop._id.toString());
      if (!hasShopItems) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else if (session.user.role === 'BUYER') {
      // Check if order belongs to buyer
      if (order.customer._id.toString() !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 