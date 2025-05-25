import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectDB from '@/lib/mongodb';
import Shop from '@/models/Shop';
import Product from '@/models/Product';
import User from '@/models/User';

// Get all shops with additional data
export async function GET(req) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admins can access this endpoint' },
        { status: 403 }
      );
    }

    await connectDB();

    // Get all shops with owner data and product count
    const shops = await Shop.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'owner',
          foreignField: '_id',
          as: 'ownerData'
        }
      },
      {
        $unwind: '$ownerData'
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'shop',
          as: 'products'
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          logo: '$media.logo',
          status: 1,
          isVerified: '$verification.isVerified',
          createdAt: 1,
          ownerName: '$ownerData.name',
          ownerEmail: '$ownerData.email',
          productCount: { $size: '$products' },
          rating: '$rating.average',
          totalSales: '$statistics.totalSales'
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);

    return NextResponse.json(shops);
  } catch (error) {
    console.error('Error fetching shops:', error);
    return NextResponse.json(
      { error: 'Error fetching shops' },
      { status: 500 }
    );
  }
}

// Update shop status
export async function PATCH(req) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admins can update shop status' },
        { status: 403 }
      );
    }

    const data = await req.json();
    const { shopId, status, message } = data;

    if (!shopId || !status) {
      return NextResponse.json(
        { error: 'Shop ID and status are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const shop = await Shop.findByIdAndUpdate(
      shopId,
      { 
        status,
        'verification.isVerified': status === 'active',
        'verification.verifiedAt': status === 'active' ? new Date() : null,
        'verification.verifiedBy': status === 'active' ? session.user.id : null,
        $push: {
          statusHistory: {
            status,
            timestamp: new Date(),
            message: message || `Shop ${status} by admin`,
            updatedBy: session.user.id
          }
        }
      },
      { new: true }
    );

    if (!shop) {
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(shop);
  } catch (error) {
    console.error('Error updating shop:', error);
    return NextResponse.json(
      { error: 'Error updating shop' },
      { status: 500 }
    );
  }
} 