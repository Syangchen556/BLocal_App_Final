'use client';

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { FaShoppingCart, FaHeart, FaRegHeart, FaExclamationTriangle } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const cardRef = useRef(null);
  const router = useRouter();
  const { data: session } = useSession();
  const { addToWishlist, removeFromWishlist, isInWishlist: checkWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [isLoading, setIsLoading] = useState(true);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [showLoginWarning, setShowLoginWarning] = useState(false);
  const [isWishlistAnimating, setIsWishlistAnimating] = useState(false);

  // Get the correct image path based on category
  const getImagePath = () => {
    if (product.media?.mainImage) {
      return product.media.mainImage;
    }
    
    // Determine category folder (fruits or vegetables)
    const category = product.category?.main?.toLowerCase() || 'vegetables';
    const validCategories = ['fruits', 'vegetables'];
    const categoryFolder = validCategories.includes(category) ? category : 'vegetables';
    
    // Generate image path with fallback
    const imageName = product.name.toLowerCase().replace(/\s+/g, '-');
    const imagePath = `/images/products/${categoryFolder}/${imageName}.jpg`;
    
    return imagePath;
  };

  // Check if product is in wishlist
  useEffect(() => {
    if (session?.user && product?._id) {
      const isProductInWishlist = checkWishlist(product._id);
      setIsInWishlist(isProductInWishlist);
      console.log(`Product ${product.name} in wishlist: ${isProductInWishlist}`);
    }
  }, [session, product, checkWishlist]);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!session) {
      setShowLoginWarning(true);
      return;
    }

    const success = await addToCart(product);
    if (success) {
      toast.success('Added to cart!');
    }
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!session) {
      setShowLoginWarning(true);
      return;
    }

    // Start animation immediately for better user feedback
    setIsWishlistAnimating(true);
    
    try {
      let success;
      console.log(`Updating wishlist for product: ${product.name} (${product._id})`);
      
      if (isInWishlist) {
        // Remove from wishlist
        console.log('Removing from wishlist...');
        success = await removeFromWishlist(product._id);
        if (success) {
          setIsInWishlist(false);
          toast.success('Removed from wishlist');
          console.log('Successfully removed from wishlist');
        } else {
          console.error('Failed to remove from wishlist');
        }
      } else {
        // Add to wishlist
        console.log('Adding to wishlist...');
        success = await addToWishlist(product._id);
        if (success) {
          setIsInWishlist(true);
          toast.success('Added to wishlist');
          console.log('Successfully added to wishlist');
        } else {
          console.error('Failed to add to wishlist');
        }
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      toast.error('Failed to update wishlist');
    } finally {
      // Keep animation a bit longer for better visual feedback
      setTimeout(() => {
        setIsWishlistAnimating(false);
      }, 800);
    }
  };

  return (
    <Link href={`/products/${product._id}`} className="block">
      <div className="group relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg hover:scale-105 transition-all duration-300 ease-in-out">
        {showLoginWarning && (
          <div className="absolute inset-0 z-10 bg-black bg-opacity-70 flex items-center justify-center p-4">
            <div className="bg-white p-4 rounded-lg max-w-xs w-full">
              <div className="flex items-start mb-3">
                <div className="flex-shrink-0">
                  <FaExclamationTriangle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-800">Login Required</h3>
                </div>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    setShowLoginWarning(false);
                  }}
                  className="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg p-1"
                >
                  <span className="sr-only">Dismiss</span>
                  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-4">You need to be logged in to add items to your cart.</p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setShowLoginWarning(false);
                  }}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    router.push('/auth/signin');
                  }}
                  className="bg-green-500 text-white px-4 py-2 rounded-md text-sm hover:bg-green-600"
                >
                  Sign in
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="relative h-48 w-full group">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          )}
          <Image
            src={getImagePath()}
            alt={product.name}
            fill
            className={`object-cover transition-transform duration-300 group-hover:scale-110 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => setIsLoading(false)}
            onError={(e) => {
              e.target.src = '/images/products/default-product.jpg';
              setIsLoading(false);
            }}
          />
          {/* Wishlist button */}
          <button 
            onClick={handleWishlist}
            className="absolute top-2 right-2 z-10 bg-white p-2 rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-110"
            aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            {isInWishlist ? (
              <FaHeart 
                className={`text-xl text-red-500 ${isWishlistAnimating ? 'animate-heartbeat' : ''}`} 
              />
            ) : (
              <FaRegHeart 
                className={`text-xl text-gray-400 hover:text-red-500 ${isWishlistAnimating ? 'animate-heartbeat' : ''}`} 
              />
            )}
          </button>
        </div>
        <div className="p-4">
          <h3 className="text-gray-900 font-semibold mb-2 transition-colors duration-300 group-hover:text-green-600">
            {product.name}
          </h3>
          
          <div className="flex items-center gap-2 text-gray-600 transition-colors duration-300 group-hover:text-green-600">
            {product.description?.short}
          </div>

          <div className="mt-2 flex justify-between items-center">
            <span className="text-green-600 hover:text-green-700 transition-colors duration-300">
              {product.category?.main}
            </span>
            <span className="text-gray-600">
              Stock: {product.inventory?.stock || 0}
            </span>
          </div>
          
          <p className="text-gray-600 mb-2 transition-colors duration-300 group-hover:text-gray-900">
            {product.pricing?.currency || 'Nu.'} {product.pricing?.base?.toFixed(2) || '0.00'}
          </p>
          
          <button 
            className="w-full mt-3 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            onClick={handleAddToCart}
            disabled={!product.inventory?.stock}
          >
            <FaShoppingCart className="transition-transform duration-300 group-hover:scale-110" />
            <span>{product.inventory?.stock ? 'Add to Cart' : 'Out of Stock'}</span>
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;