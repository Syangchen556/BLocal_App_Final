import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { connectDB } from '@/lib/mongodb';
import { authOptions } from '@/lib/auth';
import User from '@/models/User';

// GET /api/admin/users - Get all users
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = await connectDB();

    const users = await db.collection('users')
      .find({})
      .project({ password: 0 })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Error fetching users' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/users/[id] - Update user role or status
export async function PATCH(req) {
  try {
    const session = await getServerSession();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id, role, status } = await req.json();

    if (!id || (!role && !status)) {
      return NextResponse.json(
        { error: 'User ID and role/status are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const updateData = {};
    if (role) updateData.role = role;
    if (status) updateData.status = status;

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).select('-password');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Error updating user' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[id] - Delete user
export async function DELETE(req) {
  try {
    const session = await getServerSession();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Error deleting user' },
      { status: 500 }
    );
  }
} 