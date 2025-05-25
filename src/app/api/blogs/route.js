import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';

// GET /api/blogs - Get all published blogs
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sort = searchParams.get('sort') || 'latest';

    // Build query
    const query = { status: 'PUBLISHED' };
    if (category) query.category = category;
    if (tag) query.tags = tag;

    // Build sort options
    let sortOptions = {};
    switch (sort) {
      case 'popular':
        sortOptions = { 'metadata.views': -1 };
        break;
      case 'mostLiked':
        sortOptions = { 'metadata.likes': -1 };
        break;
      default:
        sortOptions = { publishedAt: -1 };
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .populate({
          path: 'author',
          select: 'name image'
        })
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .select('-content'), // Exclude full content for list view
      Blog.countDocuments(query)
    ]);

    return NextResponse.json({
      blogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blogs' },
      { status: 500 }
    );
  }
}

// POST /api/blogs - Create a new blog
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

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

    // Validate required fields
    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    if (!content || content.length < 100) {
      return NextResponse.json(
        { error: 'Content is required and must be at least 100 characters' },
        { status: 400 }
      );
    }

    if (!category || !['RECIPES', 'FARMING', 'NUTRITION', 'SUSTAINABILITY', 'OTHER'].includes(category)) {
      return NextResponse.json(
        { error: 'Valid category is required (RECIPES, FARMING, NUTRITION, SUSTAINABILITY, OTHER)' },
        { status: 400 }
      );
    }

    if (!media?.featuredImage) {
      return NextResponse.json(
        { error: 'Featured image is required' },
        { status: 400 }
      );
    }

    // Create blog
    const blog = await Blog.create({
      title,
      content,
      summary,
      category,
      tags: tags || [],
      media: {
        featuredImage: media.featuredImage,
        gallery: media.gallery || []
      },
      status: status || 'DRAFT',
      seo: seo || {},
      author: session.user.id,
      publishedAt: status === 'PUBLISHED' ? new Date() : null,
      metadata: {
        readTime: Math.ceil(content.split(' ').length / 200) // Assuming 200 words per minute
      }
    });

    await blog.populate({
      path: 'author',
      select: 'name image'
    });

    return NextResponse.json(blog);
  } catch (error) {
    console.error('Error creating blog:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create blog', details: error.message },
      { status: 500 }
    );
  }
} 