import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function POST(request) {
  try {
    const session = await auth();
    
    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get form data from request
    const { shopName, description, phoneNumber, address } = await request.json();

    // Validate required fields
    if (!shopName || !description || !phoneNumber || !address) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Connect to database
    const db = await connectDB();

    // Check if user already has a shop
    const existingShop = await db.collection('shops').findOne({ ownerId: session.user.id });
    if (existingShop) {
      return NextResponse.json({ error: 'You already have a shop' }, { status: 400 });
    }

    // Create a new shop
    const shop = {
      name: shopName,
      description,
      ownerId: session.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active',
      contact: {
        phoneNumber,
        address
      }
    };

    const result = await db.collection('shops').insertOne(shop);

    // Update user role to SELLER
    await db.collection('users').updateOne(
      { _id: new mongoose.Types.ObjectId(session.user.id) },
      { 
        $set: { 
          role: 'SELLER',
          shop: result.insertedId,
          updatedAt: new Date()
        }
      }
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully became a seller',
      shopId: result.insertedId
    });
    
  } catch (error) {
    console.error('Error in become-seller API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
