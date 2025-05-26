'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FaHeart, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import WishlistProductCard from '@/components/products/WishlistProductCard';

export default function Wishlist() {
  const { data: session } = useSession();
  const router = useRouter();
  const { wishlist, loading, error, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin');
    }
  }, [session, router]);

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await removeFromWishlist(productId);
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error('Failed to remove from wishlist');
    }
  };

  const handleAddToCart = async (product) => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    try {
      setIsAdding(true);
      const success = await addToCart(product);
      if (success) {
        toast.success('Added to cart');
      }
    } catch (error) {
      toast.error('Failed to add to cart');
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
        <p className="ml-2">Loading your wishlist...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
          <button 
            onClick={() => router.push('/shop')}
            className="flex items-center text-gray-600 hover:text-green-600 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Continue Shopping
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {!wishlist?.items || wishlist.items.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <FaHeart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-500 mb-4">Save items you&apos;d like to buy later!</p>
            <button
              onClick={() => router.push('/shop')}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {wishlist.items.map((item) => (
              <WishlistProductCard
                key={item.product._id}
                product={item.product}
                onAddToCart={handleAddToCart}
                onRemoveFromWishlist={handleRemoveFromWishlist}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 