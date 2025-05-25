'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      fetchCart();
    } else {
      setCart([]);
      setLoading(false);
    }
  }, [session]);

  const fetchCart = async () => {
    try {
      const response = await fetch('/api/cart');
      if (response.ok) {
        const data = await response.json();
        setCart(data.items || []);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product) => {
    if (!session) {
      router.push('/auth/signin');
      return false;
    }

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product._id,
          quantity: 1,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add to cart');
      }

      await fetchCart();
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove from cart');
      }

      await fetchCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, quantity }),
      });

      if (!response.ok) {
        throw new Error('Failed to update cart');
      }

      await fetchCart();
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  };

  const clearCart = async () => {
    try {
      const response = await fetch('/api/cart', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to clear cart');
      }

      setCart([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const value = {
    cart,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
} 