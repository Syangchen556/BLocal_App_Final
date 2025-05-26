import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';

export async function GET(req) {
  try {
    console.log('Search API: GET request received');
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    
    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    console.log('Search API: Connecting to database');
    const db = await connectDB();
    if (!db) {
      console.error('Search API: Database connection failed');
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }
    
    // Create search query
    const searchQuery = {
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { 'description.short': { $regex: query, $options: 'i' } },
        { 'description.full': { $regex: query, $options: 'i' } },
        { 'category.main': { $regex: query, $options: 'i' } }
      ]
    };

    console.log('Search API: Query:', JSON.stringify(searchQuery));
    
    try {
      const products = await db.collection('products')
        .find(searchQuery)
        .limit(20)
        .toArray();

      const total = await db.collection('products').countDocuments(searchQuery);
      
      console.log(`Search API: Found ${products.length} products out of ${total} total`);

      return NextResponse.json({
        products,
        total,
        query
      });
    } catch (dbError) {
      console.error('Search API: Database query error:', dbError);
      return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
    }
  } catch (error) {
    console.error('Search API: Unexpected error:', error);
    return NextResponse.json({ error: 'Error searching products' }, { status: 500 });
  }
}
