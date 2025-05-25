import { NextResponse } from 'next/server';
import Product from '@/models/Product';
import connectDB from '@/lib/mongodb';

export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const product = await Product.findById(params.id)
      .populate('shop', 'name')
      .populate('seller', 'name')
      .select('-__v')
      .lean();

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 