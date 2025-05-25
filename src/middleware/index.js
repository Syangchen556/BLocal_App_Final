import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

async function middleware(req) {
  const pathname = req.nextUrl.pathname;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static')
  ) {
    return NextResponse.next();
  }

  // Get the token
  const token = await getToken({ req });

  // Auth check
  if (!token) {
    return NextResponse.redirect(new URL('/auth/signin', req.url));
  }

  // Role-based access control
  const { role } = token;

  // Admin routes
  if (pathname.startsWith('/dashboard/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Seller routes
  if (pathname.startsWith('/dashboard/seller')) {
    if (role !== 'seller') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Check if seller has a shop
    if (!pathname.startsWith('/dashboard/seller/create-shop')) {
      try {
        const shopResponse = await fetch(`${req.nextUrl.origin}/api/shop`, {
          headers: {
            cookie: req.headers.get('cookie') || '',
          },
        });

        const shop = await shopResponse.json();

        if (!shop) {
          return NextResponse.redirect(new URL('/dashboard/seller/create-shop', req.url));
        }
      } catch (error) {
        console.error('Error checking shop status:', error);
      }
    }
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/cart/:path*',
    '/wishlist/:path*',
    '/checkout/:path*',
    '/auth/:path*'
  ]
}; 