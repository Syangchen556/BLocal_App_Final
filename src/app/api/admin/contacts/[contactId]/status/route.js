import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Contact from '@/models/Contact';

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { contactId } = params;
    const { status } = await request.json();

    if (!['PENDING', 'IN_PROGRESS', 'RESOLVED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    await connectDB();

    const contact = await Contact.findByIdAndUpdate(
      contactId,
      {
        status,
        ...(status === 'RESOLVED' ? { resolvedAt: new Date() } : {})
      },
      { new: true }
    );

    if (!contact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ contact });
  } catch (error) {
    console.error('Error updating contact status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 