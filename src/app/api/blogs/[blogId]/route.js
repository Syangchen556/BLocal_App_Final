import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';

// GET /api/blogs/[blogId] - Get a single blog
export async function GET(request, { params }) {
  try {
    await connectDB();

    const blog = await Blog.findById(params.blogId)
      .populate({
        path: 'author',
        select: 'name image'
      })
      .populate({
        path: 'comments.author',
        select: 'name image'
      });

    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }

    // Increment view count
    blog.metadata.views += 1;
    await blog.save();

    return NextResponse.json(blog);
  } catch (error) {
    console.error('Error fetching blog:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog' },
      { status: 500 }
    );
  }
}

// PUT /api/blogs/[blogId] - Update a blog
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const blog = await Blog.findById(params.blogId);
    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (blog.author.toString() !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const {
      title,
      content,
      summary,
      category,
      tags,
      media,
      status,
      seo
    } = data;

    // Update blog
    const updatedBlog = await Blog.findByIdAndUpdate(
      params.blogId,
      {
        title,
        content,
        summary,
        category,
        tags,
        media,
        status,
        seo,
        publishedAt: status === 'PUBLISHED' && !blog.publishedAt ? new Date() : blog.publishedAt,
        metadata: {
          ...blog.metadata,
          readTime: Math.ceil(content.split(' ').length / 200)
        }
      },
      { new: true }
    ).populate({
      path: 'author',
      select: 'name image'
    });

    return NextResponse.json(updatedBlog);
  } catch (error) {
    console.error('Error updating blog:', error);
    return NextResponse.json(
      { error: 'Failed to update blog' },
      { status: 500 }
    );
  }
}

// DELETE /api/blogs/[blogId] - Delete a blog
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const blog = await Blog.findById(params.blogId);
    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (blog.author.toString() !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await Blog.findByIdAndDelete(params.blogId);

    return NextResponse.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    return NextResponse.json(
      { error: 'Failed to delete blog' },
      { status: 500 }
    );
  }
} 