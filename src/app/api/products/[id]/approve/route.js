import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

export async function POST(req, { params }) {
  try {
    const session = await getServerSession();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const { status } = await req.json();
    const productId = params.id;

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    product.status = status;
    product.reviewedAt = new Date();
    product.reviewedBy = session.user.id;
    await product.save();

    // TODO: Send notification to seller about product status
    // This would typically be handled by a notification service

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product status:', error);
    return NextResponse.json(
      { error: 'Error updating product status' },
      { status: 500 }
    );
  }
} 