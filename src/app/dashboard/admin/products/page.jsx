'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  FaSearch,
  FaTrash,
  FaEye,
  FaCheck,
  FaTimes,
} from 'react-icons/fa';

// Mapping of product names to specific images
const fruitImageMap = {
  'apple': '/images/products/fruits/apple.jpg',
  'banana': '/images/products/fruits/banana.jpg',
  'blueberry': '/images/products/fruits/blueberry.jpg',
  'grapes': '/images/products/fruits/grapes.jpg',
  'kiwi': '/images/products/fruits/kiwi.jpg',
  'mango': '/images/products/fruits/mango.jpg',
  'orange': '/images/products/fruits/orange.jpg',
  'papaya': '/images/products/fruits/papaya.jpg',
  'pineapple': '/images/products/fruits/pineapple.jpg',
  'strawberry': '/images/products/fruits/strawberries.jpg',
  'strawberries': '/images/products/fruits/strawberries.jpg',
  'watermelon': '/images/products/fruits/watermelon.jpg'
};

const vegetableImageMap = {
  'arugula': '/images/products/vegetables/arugula.jpg',
  'bell pepper': '/images/products/vegetables/bell_pepper.jpg',
  'pepper': '/images/products/vegetables/bell_pepper.jpg',
  'broccoli': '/images/products/vegetables/broccoli.jpg',
  'cabbage': '/images/products/vegetables/cabbage.jpg',
  'carrot': '/images/products/vegetables/carrot.jpg',
  'cauliflower': '/images/products/vegetables/cauliflower.jpg',
  'cucumber': '/images/products/vegetables/cucumber.jpg',
  'kale': '/images/products/vegetables/kale.jpg',
  'lettuce': '/images/products/vegetables/lettuce.jpg',
  'potato': '/images/products/vegetables/potato.jpg',
  'spinach': '/images/products/vegetables/spinach.jpg',
  'tomato': '/images/products/vegetables/tomato.jpg',
  'zucchini': '/images/products/vegetables/zucchini.jpg'
};

// Default images for each category
const defaultFruitImage = '/images/products/fruits/apple.jpg';
const defaultVegetableImage = '/images/products/vegetables/carrot.jpg';
const defaultImage = '/images/products/fruits/orange.jpg';

// Function to get image based on product name
const getImageByName = (productName, category) => {
  if (!productName) return defaultImage;
  
  const name = productName.toLowerCase();
  
  // Check if the product name contains any of the fruit or vegetable names
  if (category === 'fruits') {
    for (const [fruitName, imagePath] of Object.entries(fruitImageMap)) {
      if (name.includes(fruitName)) {
        return imagePath;
      }
    }
    return defaultFruitImage;
  } else if (category === 'vegetables') {
    for (const [vegName, imagePath] of Object.entries(vegetableImageMap)) {
      if (name.includes(vegName)) {
        return imagePath;
      }
    }
    return defaultVegetableImage;
  }
  
  // If no match or no category, check both maps
  for (const [fruitName, imagePath] of Object.entries(fruitImageMap)) {
    if (name.includes(fruitName)) {
      return imagePath;
    }
  }
  
  for (const [vegName, imagePath] of Object.entries(vegetableImageMap)) {
    if (name.includes(vegName)) {
      return imagePath;
    }
  }
  
  return defaultImage;
};

export default function AdminProducts() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!session || session.user.role.toUpperCase() !== 'ADMIN') {
      router.push('/');
      return;
    }

    fetchProducts();
  }, [session, router]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/admin/products');
      if (!res.ok) throw new Error('Failed to fetch products');
      
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (productId, status) => {
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: productId, status }),
      });

      if (!res.ok) throw new Error('Failed to update product status');
      
      // Refresh products list
      fetchProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const res = await fetch(`/api/admin/products?id=${productId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete product');
      
      // Refresh products list
      fetchProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.shop.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchProducts}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
          <button
            onClick={() => router.push('/dashboard/admin')}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shop
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 relative flex-shrink-0">
                          <Image
                            src={(product.images && product.images.length > 0) 
                              ? product.images[0] 
                              : getImageByName(
                                  product.name, 
                                  typeof product.category === 'string' ? product.category.toLowerCase() : null
                                )}
                            alt={product.name || 'Product'}
                            fill
                            className="rounded-lg object-cover"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {typeof product.description === 'string' 
                              ? `${product.description.substring(0, 50)}${product.description.length > 50 ? '...' : ''}` 
                              : 'No description available'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.shop.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${product.price}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={product.status}
                        onChange={(e) => handleStatusUpdate(product._id, e.target.value)}
                        className="text-sm text-gray-900 border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="pending">Pending</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => router.push(`/products/${product._id}`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <FaEye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FaTrash className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 