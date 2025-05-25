import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';

// POST /api/blogs/[blogId]/comments - Add a comment
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

    const { content } = await request.json();
    
    blog.comments.push({
      author: session.user.id,
      content
    });

    await blog.save();
    await blog.populate([
      {
        path: 'author',
        select: 'name image'
      },
      {
        path: 'comments.author',
        select: 'name image'
      }
    ]);

    return NextResponse.json(blog);
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    );
  }
}

// DELETE /api/blogs/[blogId]/comments/[commentId] - Delete a comment
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

    const { commentId } = params;
    const comment = blog.comments.id(commentId);

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (comment.author.toString() !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    comment.remove();
    await blog.save();

    return NextResponse.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
} 