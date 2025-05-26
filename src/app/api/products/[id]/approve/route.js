import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Shop from '@/models/Shop';
import { sendEmail } from '@/lib/email';

export async function PATCH(request, { params }) {
  try {
    const session = await auth();
    if (!session || session.user.role.toUpperCase() !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { status, message } = await request.json();
    const product = await Product.findById(params.id).populate('shop');
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Update product status
    product.status = status;
    product.statusHistory.push({
      status,
      message: message || `Product ${status} by admin`,
      timestamp: new Date(),
      updatedBy: session.user.id
    });

    await product.save();

    // Send notification to seller
    if (product.shop && product.shop.owner) {
      const shop = await Shop.findById(product.shop._id).populate('owner');
      if (shop && shop.owner.email) {
        await sendEmail({
          to: shop.owner.email,
          subject: `Product ${status}: ${product.name}`,
          text: `Your product "${product.name}" has been ${status.toLowerCase()}.\n\n${message || ''}\n\nView your product: ${process.env.NEXT_PUBLIC_APP_URL}/products/${product._id}`,
          html: `
            <h2>Product ${status}</h2>
            <p>Your product "${product.name}" has been ${status.toLowerCase()}.</p>
            ${message ? `<p>${message}</p>` : ''}
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/products/${product._id}">View your product</a></p>
          `
        });
      }
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product status:', error);
    return NextResponse.json(
      { error: 'Failed to update product status' },
      { status: 500 }
    );
  }
} 