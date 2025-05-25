'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { FaHeart, FaShoppingCart } from 'react-icons/fa';

export default function Wishlist() {
  const { data: session } = useSession();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (session) {
      fetchWishlist();
    }
  }, [session]);

  const fetchWishlist = async () => {
    try {
      const response = await fetch('/api/wishlist');
      if (!response.ok) throw new Error('Failed to fetch wishlist');
      const data = await response.json();
      setWishlistItems(data.products || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, action: 'remove' }),
      });
      if (!response.ok) throw new Error('Failed to remove from wishlist');
      await fetchWishlist();
    } catch (err) {
      setError(err.message);
    }
  };

  const addToCart = async (productId) => {
    // TODO: Implement add to cart functionality
    console.log('Adding to cart:', productId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Wishlist</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <FaHeart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-500">Save items you'd like to buy later!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {wishlistItems.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-duration-300"
              >
                <div className="relative h-48">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-gray-600 mb-4">Nu.{product.price}</p>
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => addToCart(product._id)}
                      className="flex items-center px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                    >
                      <FaShoppingCart className="mr-2" />
                      Add to Cart
                    </button>
                    <button
                      onClick={() => removeFromWishlist(product._id)}
                      className="text-red-500 hover:text-red-600"
                      aria-label="Remove from wishlist"
                    >
                      <FaHeart className="h-6 w-6" />
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