import { NextResponse } from 'next/server';
<<<<<<< HEAD
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
=======
import { getServerSession } from 'next-auth/next';
import connectDB from '@/lib/mongodb';
import Shop from '@/models/Shop';

// Get shop by ID
export async function GET(req, { params }) {
  try {
    await connectDB();

    const shop = await Shop.findById(params.shopId)
      .populate({
        path: 'owner',
        select: 'id name email image'
      })
      .populate('products');
>>>>>>> ce08c47481366906128db17c6bd3eaf53dc5d6a3

    if (!shop) {
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 404 }
      );
    }

<<<<<<< HEAD
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
=======
    // If shop is not active or approved, only owner and admin can view it
    if (!shop.isActive || shop.status !== 'APPROVED') {
      const session = await getServerSession();
      const isOwner = session?.user?.id === shop.owner.id;
      const isAdmin = session?.user?.role === 'ADMIN';

      if (!isOwner && !isAdmin) {
        return NextResponse.json(
          { error: 'Shop not found' },
          { status: 404 }
        );
      }
>>>>>>> ce08c47481366906128db17c6bd3eaf53dc5d6a3
    }

    return NextResponse.json(shop);
  } catch (error) {
    console.error('Error fetching shop:', error);
    return NextResponse.json(
<<<<<<< HEAD
      { error: 'Internal server error' },
=======
      { error: 'Failed to fetch shop' },
>>>>>>> ce08c47481366906128db17c6bd3eaf53dc5d6a3
      { status: 500 }
    );
  }
}

<<<<<<< HEAD
export async function PUT(request, { params }) {
=======
// Update shop by ID
export async function PATCH(req, { params }) {
>>>>>>> ce08c47481366906128db17c6bd3eaf53dc5d6a3
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

<<<<<<< HEAD
    const shop = await Shop.findOne({
      _id: params.shopId,
      owner: session.user.id
    });

    if (!shop) {
      return NextResponse.json(
        { error: 'Shop not found or unauthorized' },
=======
    const shop = await Shop.findById(params.shopId);
    if (!shop) {
      return NextResponse.json(
        { error: 'Shop not found' },
>>>>>>> ce08c47481366906128db17c6bd3eaf53dc5d6a3
        { status: 404 }
      );
    }

<<<<<<< HEAD
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
    console.error('Error updating shop:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
=======
    // Only shop owner and admin can update
    const isOwner = session.user.id === shop.owner.toString();
    const isAdmin = session.user.role === 'ADMIN';
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const data = await req.json();
    
    // If admin is updating status, add to status history
    if (isAdmin && data.status && data.status !== shop.status) {
      data.statusHistory = [
        ...shop.statusHistory,
        {
          status: data.status,
          timestamp: new Date(),
          message: data.statusMessage || `Shop status updated to ${data.status}`,
          updatedBy: session.user.id
        }
      ];
    }

    const updatedShop = await Shop.findByIdAndUpdate(
      params.shopId,
      { $set: data },
      { new: true }
    ).populate({
      path: 'owner',
      select: 'id name email image'
    });

    return NextResponse.json(updatedShop);
  } catch (error) {
    console.error('Error updating shop:', error);
    return NextResponse.json(
      { error: 'Failed to update shop' },
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
    console.error('Error deleting shop:', error);
    return NextResponse.json(
      { error: 'Failed to delete shop' },
>>>>>>> ce08c47481366906128db17c6bd3eaf53dc5d6a3
      { status: 500 }
    );
  }
} 