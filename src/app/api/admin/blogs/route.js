import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Blog from '@/models/Blog';

// GET /api/admin/blogs - Get all blogs
export async function GET(req) {
  try {
    const session = await auth();
    if (!session || session.user.role.toUpperCase() !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const blogs = await Blog.find({})
      .populate('author', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json(blogs);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json(
      { error: 'Error fetching blogs' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/blogs/[id] - Update blog status
export async function PATCH(req, { params }) {
  try {
    const session = await auth();
    if (!session || session.user.role.toUpperCase() !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    const { status } = await req.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Blog ID and status are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const blog = await Blog.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('author', 'name email');

    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(blog);
  } catch (error) {
    console.error('Error updating blog:', error);
    return NextResponse.json(
      { error: 'Error updating blog' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/blogs/[id] - Delete blog
export async function DELETE(req, { params }) {
  try {
    const session = await auth();
    if (!session || session.user.role.toUpperCase() !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Blog ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const blog = await Blog.findByIdAndDelete(id);

    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    return NextResponse.json(
      { error: 'Error deleting blog' },
      { status: 500 }
    );
  }
}
