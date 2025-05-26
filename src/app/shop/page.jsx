'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/products/ProductCard';
import { FaFilter, FaSearch } from 'react-icons/fa';

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [vegetables, setVegetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Fetch regular products
        const productsResponse = await fetch('/api/products');
        if (!productsResponse.ok) throw new Error('Failed to fetch products');
        const productsData = await productsResponse.json();
        
        // Fetch vegetables
        const vegetablesResponse = await fetch('/api/vegetables');
        if (!vegetablesResponse.ok) throw new Error('Failed to fetch vegetables');
        const vegetablesData = await vegetablesResponse.json();
        
        setProducts(productsData.products || []);
        setVegetables(vegetablesData.vegetables || []);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Combine products and vegetables
  const allProducts = [...products, ...vegetables];
  
  const filteredProducts = allProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (product.description?.short || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category?.main === selectedCategory;
    const matchesPrice = product.pricing?.base >= priceRange.min && product.pricing?.base <= priceRange.max;
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shop Now</h1>
        
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <FaFilter />
              <span>Filters</span>
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">All Categories</option>
                  <option value="FRUITS">Fruits</option>
                  <option value="VEGETABLES">Vegetables</option>
                  <option value="HERBS">Herbs</option>
                  <option value="GRAINS">Grains</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Min"
                  />
                  <span>to</span>
                  <input
                    type="number"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Category Headers */}
        {selectedCategory === 'all' && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Fresh Vegetables</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
              {filteredProducts
                .filter(product => product.category?.main === 'VEGETABLES')
                .map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Fresh Fruits</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
              {filteredProducts
                .filter(product => product.category?.main === 'FRUITS')
                .map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Other Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts
                .filter(product => product.category?.main !== 'VEGETABLES' && product.category?.main !== 'FRUITS')
                .map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
            </div>
          </div>
        )}
        
        {/* Filtered Products Grid */}
        {selectedCategory !== 'all' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
} 