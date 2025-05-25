'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaHeart, FaShoppingCart, FaTrash } from 'react-icons/fa';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    if (session.user.role !== 'BUYER') {
      router.push('/dashboard');
      return;
    }

    fetchWishlistItems();
  }, [session, router]);

  const fetchWishlistItems = async () => {
    try {
      const response = await fetch('/api/wishlist');
      if (response.ok) {
        const data = await response.json();
        setWishlistItems(data.items);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      toast.error('Failed to load wishlist items');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const response = await fetch(`/api/wishlist/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setWishlistItems(items => items.filter(item => item.product._id !== productId));
        toast.success('Item removed from wishlist');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove item from wishlist');
    }
  };

  const addToCart = async (productId) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          quantity: 1,
        }),
      });

      if (response.ok) {
        // Trigger cart animation
        const cartIcon = document.querySelector('[data-testid="cart-icon"]');
        if (cartIcon) {
          cartIcon.classList.add('animate-bounce');
          setTimeout(() => {
            cartIcon.classList.remove('animate-bounce');
          }, 1000);
        }
        toast.success('Added to cart successfully');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-8">
          <FaHeart className="text-2xl text-red-500 mr-3" />
          <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-500">Your wishlist is empty</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => (
              <div key={item.product._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative h-48">
                  <Image
                    src={item.product.image || '/images/placeholder.png'}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">{item.product.name}</h2>
                  <p className="text-gray-600 mb-2">{item.product.description}</p>
                  <p className="text-lg font-bold text-green-600 mb-4">Nu. {item.product.price}</p>
                  
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => addToCart(item.product._id)}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      <FaShoppingCart className="mr-2" />
                      Add to Cart
                    </button>
                    <button
                      onClick={() => removeFromWishlist(item.product._id)}
                      className="text-red-500 hover:text-red-700"
                      aria-label="Remove from wishlist"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 