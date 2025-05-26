import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';

import Shop from '@/models/Shop';
import Product from '@/models/Product';
import Order from '@/models/Order';

export async function GET(req, { params }) {
  try {
    const session = await auth();
    const { shopId } = params;

    // Check if user is authorized (either admin or shop owner)
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 404 }
      );
    }

    if (!session || (session.user.role.toUpperCase() !== 'ADMIN' && session.user._id.toString() !== shop.owner.toString())) {
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
    const [products, orders, previousProducts, previousOrders] = await Promise.all([
      // Current period data
      Product.find({ shop: shopId, createdAt: { $gte: startDate } }),
      Order.find({ 'items.shop': shopId, createdAt: { $gte: startDate } }),
      // Previous period data for growth calculation
      Product.find({ shop: shopId, createdAt: { $lt: startDate } }),
      Order.find({ 'items.shop': shopId, createdAt: { $lt: startDate } })
    ]);

    // Calculate overview statistics
    const totalRevenue = orders.reduce((sum, order) => {
      const shopItems = order.items.filter(item => item.shop.toString() === shopId);
      return sum + shopItems.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0);
    }, 0);

    const previousRevenue = previousOrders.reduce((sum, order) => {
      const shopItems = order.items.filter(item => item.shop.toString() === shopId);
      return sum + shopItems.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0);
    }, 0);

    const overview = {
      totalProducts: products.length,
      totalOrders: orders.length,
      totalRevenue,
      productGrowth: calculateGrowth(products.length, previousProducts.length),
      orderGrowth: calculateGrowth(orders.length, previousOrders.length),
      revenueGrowth: calculateGrowth(totalRevenue, previousRevenue),
    };

    // Calculate sales data
    const salesData = await calculateSalesData(shopId, startDate, timeRange);

    // Calculate top products
    const topProducts = await calculateTopProducts(shopId, startDate);

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
      orderStats,
    });
  } catch (error) {
    console.error('Error fetching shop statistics:', error);
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
async function calculateSalesData(shopId, startDate, timeRange) {
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
      'items.shop': shopId,
      createdAt: {
        $gte: currentDate,
        $lt: nextDate
      }
    });

    // Calculate sales and orders for this interval
    const sales = orders.reduce((sum, order) => {
      const shopItems = order.items.filter(item => item.shop.toString() === shopId);
      return sum + shopItems.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0);
    }, 0);

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
async function calculateTopProducts(shopId, startDate) {
  const orders = await Order.find({
    'items.shop': shopId,
    createdAt: { $gte: startDate }
  }).populate('items.product');

  // Aggregate product sales
  const productSales = {};
  orders.forEach(order => {
    order.items
      .filter(item => item.shop.toString() === shopId)
      .forEach(item => {
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