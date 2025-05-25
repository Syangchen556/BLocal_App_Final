'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaStore, FaBox, FaTag, FaList, FaInfoCircle, FaImage, FaMoneyBill } from 'react-icons/fa';

export default function ProductDetails({ params }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await fetch(`/api/products/${params.id}`);
        const data = await response.json();
        setProduct(data);
        setActiveImage(data.media.mainImage);
        setLoading(false);
      } catch (err) {
        setError('Failed to load product details');
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-10">
        <p>Product not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Product Header */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Image Gallery */}
          <div className="lg:w-1/2">
            <div className="relative h-96 mb-4">
              <Image
                src={activeImage}
                alt={product.name}
                fill
                className="rounded-lg object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => setActiveImage(product.media.mainImage)}
                className={`relative h-24 rounded-lg overflow-hidden ${
                  activeImage === product.media.mainImage ? 'ring-2 ring-green-500' : ''
                }`}
              >
                <Image
                  src={product.media.mainImage}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </button>
              {product.media.gallery?.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(image)}
                  className={`relative h-24 rounded-lg overflow-hidden ${
                    activeImage === image ? 'ring-2 ring-green-500' : ''
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} gallery ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:w-1/2">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.name}</h1>
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <FaInfoCircle className="text-green-500" />
                  Basic Information
                </h2>
                <p className="text-gray-600 mb-2">{product.description.short}</p>
                <p className="text-gray-600">{product.description.full}</p>
              </div>

              {/* Pricing */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <FaMoneyBill className="text-green-500" />
                  Pricing
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600">Base Price</p>
                    <p className="text-2xl font-bold text-green-600">
                      Nu. {product.pricing.base.toFixed(2)}
                    </p>
                  </div>
                  {product.pricing.discounted && (
                    <div>
                      <p className="text-gray-600">Discounted Price</p>
                      <p className="text-2xl font-bold text-red-500">
                        Nu. {product.pricing.discounted.toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Inventory */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <FaBox className="text-green-500" />
                  Inventory
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600">SKU</p>
                    <p className="font-semibold">{product.inventory.sku}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Stock</p>
                    <p className="font-semibold">{product.inventory.stock} units</p>
                  </div>
                </div>
              </div>

              {/* Categories & Tags */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <FaTag className="text-green-500" />
                  Categories & Tags
                </h2>
                <div className="mb-2">
                  <p className="text-gray-600">Main Category</p>
                  <p className="font-semibold">{product.category.main}</p>
                </div>
                <div>
                  <p className="text-gray-600">Tags</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {product.category.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Specifications */}
              {product.specifications?.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                    <FaList className="text-green-500" />
                    Specifications
                  </h2>
                  <div className="grid grid-cols-1 gap-2">
                    {product.specifications.map((spec, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-gray-600">{spec.name}</span>
                        <span className="font-semibold">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Varieties */}
              {product.varieties?.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h2 className="text-xl font-semibold mb-2">Available Varieties</h2>
                  <div className="grid grid-cols-1 gap-4">
                    {product.varieties.map((variety, index) => (
                      <div key={index} className="border-b pb-2 last:border-0">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">{variety.name}</span>
                          <span className="text-green-600">
                            Nu. {variety.price.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Stock: {variety.stock.current} units
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 