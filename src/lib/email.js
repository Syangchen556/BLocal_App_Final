import nodemailer from 'nodemailer';

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email body in HTML format
 * @param {string} [options.text] - Email body in plain text format
 * @returns {Promise} - Promise that resolves when email is sent
 */
export async function sendEmail({ to, subject, html, text }) {
  try {
    const info = await transporter.sendMail({
      from: `"VeggieShop Support" <${process.env.SMTP_FROM}>`,
      to,
      subject,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML tags for plain text version
      html,
    });

    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

/**
 * Send a contact form submission notification to admin
 * @param {Object} contact - Contact form data
 * @returns {Promise} - Promise that resolves when email is sent
 */
export async function sendContactNotification(contact) {
  return sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: `New Contact Form Submission: ${contact.subject}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>From:</strong> ${contact.name} (${contact.email})</p>
      <p><strong>Subject:</strong> ${contact.subject}</p>
      <p><strong>Message:</strong></p>
      <div style="background-color: #f3f4f6; padding: 1rem; margin: 1rem 0; border-radius: 0.5rem;">
        <p>${contact.message}</p>
      </div>
      <p>Please respond to this inquiry through the admin dashboard.</p>
    `
  });
}

/**
 * Send a contact form submission confirmation to user
 * @param {Object} contact - Contact form data
 * @returns {Promise} - Promise that resolves when email is sent
 */
export async function sendContactConfirmation(contact) {
  return sendEmail({
    to: contact.email,
    subject: 'Thank you for contacting us',
    html: `
      <h2>Thank you for contacting us</h2>
      <p>Dear ${contact.name},</p>
      <p>We have received your message and will get back to you as soon as possible.</p>
      <p>Here's a copy of your message for your records:</p>
      <div style="background-color: #f3f4f6; padding: 1rem; margin: 1rem 0; border-radius: 0.5rem;">
        <p><strong>Subject:</strong> ${contact.subject}</p>
        <p><strong>Message:</strong></p>
        <p>${contact.message}</p>
      </div>
      <p>If you have any additional information to provide, please reply to this email.</p>
      <p>Best regards,<br>The Support Team</p>
    `
  });
} 