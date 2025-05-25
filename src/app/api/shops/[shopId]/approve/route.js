import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Shop from '@/models/Shop';
import User from '@/models/User';

// PATCH /api/shops/[shopId]/approve - Approve or reject a shop
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession();
    
    // Check if user is admin
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    await connectDB();

    // Update shop status to APPROVED
    const shop = await Shop.findByIdAndUpdate(
      params.shopId,
      {
        status: 'APPROVED',
        adminNote: 'Shop approved by admin',
        isActive: true
      },
      { new: true }
    ).populate('owner');

    if (!shop) {
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 404 }
      );
    }

    // Update shop owner's role to SELLER
    await User.findByIdAndUpdate(
      shop.owner._id,
      { role: 'SELLER' }
    );

    return NextResponse.json(shop);
  } catch (error) {
    console.error('Error approving shop:', error);
    return NextResponse.json(
      { error: 'Failed to approve shop' },
      { status: 500 }
    );
  }
} 