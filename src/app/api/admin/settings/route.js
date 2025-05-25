import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { connectDB } from '@/lib/mongodb';
import { authOptions } from '@/lib/auth';

// GET /api/admin/settings
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = await connectDB();

    // Get settings from environment variables or database
    const settings = {
      site: {
        name: process.env.SITE_NAME || 'BLocal',
        description: process.env.SITE_DESCRIPTION || 'Your local marketplace for fresh fruits and vegetables',
        maintenanceMode: process.env.MAINTENANCE_MODE === 'true',
        allowNewRegistrations: process.env.ALLOW_NEW_REGISTRATIONS !== 'false',
      },
      email: {
        smtpHost: process.env.SMTP_HOST || '',
        smtpPort: process.env.SMTP_PORT || '',
        smtpUser: process.env.SMTP_USER || '',
        smtpPassword: process.env.SMTP_PASSWORD || '',
        fromEmail: process.env.FROM_EMAIL || '',
        fromName: process.env.FROM_NAME || '',
      },
      payment: {
        stripeEnabled: process.env.STRIPE_ENABLED === 'true',
        stripePublicKey: process.env.STRIPE_PUBLIC_KEY || '',
        stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
        stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
      },
      notifications: {
        emailNotifications: process.env.EMAIL_NOTIFICATIONS !== 'false',
        orderNotifications: process.env.ORDER_NOTIFICATIONS !== 'false',
        shopNotifications: process.env.SHOP_NOTIFICATIONS !== 'false',
        userNotifications: process.env.USER_NOTIFICATIONS !== 'false',
      },
      security: {
        requireEmailVerification: process.env.REQUIRE_EMAIL_VERIFICATION !== 'false',
        requirePhoneVerification: process.env.REQUIRE_PHONE_VERIFICATION === 'true',
        maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5'),
        sessionTimeout: parseInt(process.env.SESSION_TIMEOUT || '24'),
      },
    };

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/settings
export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const settings = await req.json();

    // Validate settings
    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { error: 'Invalid settings data' },
        { status: 400 }
      );
    }

    // Update environment variables or database
    // Note: In a production environment, you would want to update these in a secure way
    // This is just a placeholder for demonstration
    const updates = {
      SITE_NAME: settings.site.name,
      SITE_DESCRIPTION: settings.site.description,
      MAINTENANCE_MODE: settings.site.maintenanceMode.toString(),
      ALLOW_NEW_REGISTRATIONS: settings.site.allowNewRegistrations.toString(),
      SMTP_HOST: settings.email.smtpHost,
      SMTP_PORT: settings.email.smtpPort,
      SMTP_USER: settings.email.smtpUser,
      SMTP_PASSWORD: settings.email.smtpPassword,
      FROM_EMAIL: settings.email.fromEmail,
      FROM_NAME: settings.email.fromName,
      STRIPE_ENABLED: settings.payment.stripeEnabled.toString(),
      STRIPE_PUBLIC_KEY: settings.payment.stripePublicKey,
      STRIPE_SECRET_KEY: settings.payment.stripeSecretKey,
      STRIPE_WEBHOOK_SECRET: settings.payment.stripeWebhookSecret,
      EMAIL_NOTIFICATIONS: settings.notifications.emailNotifications.toString(),
      ORDER_NOTIFICATIONS: settings.notifications.orderNotifications.toString(),
      SHOP_NOTIFICATIONS: settings.notifications.shopNotifications.toString(),
      USER_NOTIFICATIONS: settings.notifications.userNotifications.toString(),
      REQUIRE_EMAIL_VERIFICATION: settings.security.requireEmailVerification.toString(),
      REQUIRE_PHONE_VERIFICATION: settings.security.requirePhoneVerification.toString(),
      MAX_LOGIN_ATTEMPTS: settings.security.maxLoginAttempts.toString(),
      SESSION_TIMEOUT: settings.security.sessionTimeout.toString(),
    };

    // In a real application, you would:
    // 1. Update these in a secure configuration management system
    // 2. Update the database if settings are stored there
    // 3. Reload the application configuration
    // 4. Log the changes for audit purposes

    return NextResponse.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 