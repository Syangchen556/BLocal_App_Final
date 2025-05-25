'use client';

import { useState, useEffect } from 'react';
import Hero from '@/components/home/Hero';
import ProductCard from '@/components/products/ProductCard';

export default function Home() {
  const [products, setProducts] = useState({ fruits: [], vegetables: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        
        // Separate products by category
        const fruits = data.filter(p => p.category.main === 'FRUITS');
        const vegetables = data.filter(p => p.category.main === 'VEGETABLES');
        
        setProducts({ fruits, vegetables });
      } catch (error) {
        console.error('Error fetching products:', error);
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

  return (
    <main className="min-h-screen">
      <Hero />
      
      {/* Fruits Section */}
      <section className="py-8 md:py-12 bg-white px-4">
        <div className="container mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Fresh Fruits</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {products.fruits.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Vegetables Section */}
      <section className="py-8 md:py-12 bg-green-50 px-4">
        <div className="container mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Fresh Vegetables</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {products.vegetables.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}