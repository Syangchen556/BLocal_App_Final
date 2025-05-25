import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import { authOptions } from '@/lib/auth';
import User from '@/models/User';
import Order from '@/models/Order';

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const { userId } = params;

    // Check if user is authorized (either admin or the user themselves)
    if (!session || (session.user.role !== 'ADMIN' && session.user._id.toString() !== userId)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Get time range from query parameters
    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get('timeRange') || 'month';

    // Calculate date range
    const now = new Date();
    let startDate;
    switch (timeRange) {
      case 'quarter':
        startDate = new Date(now.setMonth(now.getMonth() - 3));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default: // month
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }

    // Fetch orders
    const orders = await Order.find({
      user: userId,
      createdAt: { $gte: startDate }
    }).populate('items.product');

    // Calculate overview statistics
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    // Calculate category preferences
    const categoryPreferences = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const category = item.product.category;
        if (!categoryPreferences[category]) {
          categoryPreferences[category] = {
            count: 0,
            total: 0
          };
        }
        categoryPreferences[category].count += item.quantity;
        categoryPreferences[category].total += item.price * item.quantity;
      });
    });

    // Convert category preferences to array and sort by count
    const topCategories = Object.entries(categoryPreferences)
      .map(([name, data]) => ({
        name,
        count: data.count,
        total: data.total
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate purchase frequency
    const purchaseFrequency = await calculatePurchaseFrequency(userId, startDate);

    // Calculate average order size by category
    const averageOrderSizeByCategory = Object.entries(categoryPreferences)
      .map(([name, data]) => ({
        name,
        average: data.total / data.count
      }))
      .sort((a, b) => b.average - a.average);

    return NextResponse.json({
      overview: {
        totalOrders,
        totalSpent,
        averageOrderValue
      },
      topCategories,
      purchaseFrequency,
      averageOrderSizeByCategory
    });
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to calculate purchase frequency
async function calculatePurchaseFrequency(userId, startDate) {
  const orders = await Order.find({
    user: userId,
    createdAt: { $gte: startDate }
  }).sort({ createdAt: 1 });

  if (orders.length < 2) {
    return {
      average: 0,
      trend: 'insufficient_data'
    };
  }

  // Calculate time differences between consecutive orders
  const timeDifferences = [];
  for (let i = 1; i < orders.length; i++) {
    const diff = orders[i].createdAt - orders[i - 1].createdAt;
    timeDifferences.push(diff);
  }

  // Calculate average time between orders (in days)
  const averageTimeBetweenOrders = timeDifferences.reduce((sum, diff) => sum + diff, 0) / timeDifferences.length / (1000 * 60 * 60 * 24);

  // Determine trend
  let trend;
  if (timeDifferences.length >= 3) {
    const recentDiff = timeDifferences[timeDifferences.length - 1] / (1000 * 60 * 60 * 24);
    if (recentDiff < averageTimeBetweenOrders * 0.8) {
      trend = 'increasing';
    } else if (recentDiff > averageTimeBetweenOrders * 1.2) {
      trend = 'decreasing';
    } else {
      trend = 'stable';
    }
  } else {
    trend = 'insufficient_data';
  }

  return {
    average: averageTimeBetweenOrders,
    trend
  };
}