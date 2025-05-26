import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await connectDB();

    const { orderId } = params;

    // Find order
    const order = await db.collection('orders').findOne({ _id: new ObjectId(orderId) });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check if user is authorized to view this order
    if (session.user.role && session.user.role.toUpperCase() === 'SELLER') {
      // Get seller's shop
      const shop = await db.collection('shops').findOne({ ownerId: session.user.id });
      if (!shop) {
        return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
      }

      // Check if order contains items from seller's shop
      const hasShopItems = order.items.some(item => 
        item.shopId && item.shopId.toString() === shop._id.toString()
      );
      if (!hasShopItems) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else if (session.user.role && session.user.role.toUpperCase() === 'BUYER') {
      // Check if order belongs to buyer
      if (order.userId !== session.user.id) {
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