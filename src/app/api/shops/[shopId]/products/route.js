import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Shop from '@/models/Shop';
import Product from '@/models/Product';

// GET /api/shops/[shopId]/products - Get all products for a shop
export async function GET(request, { params }) {
  try {
    await connectDB();

    const shop = await Shop.findById(params.shopId);
    if (!shop) {
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 404 }
      );
    }

    const products = await Product.find({ shop: params.shopId })
      .populate({
        path: 'shop',
        select: 'name description logo'
      })
      .sort({ createdAt: -1 });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST /api/shops/[shopId]/products - Create a new product
export async function POST(request, { params }) {
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
    const product = await Product.create({
      ...data,
      shop: params.shopId
    });

    await product.populate({
      path: 'shop',
      select: 'name description logo'
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
} 