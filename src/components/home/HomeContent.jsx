'use client';

import Hero from './Hero';
import FeaturedProducts from '@/components/products/FeaturedProducts';
import FeaturedBlogs from '@/components/blogs/FeaturedBlogs';

export default function HomeContent() {
  return (
    <>
      <Hero />
      <div className="container mx-auto px-4 py-8">
        <section className="py-8">
          <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
          <FeaturedProducts />
        </section>
        <section className="py-8">
          <h2 className="text-2xl font-bold mb-6">Latest Blog Posts</h2>
          <FeaturedBlogs />
        </section>
      </div>
    </>
  );
} 