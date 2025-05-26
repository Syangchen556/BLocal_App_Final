'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FaArrowLeft, FaShoppingCart, FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

export default function ProductDetailPage() {
  const params = useParams();
  const { productId } = params;
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        console.log('Fetching product with ID:', productId);
        
        // In a real app, you would fetch the product by ID
        // For now, we'll fetch all products and find the one with matching ID or slug
        const response = await fetch('/api/products');
        
        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }
        
        const data = await response.json();
        console.log('Products data:', data);
        
        const productsList = data.products || [];
        const foundProduct = productsList.find(p => 
          p._id === productId || 
          p.id === productId || 
          p.slug === productId
        );
        
        if (!foundProduct) {
          throw new Error('Product not found');
        }
        
        setProduct(foundProduct);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const addToCart = () => {
    // In a real app, you would add the product to cart
    alert(`Added ${quantity} ${product.name} to cart!`);
  };

  // Render star ratings
  const renderRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-400" />);
      }
    }
    
    return <div className="flex">{stars}</div>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <Link href="/new_products" className="inline-flex items-center text-green-600 hover:text-green-700 mb-6">
            <FaArrowLeft className="mr-2" />
            Back to Products
          </Link>
          
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error || 'Product not found'}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <Link href="/new_products" className="inline-flex items-center text-green-600 hover:text-green-700 mb-6">
          <FaArrowLeft className="mr-2" />
          Back to Products
        </Link>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
            {/* Product Images */}
            <div>
              <div className="relative h-80 mb-4 rounded-lg overflow-hidden">
                <Image
                  src={product.media?.mainImage || '/images/placeholder.jpg'}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              
              {product.media?.gallery && product.media.gallery.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  <div 
                    className={`relative h-20 rounded-lg overflow-hidden cursor-pointer border-2 ${selectedImage === 0 ? 'border-green-500' : 'border-transparent'}`}
                    onClick={() => setSelectedImage(0)}
                  >
                    <Image
                      src={product.media.mainImage || '/images/placeholder.jpg'}
                      alt={`${product.name} - Main`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  {product.media.gallery.map((image, index) => (
                    <div 
                      key={index}
                      className={`relative h-20 rounded-lg overflow-hidden cursor-pointer border-2 ${selectedImage === index + 1 ? 'border-green-500' : 'border-transparent'}`}
                      onClick={() => setSelectedImage(index + 1)}
                    >
                      <Image
                        src={image || '/images/placeholder.jpg'}
                        alt={`${product.name} - ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Product Details */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              
              <div className="flex items-center mb-4">
                {renderRating(product.rating?.average || 0)}
                <span className="ml-2 text-gray-600">
                  ({product.rating?.count || 0} reviews)
                </span>
              </div>
              
              <div className="text-2xl font-bold text-green-600 mb-4">
                {product.pricing?.currency || 'Nu.'} {product.pricing?.base}
                {product.pricing?.discounted && (
                  <span className="ml-2 text-gray-500 line-through text-lg">
                    {product.pricing.currency || 'Nu.'} {product.pricing.discounted}
                  </span>
                )}
              </div>
              
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
                <p className="text-gray-700">{product.description?.full || product.description?.short}</p>
              </div>
              
              {/* Inventory Status */}
              <div className="mb-6">
                <div className="flex items-center">
                  <span className={`inline-block w-3 h-3 rounded-full mr-2 ${product.inventory?.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span className="text-gray-700">
                    {product.inventory?.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    {product.inventory?.stock > 0 && ` (${product.inventory.stock} available)`}
                  </span>
                </div>
              </div>
              
              {/* Quantity Selector */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Quantity</h2>
                <div className="flex items-center">
                  <button 
                    onClick={decrementQuantity}
                    className="w-10 h-10 bg-gray-200 rounded-l-lg flex items-center justify-center hover:bg-gray-300"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="w-16 h-10 border-t border-b border-gray-300 text-center"
                    min="1"
                  />
                  <button 
                    onClick={incrementQuantity}
                    className="w-10 h-10 bg-gray-200 rounded-r-lg flex items-center justify-center hover:bg-gray-300"
                  >
                    +
                  </button>
                </div>
              </div>
              
              {/* Add to Cart Button */}
              <button
                onClick={addToCart}
                disabled={!product.inventory?.stock || product.inventory.stock <= 0}
                className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 ${
                  product.inventory?.stock > 0
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <FaShoppingCart />
                <span>Add to Cart</span>
              </button>
            </div>
          </div>
          
          {/* Product Specifications */}
          {product.specifications && product.specifications.length > 0 && (
            <div className="p-6 border-t border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Specifications</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.specifications.map((spec, index) => (
                  <div key={index} className="flex">
                    <span className="font-medium text-gray-700 w-1/3">{spec.name}:</span>
                    <span className="text-gray-600">{spec.value} {spec.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Reviews Section */}
          <div className="p-6 border-t border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Reviews</h2>
            
            {product.reviews && product.reviews.length > 0 ? (
              <div className="space-y-6">
                {product.reviews.map((review, index) => (
                  <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                    <div className="flex items-center mb-2">
                      <div className="font-semibold text-gray-900 mr-2">
                        {review.user?.name || 'Anonymous'}
                      </div>
                      {renderRating(review.rating)}
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                    <div className="text-sm text-gray-500 mt-1">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No reviews yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
