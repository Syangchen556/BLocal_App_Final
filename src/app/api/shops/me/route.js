import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/mongodb';
import Shop from '@/models/Shop';
import Product from '@/models/Product';
import Order from '@/models/Order';

// GET /api/shops/me - Get seller's own shop
export async function GET(request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role.toUpperCase() !== 'SELLER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    // Get seller's shop - handle both ObjectId and email-based accounts
    let shop;
    
    // First try to find by email for test accounts
    shop = await Shop.findOne({ ownerEmail: session.user.email });
    
    // If not found and we have a valid ObjectId, try to find by owner ID
    if (!shop && /^[0-9a-fA-F]{24}$/.test(session.user.id)) {
      shop = await Shop.findOne({ owner: session.user.id });
    }
    
    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    // Get shop statistics
    const totalProducts = await Product.countDocuments({ shop: shop._id });
    
    // Get orders for this shop
    const orders = await Order.find({ 'items.shop': shop._id });
    
    // Calculate total orders and sales
    const totalOrders = orders.length;
    const totalSales = orders.reduce((sum, order) => sum + order.total, 0);

    // Get recent orders (last 5)
    const recentOrders = await Order.find({ 'items.shop': shop._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('customer', 'name email')
      .select('_id status total createdAt');

    return NextResponse.json({
      shop,
      stats: {
        totalProducts,
        totalOrders,
        totalSales,
        recentOrders
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching shop data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/shops/me - Update seller's own shop
export async function PUT(request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.role.toUpperCase() !== 'SELLER') {
      return NextResponse.json(
        { error: 'Only sellers can update shop data' },
        { status: 403 }
      );
    }

    const data = await request.json();
    await dbConnect();

    // Get seller's shop - handle both ObjectId and email-based accounts
    let shop;
    
    // First try to find by email for test accounts
    shop = await Shop.findOne({ ownerEmail: session.user.email });
    
    // If not found and we have a valid ObjectId, try to find by owner ID
    if (!shop && /^[0-9a-fA-F]{24}$/.test(session.user.id)) {
      shop = await Shop.findOne({ owner: session.user.id });
    }

    if (!shop) {
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 404 }
      );
    }

    // Update shop data
    shop.name = data.name;
    shop.description = data.description;
    shop.address = data.address;
    shop.phone = data.phone;
    shop.email = data.email;
    shop.updatedAt = new Date();

    await shop.save();

    // Get updated statistics
    const [totalProducts, totalOrders, orders] = await Promise.all([
      Product.countDocuments({ shop: shop._id }),
      Order.countDocuments({ 'items.shop': shop._id }),
      Order.find({ 'items.shop': shop._id })
    ]);

    const totalSales = orders.reduce((sum, order) => {
      return sum + order.items.reduce((itemSum, item) => {
        return itemSum + (item.shop.toString() === shop._id.toString() ? item.price * item.quantity : 0);
      }, 0);
    }, 0);

    return NextResponse.json({
      ...shop.toObject(),
      totalProducts,
      totalOrders,
      totalSales
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating shop:', error);
    return NextResponse.json(
      { error: 'Error updating shop' },
      { status: 500 }
    );
  }
}