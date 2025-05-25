import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Shop from '@/models/Shop';
import Blog from '@/models/Blog';

// GET /api/shops/[shopId]/featured-blogs - Get featured blogs for a shop
export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const shop = await Shop.findById(params.shopId)
      .populate({
        path: 'featuredBlogs',
        populate: {
          path: 'author',
          select: 'name image'
        }
      });

    if (!shop) {
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(shop.featuredBlogs);
  } catch (error) {
    console.error('Error fetching featured blogs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured blogs' },
      { status: 500 }
    );
  }
}

// POST /api/shops/[shopId]/featured-blogs - Add a blog to featured blogs
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

    const shop = await Shop.findById(params.shopId);
    if (!shop) {
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 404 }
      );
    }

    // Check if user is the shop owner
    if (shop.owner.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { blogId } = await request.json();
    
    // Check if blog exists and belongs to the shop owner
    const blog = await Blog.findOne({
      _id: blogId,
      author: session.user.id
    });

    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found or unauthorized' },
        { status: 404 }
      );
    }

    // Check if blog is already featured
    if (shop.featuredBlogs.includes(blogId)) {
      return NextResponse.json(
        { error: 'Blog is already featured' },
        { status: 400 }
      );
    }

    // Add blog to featured blogs
    shop.featuredBlogs.push(blogId);
    await shop.save();

    return NextResponse.json({ message: 'Blog added to featured blogs' });
  } catch (error) {
    console.error('Error adding featured blog:', error);
    return NextResponse.json(
      { error: 'Failed to add featured blog' },
      { status: 500 }
    );
  }
}

// DELETE /api/shops/[shopId]/featured-blogs - Remove a blog from featured blogs
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

    const shop = await Shop.findById(params.shopId);
    if (!shop) {
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 404 }
      );
    }

    // Check if user is the shop owner
    if (shop.owner.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { blogId } = await request.json();

    // Remove blog from featured blogs
    shop.featuredBlogs = shop.featuredBlogs.filter(
      id => id.toString() !== blogId
    );
    await shop.save();

    return NextResponse.json({ message: 'Blog removed from featured blogs' });
  } catch (error) {
    console.error('Error removing featured blog:', error);
    return NextResponse.json(
      { error: 'Failed to remove featured blog' },
      { status: 500 }
    );
  }
} 