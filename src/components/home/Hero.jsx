'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  return (
    <div className="relative bg-green-50">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left Column - Text Content */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-green-800">
              Fresh Vegetables
              <span className="block text-green-600">Delivered to Your Door</span>
            </h1>
            <p className="text-lg text-gray-600">
              Discover the freshest, locally-grown vegetables. Support local farmers and enjoy farm-to-table produce.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                placeholder="Search for vegetables..."
                className="flex-1 px-4 py-2 rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Search
              </button>
            </form>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-100 rounded-full">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm text-gray-600">Fresh Daily</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-100 rounded-full">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm text-gray-600">Fast Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-100 rounded-full">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                </div>
                <span className="text-sm text-gray-600">Best Quality</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-4 pt-4">
              <Link
                href="/products"
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Shop Now
              </Link>
              <Link
                href="/about"
                className="px-6 py-3 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden">
            <Image
              src="/images/vegetables-hero.jpg"
              alt="Fresh vegetables"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>

      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden">
        <svg
          className="relative block w-full h-12"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            className="fill-white"
          ></path>
        </svg>
      </div>
    </div>
  );
} 