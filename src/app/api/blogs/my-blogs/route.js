import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';

export async function GET(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const blogs = await Blog.find({ author: session.user.id })
      .sort({ createdAt: -1 })
      .select('-content'); // Exclude full content for list view

    return NextResponse.json(blogs);
  } catch (error) {
    console.error('Error fetching user blogs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blogs' },
      { status: 500 }
    );
  }
} 