'use client';

import Image from 'next/image';
import { FaHeart, FaShoppingCart } from 'react-icons/fa';
import { useState } from 'react';

export default function WishlistProductCard({ product, onAddToCart, onRemoveFromWishlist }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-48">
        <Image
          src={product.imageUrl || '/images/product-placeholder.jpg'}
          alt={product.name}
          fill
          className={`object-cover transition-transform duration-300 ${isHovered ? 'scale-105' : 'scale-100'}`}
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
        <p className="text-gray-600 mb-1 line-clamp-2">{product.description}</p>
        <p className="text-green-600 font-bold mb-4">Nu. {product.price?.toFixed(2)}</p>
        <div className="flex justify-between items-center">
          <button
            onClick={() => onAddToCart(product)}
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            <FaShoppingCart className="mr-2" />
            Add to Cart
          </button>
          <button
            onClick={() => onRemoveFromWishlist(product._id)}
            className="text-red-500 hover:text-red-600"
            aria-label="Remove from wishlist"
          >
            <FaHeart className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
