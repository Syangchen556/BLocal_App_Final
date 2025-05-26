import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Shop from '@/models/Shop';
import User from '@/models/User';

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession();
    
    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { status, message, isActive } = await request.json();

    if (!status && isActive === undefined) {
      return NextResponse.json(
        { error: 'Status or isActive is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const updateData = {};
    if (status) {
      updateData.status = status;
      updateData['verification.isVerified'] = status === 'active';
      updateData['verification.verifiedAt'] = status === 'active' ? new Date() : null;
      updateData['verification.verifiedBy'] = status === 'active' ? session.user.id : null;
    }
    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    const shop = await Shop.findByIdAndUpdate(
      params.shopId,
      {
        ...updateData,
        $push: {
          statusHistory: {
            status: status || (isActive ? 'active' : 'inactive'),
            timestamp: new Date(),
            message: message || `Shop ${status || (isActive ? 'activated' : 'deactivated')} by admin`,
            updatedBy: session.user.id
          }
        }
      },
      { new: true }
    ).populate('owner');

    if (!shop) {
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 404 }
      );
    }

    // If shop is approved, update owner's role to SELLER
    if (status === 'active') {
      await User.findByIdAndUpdate(
        shop.owner._id,
        { role: 'SELLER' }
      );
    }

    return NextResponse.json(shop);
  } catch (error) {
    console.error('Error updating shop status:', error);
    return NextResponse.json(
      { error: 'Failed to update shop status' },
      { status: 500 }
    );
  }
} 