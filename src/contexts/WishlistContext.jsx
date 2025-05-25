'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { data: session } = useSession();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (session) {
      fetchWishlist();
    } else {
      setWishlist([]);
      setLoading(false);
    }
  }, [session]);

  const fetchWishlist = async () => {
    try {
      const response = await fetch('/api/wishlist');
      if (response.ok) {
        const data = await response.json();
        setWishlist(data.items || []);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setError('Failed to fetch wishlist');
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId) => {
    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, action: 'add' }),
      });

      if (!response.ok) {
        throw new Error('Failed to add to wishlist');
      }

      await fetchWishlist();
      return true;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      setError('Failed to add to wishlist');
      return false;
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, action: 'remove' }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove from wishlist');
      }

      await fetchWishlist();
      return true;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      setError('Failed to remove from wishlist');
      return false;
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.product._id === productId);
  };

  const value = {
    wishlist,
    loading,
    error,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    refreshWishlist: fetchWishlist
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
} 