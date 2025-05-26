import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET(request, { params }) {
  try {
    const db = await connectDB();
    
    let productId = params.id;
    let product;
    
    // First try to find by MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(productId)) {
      try {
        product = await db.collection('products').findOne({ _id: new mongoose.Types.ObjectId(productId) });
      } catch (error) {
        console.error('Error finding product by ObjectId:', error);
      }
    }
    
    // If not found by ObjectId, try other fields
    if (!product) {
      // Try finding by string ID
      product = await db.collection('products').findOne({ _id: productId });
      
      // If still not found, try finding by slug
      if (!product) {
        product = await db.collection('products').findOne({ slug: productId });
      }
      
      // If still not found, try finding by name (case insensitive)
      if (!product) {
        product = await db.collection('products').findOne({ 
          name: { $regex: new RegExp('^' + productId + '$', 'i') }
        });
      }
    }

    if (!product) {
      console.log(`Product not found with ID: ${productId}`);
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Get shop details if available
    let shop = null;
    if (product.shopId) {
      try {
        shop = await db.collection('shops').findOne({ _id: new mongoose.Types.ObjectId(product.shopId) });
      } catch (error) {
        // If ObjectId conversion fails, try finding by string ID
        shop = await db.collection('shops').findOne({ _id: product.shopId });
      }
    }

    // Format the response
    const formattedProduct = {
      ...product,
      shop: shop ? { name: shop.name, _id: shop._id } : null
    };

    return NextResponse.json({ product: formattedProduct });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}