import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Contact from '@/models/Contact';
import { sendEmail } from '@/lib/email';

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { contactId } = params;
    const { response } = await req.json();

    if (!response?.trim()) {
      return NextResponse.json(
        { error: 'Response is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const contact = await Contact.findById(contactId);
    if (!contact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }

    // Update contact with admin response
    contact.adminResponse = response;
    contact.status = 'RESOLVED';
    contact.resolvedAt = new Date();
    await contact.save();

    // Send email notification to user
    try {
      await sendEmail({
        to: contact.email,
        subject: `Re: ${contact.subject}`,
        html: `
          <h2>Response to your inquiry</h2>
          <p>Dear ${contact.name},</p>
          <p>Thank you for contacting us. Here is our response to your inquiry:</p>
          <div style="background-color: #f3f4f6; padding: 1rem; margin: 1rem 0; border-radius: 0.5rem;">
            <p>${response}</p>
          </div>
          <p>If you have any further questions, please don't hesitate to contact us.</p>
          <p>Best regards,<br>The Support Team</p>
        `
      });
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({ contact });
  } catch (error) {
    console.error('Error responding to contact:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 