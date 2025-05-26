'use client';

import { useState, useEffect } from 'react';
import Hero from '../components/home/Hero';
import ProductCard from '../components/products/ProductCard';
import VegetableSection from '../components/home/VegetableSection';
import FruitSection from '../components/home/FruitSection';
import { toast } from 'react-hot-toast';

export default function Home() {
  const [products, setProducts] = useState({ fruits: [], vegetables: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [searchResults, setSearchResults] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log('Fetching products...');
        setIsLoading(true);
        
        // Fetch fruits from the dedicated fruits API
        const fruitsResponse = await fetch('/api/fruits');
        if (!fruitsResponse.ok) {
          throw new Error(`Fruits API error: ${fruitsResponse.status}`);
        }
        const fruitsData = await fruitsResponse.json();
        console.log('Fruits data:', fruitsData);
        
        // Fetch products from the main products API
        const productsResponse = await fetch('/api/products');
        if (!productsResponse.ok) {
          throw new Error(`Products API error: ${productsResponse.status}`);
        }
        const productsData = await productsResponse.json();
        console.log('Products data:', productsData);
        
        // Get vegetables from products API
        const productsList = productsData.products || [];
        const vegetables = productsList.filter(p => p.category?.main === 'VEGETABLES');
        
        // Use fruits from the dedicated fruits API
        const fruits = fruitsData.fruits || [];
        
        setProducts({ fruits, vegetables });
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </main>
    );
  }

  // Handle search results from Hero component
  const handleSearchResults = (results) => {
    if (results && results.products) {
      setSearchResults(results.products);
    } else {
      toast.error('No search results found');
    }
  };

  // Clear search results and show all products again
  const clearSearchResults = () => {
    setSearchResults(null);
  };

  return (
    <main className="min-h-screen">
      <Hero onSearchResults={handleSearchResults} />
      
      {searchResults ? (
        // Search Results Section
        <section className="py-8 md:py-12 bg-white px-4">
          <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6 md:mb-8">
              <h2 className="text-2xl md:text-3xl font-bold">Search Results</h2>
              <button 
                onClick={clearSearchResults}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Show All Products
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
              {searchResults.length > 0 ? (
                searchResults.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))
              ) : (
                <p className="col-span-3 text-center text-gray-600 py-8">No products found matching your search criteria.</p>
              )}
            </div>
          </div>
        </section>
      ) : (
        // Regular Product Sections
        <>
          {/* Fruits Section - Using the new component */}
          <FruitSection />

          {/* Vegetables Section - Using the new component */}
          <VegetableSection />
        </>
      )}
    </main>
  );
}