import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Shop from '@/models/Shop';
import Product from '@/models/Product';
import Order from '@/models/Order';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession();
    await connectDB();
    
    const shop = await Shop.findById(params.shopId)
      .populate('owner', 'name email image')
      .lean();

    if (!shop) {
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 404 }
      );
    }

    // If user is the shop owner, include additional data
    if (session?.user?.id === shop.owner._id.toString()) {
      const [totalProducts, totalOrders, orders] = await Promise.all([
        Product.countDocuments({ shop: params.shopId }),
        Order.countDocuments({ 'items.shop': params.shopId }),
        Order.find({ 'items.shop': params.shopId })
      ]);

      const totalSales = orders.reduce((sum, order) => {
        return sum + order.items.reduce((itemSum, item) => {
          return itemSum + (item.shop.toString() === params.shopId ? item.price * item.quantity : 0);
        }, 0);
      }, 0);

      return NextResponse.json({
        ...shop,
        totalProducts,
        totalOrders,
        totalSales
      });
    }

    // For public view, only return approved and active shops
    if (shop.status !== 'active' || !shop.isActive) {
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(shop);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    const data = await request.json();
    
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
      Product.countDocuments({ shop: params.shopId }),
      Order.countDocuments({ 'items.shop': params.shopId }),
      Order.find({ 'items.shop': params.shopId })
    ]);

    const totalSales = orders.reduce((sum, order) => {
      return sum + order.items.reduce((itemSum, item) => {
        return itemSum + (item.shop.toString() === params.shopId ? item.price * item.quantity : 0);
      }, 0);
    }, 0);

    return NextResponse.json({
      ...shop.toObject(),
      totalProducts,
      totalOrders,
      totalSales
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete shop by ID (Admin only)
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    await connectDB();

    const shop = await Shop.findByIdAndDelete(params.shopId);
    if (!shop) {
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Shop deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete shop' },
      { status: 500 }
    );
  }
} 