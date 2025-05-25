import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Shop from '@/models/Shop';
import User from '@/models/User';
import { z } from 'zod';

// Validation schemas
const shopSchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().min(10).max(500),
  logo: z.string().url().optional(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    country: z.string(),
    zipCode: z.string()
  }),
  media: z.object({
    logo: z.string().url().optional(),
    coverImage: z.string().url().optional()
  }).optional()
});

// GET /api/shops - Get all shops (filtered by user role)
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    await connectDB();
    
    const query = {};
    const options = {
      populate: [
        {
          path: 'owner',
          select: 'id name email image'
        },
        {
          path: 'products',
          select: 'id name price images'
        }
      ],
      sort: { createdAt: -1 }
    };

    // If admin, return all shops
    if (session?.user?.role === 'ADMIN') {
      const shops = await Shop.find(query, null, options);
      return NextResponse.json(shops);
    }

    // If seller, return their shop
    if (session?.user?.role === 'SELLER') {
      const shop = await Shop.findOne({ owner: session.user.id }, null, options);
      return NextResponse.json(shop ? [shop] : []);
    }

    // For regular users, only return approved and active shops
    query.isActive = true;
    query.status = 'APPROVED';
    const shops = await Shop.find(query, null, options);
    return NextResponse.json(shops);

  } catch (error) {
    console.error('Error fetching shops:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shops', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/shops - Create a new shop
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'SELLER') {
      return NextResponse.json(
        { error: 'Only sellers can create shops' },
        { status: 403 }
      );
    }

    await connectDB();

    // Check if user already has a shop
    const existingShop = await Shop.findOne({ owner: session.user.id });
    if (existingShop) {
      return NextResponse.json(
        { error: 'You already have a shop' },
        { status: 400 }
      );
    }

    const data = await request.json();
    
    // Validate input data
    try {
      shopSchema.parse(data);
    } catch (validationError) {
      return NextResponse.json(
        { error: 'Invalid shop data', details: validationError.errors },
        { status: 400 }
      );
    }

    // Create shop with initial status
    const shop = await Shop.create({
      ...data,
      owner: session.user.id,
      status: 'PENDING',
      isActive: false,
      verification: {
        isVerified: false,
        verifiedAt: null,
        verifiedBy: null
      },
      statistics: {
        totalSales: 0,
        totalOrders: 0,
        totalProducts: 0
      },
      rating: {
        average: 0,
        count: 0
      },
      statusHistory: [{
        status: 'PENDING',
        timestamp: new Date(),
        message: 'Shop registration submitted',
        updatedBy: session.user.id
      }]
    });

    // Populate owner details
    await shop.populate({
      path: 'owner',
      select: 'id name email image'
    });

    return NextResponse.json(shop, { status: 201 });
  } catch (error) {
    console.error('Error creating shop:', error);
    return NextResponse.json(
      { error: 'Failed to create shop', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/shops - Delete a shop
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'SELLER') {
      return NextResponse.json(
        { error: 'Only sellers can manage shops' },
        { status: 403 }
      );
    }

    await connectDB();

    const shop = await Shop.findOne({ owner: session.user.id });
    if (!shop) {
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 404 }
      );
    }

    // Soft delete by updating status
    shop.status = 'DELETED';
    shop.isActive = false;
    shop.statusHistory.push({
      status: 'DELETED',
      timestamp: new Date(),
      message: 'Shop deleted by owner',
      updatedBy: session.user.id
    });
    await shop.save();

    return NextResponse.json({ message: 'Shop deleted successfully' });
  } catch (error) {
    console.error('Error deleting shop:', error);
    return NextResponse.json(
      { error: 'Failed to delete shop', details: error.message },
      { status: 500 }
    );
  }
} 