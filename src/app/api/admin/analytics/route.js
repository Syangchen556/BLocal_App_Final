import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import { authOptions } from '@/lib/auth';
import User from '@/models/User';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Shop from '@/models/Shop';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
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

    // Fetch data
    const [users, orders, products, shops, previousUsers, previousOrders, previousProducts, previousShops] = await Promise.all([
      // Current period data
      User.find({ createdAt: { $gte: startDate } }),
      Order.find({ createdAt: { $gte: startDate } }),
      Product.find({ createdAt: { $gte: startDate } }),
      Shop.find({ createdAt: { $gte: startDate } }),
      // Previous period data for growth calculation
      User.find({ createdAt: { $lt: startDate } }),
      Order.find({ createdAt: { $lt: startDate } }),
      Product.find({ createdAt: { $lt: startDate } }),
      Shop.find({ createdAt: { $lt: startDate } })
    ]);

    // Calculate overview statistics
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const previousRevenue = previousOrders.reduce((sum, order) => sum + order.total, 0);

    const overview = {
      totalUsers: users.length,
      totalOrders: orders.length,
      totalRevenue,
      totalProducts: products.length,
      userGrowth: calculateGrowth(users.length, previousUsers.length),
      orderGrowth: calculateGrowth(orders.length, previousOrders.length),
      revenueGrowth: calculateGrowth(totalRevenue, previousRevenue),
      productGrowth: calculateGrowth(products.length, previousProducts.length),
    };

    // Calculate sales data
    const salesData = await calculateSalesData(startDate, timeRange);

    // Calculate top products
    const topProducts = await calculateTopProducts(startDate);

    // Calculate top categories
    const topCategories = await calculateTopCategories(startDate);

    // Calculate user statistics
    const userStats = {
      total: users.length,
      buyers: users.filter(user => user.role === 'BUYER').length,
      sellers: users.filter(user => user.role === 'SELLER').length,
      admins: users.filter(user => user.role === 'ADMIN').length,
    };

    // Calculate order statistics
    const orderStats = {
      total: orders.length,
      pending: orders.filter(order => order.status === 'pending').length,
      processing: orders.filter(order => order.status === 'processing').length,
      delivered: orders.filter(order => order.status === 'delivered').length,
      cancelled: orders.filter(order => order.status === 'cancelled').length,
    };

    return NextResponse.json({
      overview,
      salesData,
      topProducts,
      topCategories,
      userStats,
      orderStats,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to calculate growth percentage
function calculateGrowth(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

// Helper function to calculate sales data
async function calculateSalesData(startDate, timeRange) {
  const salesData = [];
  const now = new Date();
  let interval;

  switch (timeRange) {
    case 'quarter':
      interval = 'week';
      break;
    case 'year':
      interval = 'month';
      break;
    default: // month
      interval = 'day';
  }

  // Generate date points based on interval
  let currentDate = new Date(startDate);
  while (currentDate <= now) {
    const nextDate = new Date(currentDate);
    switch (interval) {
      case 'day':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'week':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'month':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
    }

    // Get orders for this interval
    const orders = await Order.find({
      createdAt: {
        $gte: currentDate,
        $lt: nextDate
      }
    });

    // Calculate sales and orders for this interval
    const sales = orders.reduce((sum, order) => sum + order.total, 0);
    salesData.push({
      date: currentDate.toISOString().split('T')[0],
      sales,
      orders: orders.length
    });

    currentDate = nextDate;
  }

  return salesData;
}

// Helper function to calculate top products
async function calculateTopProducts(startDate) {
  const orders = await Order.find({
    createdAt: { $gte: startDate }
  }).populate('items.product');

  // Aggregate product sales
  const productSales = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      const productId = item.product._id.toString();
      if (!productSales[productId]) {
        productSales[productId] = {
          name: item.product.name,
          sales: 0,
          revenue: 0
        };
      }
      productSales[productId].sales += item.quantity;
      productSales[productId].revenue += item.price * item.quantity;
    });
  });

  // Convert to array and sort by sales
  return Object.values(productSales)
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 10);
}

// Helper function to calculate top categories
async function calculateTopCategories(startDate) {
  const orders = await Order.find({
    createdAt: { $gte: startDate }
  }).populate('items.product');

  // Aggregate category data
  const categoryData = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      const category = item.product.category;
      if (!categoryData[category]) {
        categoryData[category] = {
          name: category,
          products: new Set(),
          sales: 0
        };
      }
      categoryData[category].products.add(item.product._id.toString());
      categoryData[category].sales += item.quantity;
    });
  });

  // Convert to array and format data
  return Object.values(categoryData)
    .map(category => ({
      name: category.name,
      products: category.products.size,
      sales: category.sales
    }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 10);
} 