'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { FaShoppingCart, FaHeart, FaStar, FaStore } from 'react-icons/fa';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ProductCard from '@/components/products/ProductCard';

export default function ProductDetails({ params }) {
  const { data: session } = useSession();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${params.id}`);
        if (!response.ok) throw new Error('Product not found');
        const data = await response.json();
        setProduct(data);
        setIsLoading(false);

        // Fetch related products
        const relatedResponse = await fetch(`/api/products/related/${params.id}`);
        if (relatedResponse.ok) {
          const relatedData = await relatedResponse.json();
          setRelatedProducts(relatedData);
        }

        // Check wishlist status
        if (session?.user) {
          const wishlistResponse = await fetch(`/api/wishlist/check/${params.id}`);
          if (wishlistResponse.ok) {
            const wishlistData = await wishlistResponse.json();
            setIsInWishlist(wishlistData.isInWishlist);
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Failed to load product details');
      }
    };

    fetchProduct();
  }, [params.id, session]);

  const handleAddToCart = async () => {
    if (!session) {
      toast.error('Please login to add items to cart');
      return;
    }

    try {
      setIsAddingToCart(true);
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId: product._id }),
      });

      if (!response.ok) throw new Error('Failed to add to cart');
      toast.success('Added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlist = async () => {
    if (!session) {
      toast.error('Please login to add items to wishlist');
      return;
    }

    try {
      const response = await fetch('/api/wishlist/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId: product._id }),
      });

      if (!response.ok) throw new Error('Failed to toggle wishlist');
      setIsInWishlist(!isInWishlist);
      toast.success(isInWishlist ? 'Removed from wishlist' : 'Added to wishlist');
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast.error('Failed to update wishlist');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Product not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative h-96 rounded-lg overflow-hidden">
            <Image
              src={product.images[selectedImage]}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {product.images.map((image, index) => (
              <button
                key={index}
                className={`relative h-24 rounded-lg overflow-hidden border-2 ${
                  selectedImage === index ? 'border-green-500' : 'border-transparent'
                }`}
                onClick={() => setSelectedImage(index)}
              >
                <Image
                  src={image}
                  alt={`${product.name} - ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="mt-2 text-xl text-gray-600">Nu. {product.price.toFixed(2)}</p>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href={`/shops/${product.shop._id}`}
              className="flex items-center space-x-2 text-green-600 hover:text-green-700"
            >
              <FaStore className="text-xl" />
              <span className="font-medium">{product.shop.name}</span>
            </Link>
            <div className="flex items-center space-x-1">
              <FaStar className="text-yellow-400" />
              <span>{product.averageRating.toFixed(1)}</span>
              <span className="text-gray-500">({product.reviews.length} reviews)</span>
            </div>
          </div>

          <p className="text-gray-600">{product.description}</p>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className={`
                flex-1 bg-green-500 text-white py-3 px-6 rounded-lg
                flex items-center justify-center space-x-2
                hover:bg-green-600 transition-colors
                ${isAddingToCart ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <FaShoppingCart className={isAddingToCart ? 'animate-spin' : ''} />
              <span>Add to Cart</span>
            </button>
            <button
              onClick={handleWishlist}
              className="p-3 rounded-lg border-2 border-gray-200 hover:border-red-500 transition-colors"
            >
              <FaHeart className={isInWishlist ? 'text-red-500' : 'text-gray-400'} />
            </button>
          </div>

          {/* Product Details */}
          <div className="border-t pt-6 space-y-4">
            <h2 className="text-xl font-semibold">Product Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-900">Category</h3>
                <p className="text-gray-600">{product.category}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Stock</h3>
                <p className="text-gray-600">{product.stock} units</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-8">Customer Reviews</h2>
        {product.reviews.length > 0 ? (
          <div className="space-y-6">
            {product.reviews.map((review, index) => (
              <div key={index} className="border-b pb-6">
                <div className="flex items-center space-x-4 mb-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                  <p className="font-medium">{review.user.name}</p>
                </div>
                <p className="text-gray-600">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No reviews yet</p>
        )}
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8">Frequently Bought Together</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 