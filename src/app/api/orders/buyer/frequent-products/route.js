import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'BUYER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    // Get all orders for the buyer
    const orders = await Order.find({ customer: session.user.id })
      .populate('items.product', 'name')
      .sort({ createdAt: -1 });

    // Calculate product frequency
    const productFrequency = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const productId = item.product._id.toString();
        if (!productFrequency[productId]) {
          productFrequency[productId] = {
            name: item.product.name,
            purchases: 0,
            lastPurchased: order.createdAt
          };
        }
        productFrequency[productId].purchases += item.quantity;
        if (order.createdAt > productFrequency[productId].lastPurchased) {
          productFrequency[productId].lastPurchased = order.createdAt;
        }
      });
    });

    // Convert to array and sort by purchases
    const frequentProducts = Object.values(productFrequency)
      .sort((a, b) => b.purchases - a.purchases)
      .slice(0, 5); // Get top 5 most frequently bought products

    return NextResponse.json(frequentProducts);
  } catch (error) {
    console.error('Error fetching frequent products:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 