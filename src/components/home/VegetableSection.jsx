'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaShoppingCart, FaExclamationTriangle, FaHeart, FaRegHeart } from 'react-icons/fa';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';

export default function VegetableSection() {
  const [vegetables, setVegetables] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showLoginWarning, setShowLoginWarning] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [wishlistAnimations, setWishlistAnimations] = useState({});
  const { data: session } = useSession();
  const router = useRouter();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchVegetables = async () => {
      try {
        const response = await fetch('/api/vegetables');
        if (!response.ok) {
          throw new Error('Failed to fetch vegetables');
        }
        const data = await response.json();
        setVegetables(data.vegetables || []);
      } catch (error) {
        console.error('Error fetching vegetables:', error);
        toast.error('Failed to load vegetables');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVegetables();
  }, []);

  const handleAddToCart = async (e, productId) => {
    e.preventDefault();
    if (!session) {
      setSelectedProductId(productId);
      setShowLoginWarning(true);
      return;
    }

    // Find the product by ID
    const product = vegetables.find(vegetable => vegetable._id === productId);
    if (!product) return;
    
    const success = await addToCart(product);
    if (success) {
      toast.success('Added to cart!');
    }
  };
  
  const handleWishlist = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!session) {
      setSelectedProductId(productId);
      setShowLoginWarning(true);
      return;
    }
    
    // Start animation
    setWishlistAnimations(prev => ({
      ...prev,
      [productId]: true
    }));
    
    try {
      const isCurrentlyInWishlist = isInWishlist(productId);
      let success;
      
      if (isCurrentlyInWishlist) {
        // Remove from wishlist
        success = await removeFromWishlist(productId);
        if (success) {
          toast.success('Removed from wishlist');
        }
      } else {
        // Add to wishlist
        success = await addToWishlist(productId);
        if (success) {
          toast.success('Added to wishlist');
        }
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      toast.error('Failed to update wishlist');
    } finally {
      // End animation after 500ms
      setTimeout(() => {
        setWishlistAnimations(prev => ({
          ...prev,
          [productId]: false
        }));
      }, 500);
    }
  };

  const handleLoginRedirect = () => {
    router.push('/auth/signin');
  };

  const closeLoginWarning = () => {
    setShowLoginWarning(false);
  };

  if (isLoading) {
    return (
      <div className="py-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <section className="py-12 bg-green-50 relative">
      {showLoginWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0">
                <FaExclamationTriangle className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">Login Required</h3>
              </div>
              <button 
                onClick={closeLoginWarning}
                className="ml-auto bg-white rounded-md text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mt-2">
              <p className="text-sm text-gray-500">You need to be logged in to add items to your cart.</p>
            </div>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                type="button"
                className="inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={closeLoginWarning}
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                onClick={handleLoginRedirect}
              >
                Sign in
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">Fresh Vegetables</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {vegetables.length > 0 ? (
            vegetables.map((vegetable) => (
              <div key={vegetable._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <Link href={`/products/${vegetable._id}`}>
                  <div className="relative h-56 w-full">
                    <Image
                      src={vegetable.imageUrl || `/images/products/vegetables/${vegetable.name.toLowerCase()}.jpg`}
                      alt={vegetable.name}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        e.target.src = '/images/products/default-product.jpg';
                      }}
                    />
                    {/* Wishlist button */}
                    <button 
                      onClick={(e) => handleWishlist(e, vegetable._id)}
                      className="absolute top-2 right-2 z-10 bg-white p-2 rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-110"
                      aria-label={isInWishlist(vegetable._id) ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                      {isInWishlist(vegetable._id) ? (
                        <FaHeart 
                          className={`text-xl text-red-500 ${wishlistAnimations[vegetable._id] ? 'animate-heartbeat' : ''}`} 
                        />
                      ) : (
                        <FaRegHeart 
                          className={`text-xl text-gray-400 hover:text-red-500 ${wishlistAnimations[vegetable._id] ? 'animate-heartbeat' : ''}`} 
                        />
                      )}
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-semibold text-gray-900">{vegetable.name}</h3>
                    <p className="text-gray-600 mt-1">{vegetable.description?.short}</p>
                    <div className="mt-2">
                      <span className="text-green-600 font-medium">VEGETABLES</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-gray-800 font-bold">
                        BTN {vegetable.pricing?.base.toFixed(2)}
                      </p>
                      <span className="text-gray-600">
                        Stock: {vegetable.inventory?.stock}
                      </span>
                    </div>
                  </div>
                </Link>
                <div className="px-4 pb-4">
                  <button
                    onClick={(e) => handleAddToCart(e, vegetable._id)}
                    className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                    disabled={!vegetable.inventory?.stock}
                  >
                    <FaShoppingCart />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="col-span-3 text-center text-gray-600 py-8">
              No vegetables available at the moment.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
