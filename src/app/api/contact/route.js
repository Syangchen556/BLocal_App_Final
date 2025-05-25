const { NextResponse } = require('next/server');
const { getServerSession } = require('next-auth/next');
const { authOptions } = require('@/lib/auth');
const { connectDB } = require('@/lib/mongodb');
import { sendContactNotification, sendContactConfirmation } from '@/lib/email';

async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const contactMessage = {
      name,
      email,
      subject,
      message,
      userId: session?.user?.id,
      status: 'new',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection('contacts').insertOne(contactMessage);

    // Send email notifications
    try {
      // Send notification to admin
      await sendContactNotification(contactMessage);
      
      // Send confirmation to user
      await sendContactConfirmation(contactMessage);
    } catch (error) {
      console.error('Error sending emails:', error);
      // Don't fail the request if email sending fails
    }

    return NextResponse.json(
      { message: 'Message sent successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Error sending message' },
      { status: 500 }
    );
  }
}

module.exports = { POST }; 