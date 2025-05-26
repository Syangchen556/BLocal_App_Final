'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [wishlist, setWishlist] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastAction, setLastAction] = useState(null); // 'add' or 'remove'

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
      setLoading(true);
      const response = await fetch('/api/wishlist');
      if (!response.ok) throw new Error('Failed to fetch wishlist');
      const data = await response.json();
      
      // Ensure we have a valid wishlist structure
      if (data && data.items) {
        // Fetch product details for each item in the wishlist
        if (data.items.length > 0) {
          const itemsWithProducts = await Promise.all(data.items.map(async (item) => {
            try {
              // If the item already has product details, use them
              if (item.product && typeof item.product === 'object') {
                return item;
              }
              
              // Otherwise, fetch product details
              const productId = item.product || item.productId;
              if (!productId) return item;
              
              const productResponse = await fetch(`/api/products/${productId}`);
              if (!productResponse.ok) throw new Error('Failed to fetch product');
              const productData = await productResponse.json();
              
              return {
                ...item,
                product: productData.product
              };
            } catch (error) {
              console.error('Error fetching product details:', error);
              return item; // Return item without product details if fetch fails
            }
          }));
          
          setWishlist({ items: itemsWithProducts });
        } else {
          setWishlist({ items: [] });
        }
      } else {
        setWishlist({ items: [] });
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      toast.error('Failed to load wishlist');
      setWishlist({ items: [] });
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId) => {
    if (!session) {
      toast.error('Please login to add items to wishlist');
      setTimeout(() => {
        router.push('/auth/signin');
      }, 1500); // Delay redirect to allow user to see the toast message
      return false;
    }
    
    try {
      console.log(`Adding product ID ${productId} to wishlist`);
      setLoading(true);
      
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error(errorData.error || 'Failed to add to wishlist');
      }
      
      const updatedWishlist = await response.json();
      console.log('Updated wishlist from server:', updatedWishlist);
      
      // Update local state with the server response
      if (updatedWishlist && updatedWishlist.items) {
        setWishlist(updatedWishlist);
        // Set last action to 'add' to trigger animation in navbar
        setLastAction('add');
      } else {
        // If the server response doesn't include items, fetch the updated wishlist
        await fetchWishlist();
        // Still set last action to trigger animation
        setLastAction('add');
      }
      
      return true;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast.error(error.message || 'Failed to add to wishlist');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!session) {
      toast.error('Please login to manage your wishlist');
      setTimeout(() => {
        router.push('/auth/signin');
      }, 1500); // Delay redirect to allow user to see the toast message
      return false;
    }
    
    try {
      console.log(`Removing product ID ${productId} from wishlist`);
      setLoading(true);
      
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, action: 'remove' }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error(errorData.error || 'Failed to remove from wishlist');
      }
      
      const updatedWishlist = await response.json();
      console.log('Updated wishlist from server after removal:', updatedWishlist);
      
      // Update local state with the server response
      if (updatedWishlist && updatedWishlist.items) {
        setWishlist(updatedWishlist);
        // Set last action to 'remove' to indicate removal (no animation needed)
        setLastAction('remove');
      } else {
        // If the server response doesn't include items, fetch the updated wishlist
        await fetchWishlist();
        // Still set last action
        setLastAction('remove');
      }
      
      return true;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error(error.message || 'Failed to remove from wishlist');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const isInWishlist = (productId) => {
    if (!wishlist || !wishlist.items || !productId) return false;
    
    const result = wishlist.items.some(item => {
      // Check if item.product is an object with _id property
      if (item.product && typeof item.product === 'object' && item.product._id) {
        return item.product._id === productId;
      }
      
      // Check if item.product is a string ID
      if (item.product && typeof item.product === 'string') {
        return item.product === productId;
      }
      
      // Check productId property as fallback
      return item.productId === productId;
    });
    
    return result;
  };

  const value = {
    wishlist,
    loading,
    error,
    lastAction,
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