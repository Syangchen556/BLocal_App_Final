import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Shop from '@/models/Shop';
<<<<<<< HEAD
import User from '@/models/User';
=======
>>>>>>> ce08c47481366906128db17c6bd3eaf53dc5d6a3

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession();
    
    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
<<<<<<< HEAD
        { error: 'Unauthorized - Admin access required' },
=======
        { error: 'Unauthorized' },
>>>>>>> ce08c47481366906128db17c6bd3eaf53dc5d6a3
        { status: 401 }
      );
    }

<<<<<<< HEAD
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
=======
    const { shopId } = params;
    const { isActive } = await request.json();

    await connectDB();

    const shop = await Shop.findByIdAndUpdate(
      shopId,
      { 
        isActive,
        statusHistory: [
          ...shop.statusHistory,
          {
            status: isActive ? 'active' : 'inactive',
            timestamp: new Date(),
            message: `Shop ${isActive ? 'activated' : 'deactivated'} by admin`,
            updatedBy: session.user.id
          }
        ]
      },
      { new: true }
    );
>>>>>>> ce08c47481366906128db17c6bd3eaf53dc5d6a3

    if (!shop) {
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 404 }
      );
    }

<<<<<<< HEAD
    // If shop is approved, update owner's role to SELLER
    if (status === 'active') {
      await User.findByIdAndUpdate(
        shop.owner._id,
        { role: 'SELLER' }
      );
    }

=======
>>>>>>> ce08c47481366906128db17c6bd3eaf53dc5d6a3
    return NextResponse.json(shop);
  } catch (error) {
    console.error('Error updating shop status:', error);
    return NextResponse.json(
<<<<<<< HEAD
      { error: 'Failed to update shop status' },
=======
      { error: 'Internal server error' },
>>>>>>> ce08c47481366906128db17c6bd3eaf53dc5d6a3
      { status: 500 }
    );
  }
} 