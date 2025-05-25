const { NextResponse } = require('next/server');
const { getServerSession } = require('next-auth/next');
const { authOptions } = require('@/lib/auth');
const { connectDB } = require('@/lib/mongodb');
const Product = require('@/models/Product');
const Shop = require('@/models/Shop');
const { writeFile } = require('fs/promises');
const path = require('path');

// Get all products
async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;

    const db = await connectDB();
    let query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }


    const products = await db.collection('products')
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    const total = await db.collection('products').countDocuments(query);

    return NextResponse.json({
      products,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Error fetching products' }, { status: 500 });

  }
}

// Create new product
async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'SELLER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, price, category, images, stock } = await req.json();
    if (!name || !description || !price || !category || !images || !stock) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = await connectDB();
    const product = {
      name,
      description,
      price,
      category,
      images,
      stock,
      sellerId: session.user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('products').insertOne(product);

    return NextResponse.json({
      message: 'Product created successfully',
      productId: result.insertedId
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Error creating product' }, { status: 500 });

  }
}

// Update product
async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await connectDB();
    const data = await req.json();
    const { id, ...updateData } = data;

    let product = await db.collection('products').findOne({ _id: id });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check authorization
    if (
      session.user.role === 'SELLER' &&
      product.sellerId !== session.user.id
    ) {
      return NextResponse.json({ error: 'You can only update your own products' }, { status: 403 });
    }

    // Only allow admins to update status
    if (session.user.role !== 'ADMIN') {
      delete updateData.status;
    }

    const updatedProduct = await db.collection('products').findOneAndUpdate(
      { _id: id },
      { $set: { ...updateData, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );


    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Error updating product' }, { status: 500 });

  }
}

// Delete product
async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    const product = await db.collection('products').findOne({ _id: id });
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check authorization
    if (
      session.user.role === 'SELLER' &&
      product.sellerId !== session.user.id
    ) {
      return NextResponse.json({ error: 'You can only delete your own products' }, { status: 403 });

    }

    await db.collection('products').deleteOne({ _id: id });

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Error deleting product' }, { status: 500 });

  }
}

module.exports = { GET, POST, PUT, DELETE }; 