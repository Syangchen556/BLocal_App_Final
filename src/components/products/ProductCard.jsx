'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { FaShoppingCart, FaHeart } from 'react-icons/fa';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isInWishlist, setIsInWishlist] = useState(false);

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
    const checkWishlist = async () => {
      if (session?.user) {
        try {
          const response = await fetch('/api/wishlist');
          if (response.ok) {
            const wishlist = await response.json();
            setIsInWishlist(wishlist.items.some(item => item.product._id === product._id));
          }
        } catch (error) {
          console.error('Error checking wishlist:', error);
        }
      }
    };
    checkWishlist();
  }, [session, product._id]);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!session) {
      toast.error('Please login to add items to cart');
      return;
    }

    try {
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId: product._id }),
      });

      if (!response.ok) {
        throw new Error('Failed to add to cart');
      }

      toast.success('Added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    }
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!session) {
      toast.error('Please login to add items to wishlist');
      return;
    }

    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId: product._id }),
      });

      if (!response.ok) {
        throw new Error('Failed to update wishlist');
      }

      setIsInWishlist(!isInWishlist);
      toast.success(isInWishlist ? 'Removed from wishlist' : 'Added to wishlist');
    } catch (error) {
      console.error('Error updating wishlist:', error);
      toast.error('Failed to update wishlist');
    }
  };

  return (
    <Link href={`/products/${product._id}`} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <div className="relative h-48 w-full">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          )}
          <Image
            src={getImagePath()}
            alt={product.name}
            fill
            className={`object-cover ${isLoading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => setIsLoading(false)}
            onError={(e) => {
              e.target.src = '/images/products/default-product.jpg';
              setIsLoading(false);
            }}
          />
          {/* Wishlist button */}
          <button 
            onClick={handleWishlist}
            className="absolute top-2 right-2 p-2 bg-white bg-opacity-75 rounded-full hover:bg-opacity-100 transition-all"
          >
            <FaHeart className={`text-xl ${isInWishlist ? 'text-red-500' : 'text-gray-400'}`} />
          </button>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-center text-green-600">
            {product.name}
          </h3>
          
          <div className="mt-2 text-sm text-gray-600 text-center">
            {product.description?.short}
          </div>

          <div className="mt-2 flex justify-between items-center">
            <span className="text-green-700 font-medium">
              {product.category?.main}
            </span>
            <span className="text-gray-600">
              Stock: {product.inventory?.stock || 0}
            </span>
          </div>
          
          <p className="text-gray-600 mt-2 text-center font-bold">
            {product.pricing?.currency || 'Nu.'} {product.pricing?.base?.toFixed(2) || '0.00'}
          </p>
          
          <button 
            className="w-full mt-3 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
            onClick={handleAddToCart}
            disabled={!product.inventory?.stock}
          >
            <FaShoppingCart />
            <span>{product.inventory?.stock ? 'Add to Cart' : 'Out of Stock'}</span>
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;