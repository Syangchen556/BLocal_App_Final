import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/mongodb';
import Order from '@/models/Order';

export async function GET(request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role.toUpperCase() !== 'BUYER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const dateRange = searchParams.get('dateRange');
    const search = searchParams.get('search');

    // Build query
    let query = {
      customer: session.user.id
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
        { 'items.product.name': { $regex: search, $options: 'i' } },
        { _id: { $regex: search, $options: 'i' } }
      ];
    }

    // Fetch orders with populated data
    const orders = await Order.find(query)
      .populate('items.product', 'name price images')
      .populate('items.shop', 'name')
      .sort({ createdAt: -1 });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching buyer orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 