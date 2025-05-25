import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

// GET /api/admin/products - Get all products
export async function GET(req) {
  try {
    const session = await getServerSession();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const products = await Product.find({})
      .populate('shop', 'name')
      .sort({ createdAt: -1 });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Error fetching products' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/products/[id] - Update product status
export async function PATCH(req) {
  try {
    const session = await getServerSession();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Product ID and status are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const product = await Product.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('shop', 'name');

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Error updating product' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/products/[id] - Delete product
export async function DELETE(req) {
  try {
    const session = await getServerSession();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Error deleting product' },
      { status: 500 }
    );
  }
} 