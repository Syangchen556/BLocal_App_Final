import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import PDFDocument from 'pdfkit';

export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { orderId } = params;

    // Find order and verify ownership
    const order = await Order.findById(orderId)
      .populate('customer', 'name email phone')
      .populate('items.product', 'name price')
      .populate('items.shop', 'name');

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Verify the order belongs to the buyer
    if (order.customer._id.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Create PDF
    const doc = new PDFDocument();
    const chunks = [];

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => {});

    // Add content to PDF
    doc.fontSize(20).text('Order Bill', { align: 'center' });
    doc.moveDown();

    // Order Information
    doc.fontSize(12).text(`Order ID: ${order._id}`);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`);
    doc.text(`Status: ${order.status}`);
    doc.moveDown();

    // Customer Information
    doc.fontSize(14).text('Customer Information');
    doc.fontSize(12).text(`Name: ${order.customer.name}`);
    doc.text(`Email: ${order.customer.email}`);
    doc.text(`Phone: ${order.customer.phone}`);
    doc.moveDown();

    // Items Table
    doc.fontSize(14).text('Order Items');
    doc.moveDown();

    // Table Header
    doc.fontSize(12);
    doc.text('Product', 50, doc.y, { width: 200 });
    doc.text('Shop', 250, doc.y, { width: 150 });
    doc.text('Quantity', 400, doc.y, { width: 100 });
    doc.text('Price', 500, doc.y, { width: 100 });
    doc.moveDown();

    // Table Rows
    order.items.forEach(item => {
      doc.text(item.product.name, 50, doc.y, { width: 200 });
      doc.text(item.shop.name, 250, doc.y, { width: 150 });
      doc.text(item.quantity.toString(), 400, doc.y, { width: 100 });
      doc.text(`Nu. ${item.price.toFixed(2)}`, 500, doc.y, { width: 100 });
      doc.moveDown();
    });

    // Total
    doc.moveDown();
    doc.fontSize(14).text(`Total Amount: Nu. ${order.total.toFixed(2)}`, { align: 'right' });

    // Finalize PDF
    doc.end();

    // Convert chunks to buffer
    const pdfBuffer = Buffer.concat(chunks);

    // Return PDF as downloadable file
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="order-${orderId}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating bill:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 