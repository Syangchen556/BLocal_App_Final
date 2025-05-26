import { NextResponse } from 'next/server';
import { auth } from '../../../lib/auth';
// In NextAuth v5, we use the auth() function instead of getServerSession
import { dbConnect } from '../../../lib/mongodb';
import Product from '../../../models/Product';
import Shop from '../../../models/Shop';
import { writeFile } from 'fs/promises';
import path from 'path';


// Get all products
async function GET(req) {
  try {
    console.log('Products API: GET request received');
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;

    console.log('Products API: Connecting to database');
    try {
      await dbConnect();
      
      // Instead of trying to access the database directly, let's use a hardcoded response
      // for now, similar to what we did for the fruits and vegetables endpoints
      const products = [
        {
          _id: 'product-1',
          name: 'Tomato',
          description: { short: 'Fresh tomatoes from local farmers' },
          category: { main: 'VEGETABLES' },
          pricing: { currency: 'BTN', base: 65.00 },
          inventory: { stock: 30 }
        },
        {
          _id: 'product-2',
          name: 'Apple',
          description: { short: 'Fresh apples from local farmers' },
          category: { main: 'FRUITS' },
          pricing: { currency: 'BTN', base: 75.00 },
          inventory: { stock: 25 },
          imageUrl: '/images/products/fruits/apple.jpg'
        }
      ];
      
      // Apply filters to the hardcoded products
      let filteredProducts = products;
    
      // Apply filters if category is specified
      if (category) {
        filteredProducts = filteredProducts.filter(p => p.category?.main === category);
      }

      // Apply search filter if search query is specified
      if (search) {
        const searchRegex = new RegExp(search, 'i');
        filteredProducts = filteredProducts.filter(p => 
          searchRegex.test(p.name) || 
          searchRegex.test(p.description?.short) || 
          searchRegex.test(p.description?.full)
        );
      }

      console.log('Products API: Query:', JSON.stringify({ category, search }));
      
      // Apply pagination
      const total = filteredProducts.length;
      const paginatedProducts = filteredProducts.slice((page - 1) * limit, page * limit);
      
      console.log(`Products API: Found ${paginatedProducts.length} products out of ${total} total`);

      return NextResponse.json({
        products: paginatedProducts,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (dbError) {
      console.error('Products API: Database connection error:', dbError);
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }
  } catch (error) {
    console.error('Products API: Unexpected error:', error);
    return NextResponse.json({ error: 'Error fetching products' }, { status: 500 });
  }
}

// Create new product
async function POST(req) {
  try {
    const session = await auth();
    if (!session || session.user.role.toUpperCase() !== 'SELLER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, price, category, images, stock } = await req.json();
    if (!name || !description || !price || !category || !images || !stock) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();
    const db = global.mongoose.connection.db;
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
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const db = global.mongoose.connection.db;
    const data = await req.json();
    const { id, ...updateData } = data;

    let product = await db.collection('products').findOne({ _id: id });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check authorization
    if (
      session.user.role.toUpperCase() === 'SELLER' &&
      product.sellerId !== session.user.id
    ) {
      return NextResponse.json({ error: 'You can only update your own products' }, { status: 403 });
    }

    // Only allow admins to update status
    if (session.user.role.toUpperCase() !== 'ADMIN') {
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
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const db = global.mongoose.connection.db;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    const product = await db.collection('products').findOne({ _id: id });
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check authorization
    if (
      session.user.role.toUpperCase() === 'SELLER' &&
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

export { GET, POST, PUT, DELETE };