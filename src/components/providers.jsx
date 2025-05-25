'use client';

import { SessionProvider } from 'next-auth/react';
import { CartProvider } from '@/contexts/CartContext';
import { WishlistProvider } from '@/contexts/WishlistContext';

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <CartProvider>
        <WishlistProvider>
          {children}
        </WishlistProvider>
      </CartProvider>
    </SessionProvider>
  );
} 