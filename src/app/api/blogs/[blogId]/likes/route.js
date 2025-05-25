import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import User from '@/models/User';

// POST /api/blogs/[blogId]/likes - Toggle like on a blog
export async function POST(request, { params }) {
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

    // Check if user has already liked
    const user = await User.findById(session.user.id);
    const hasLiked = user.likedBlogs?.includes(blog._id);

    if (hasLiked) {
      // Unlike
      user.likedBlogs = user.likedBlogs.filter(
        blogId => blogId.toString() !== blog._id.toString()
      );
      blog.metadata.likes -= 1;
    } else {
      // Like
      if (!user.likedBlogs) {
        user.likedBlogs = [];
      }
      user.likedBlogs.push(blog._id);
      blog.metadata.likes += 1;
    }

    await Promise.all([
      user.save(),
      blog.save()
    ]);

    return NextResponse.json({
      likes: blog.metadata.likes,
      hasLiked: !hasLiked
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    );
  }
}

// GET /api/blogs/[blogId]/likes - Check if user has liked
export async function GET(request, { params }) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findById(session.user.id);
    const hasLiked = user.likedBlogs?.includes(params.blogId);

    return NextResponse.json({ hasLiked });
  } catch (error) {
    console.error('Error checking like status:', error);
    return NextResponse.json(
      { error: 'Failed to check like status' },
      { status: 500 }
    );
  }
} 