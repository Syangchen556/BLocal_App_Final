import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Shop from '@/models/Shop';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'SELLER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    // Get seller's shop
    const shop = await Shop.findOne({ owner: session.user.id });
    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const dateRange = searchParams.get('dateRange');
    const search = searchParams.get('search');

    // Build query
    let query = {
      'items.shop': shop._id
    };

    // Add status filter
    if (status) {
      query.status = status;
    }

    // Add date range filter
    if (dateRange) {
      const now = new Date();
      let startDate;

      switch (dateRange) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        default:
          startDate = null;
      }

      if (startDate) {
        query.createdAt = { $gte: startDate };
      }
    }

    // Add search filter
    if (search) {
      query.$or = [
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.email': { $regex: search, $options: 'i' } },
        { _id: { $regex: search, $options: 'i' } }
      ];
    }

    // Fetch orders
    const orders = await Order.find(query)
      .populate('customer', 'name email')
      .populate('items.product', 'name price')
      .sort({ createdAt: -1 });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching seller orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 