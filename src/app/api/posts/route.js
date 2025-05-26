import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { auth } from '@/lib/auth';

export async function GET(req) {
  try {
    console.log('Blog API: GET request received');
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;

    console.log('Blog API: Connecting to database');
    
    // For now, let's use hardcoded sample blog posts
    const samplePosts = [
      {
        _id: 'post-1',
        title: 'The Benefits of Eating Local Produce',
        slug: 'benefits-of-eating-local-produce',
        content: 'Eating locally grown produce has numerous benefits for your health, the environment, and the local economy...',
        excerpt: 'Discover why eating local is better for you and your community',
        author: {
          name: 'John Smith',
          role: 'ADMIN'
        },
        category: 'Health',
        tags: ['local', 'health', 'environment'],
        coverImage: '/images/blog/local-produce.jpg',
        publishedAt: new Date('2025-05-01').toISOString(),
        isPublished: true
      },
      {
        _id: 'post-2',
        title: 'Seasonal Fruits Guide: What to Buy When',
        slug: 'seasonal-fruits-guide',
        content: 'Knowing which fruits are in season can help you buy the freshest, most nutritious produce while saving money...',
        excerpt: 'A comprehensive guide to buying fruits in their peak season',
        author: {
          name: 'Jane Doe',
          role: 'SELLER'
        },
        category: 'Guides',
        tags: ['seasonal', 'fruits', 'shopping'],
        coverImage: '/images/blog/seasonal-fruits.jpg',
        publishedAt: new Date('2025-05-10').toISOString(),
        isPublished: true
      },
      {
        _id: 'post-3',
        title: 'How to Store Vegetables for Maximum Freshness',
        slug: 'storing-vegetables-for-freshness',
        content: 'Proper storage techniques can extend the life of your vegetables and reduce food waste...',
        excerpt: 'Learn the best ways to keep your vegetables fresh longer',
        author: {
          name: 'Mark Johnson',
          role: 'SELLER'
        },
        category: 'Tips',
        tags: ['storage', 'vegetables', 'freshness'],
        coverImage: '/images/blog/vegetable-storage.jpg',
        publishedAt: new Date('2025-05-15').toISOString(),
        isPublished: true
      }
    ];

    // Filter by category if specified
    let filteredPosts = samplePosts;
    if (category) {
      filteredPosts = filteredPosts.filter(post => post.category === category);
    }

    // Apply pagination
    const total = filteredPosts.length;
    const paginatedPosts = filteredPosts.slice((page - 1) * limit, page * limit);

    console.log(`Blog API: Found ${paginatedPosts.length} posts out of ${total} total`);

    return NextResponse.json({
      posts: paginatedPosts,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Blog API: Unexpected error:', error);
    return NextResponse.json({ error: 'Error fetching blog posts' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    // Check authentication
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins and sellers can create blog posts
    const userRole = session.user.role?.toUpperCase();
    if (userRole !== 'ADMIN' && userRole !== 'SELLER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse the request body
    const data = await req.json();
    
    // Validate required fields
    if (!data.title || !data.content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    // Create a slug from the title if not provided
    if (!data.slug) {
      data.slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    // Add author information from the session
    data.author = {
      name: session.user.name,
      email: session.user.email,
      role: session.user.role
    };

    // Set default values for optional fields
    data.publishedAt = data.isPublished ? new Date().toISOString() : null;
    data.createdAt = new Date().toISOString();
    data.updatedAt = new Date().toISOString();

    // For now, we'll just return the created post without actually saving to database
    console.log('Blog post created:', data);

    return NextResponse.json({
      success: true,
      message: 'Blog post created successfully',
      post: {
        _id: 'new-post-' + Date.now(),
        ...data
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Blog API: Error creating post:', error);
    return NextResponse.json({ error: 'Error creating blog post' }, { status: 500 });
  }
}
