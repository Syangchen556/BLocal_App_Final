'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaLeaf, FaTruck, FaHandshake, FaShieldAlt } from 'react-icons/fa';

export default function LearnMorePage() {
  const [activeSection, setActiveSection] = useState('overview');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[400px] bg-green-600">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative h-full flex items-center justify-center text-center text-white">
          <div className="max-w-3xl px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Learn More About Bhutan Fresh Market</h1>
            <p className="text-xl">Discover how we're revolutionizing the way fresh produce reaches your table</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Navigation */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-lg border border-gray-200 p-1 bg-white">
            <button
              onClick={() => setActiveSection('overview')}
              className={`px-6 py-2 rounded-lg transition-colors ${
                activeSection === 'overview' ? 'bg-green-500 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveSection('benefits')}
              className={`px-6 py-2 rounded-lg transition-colors ${
                activeSection === 'benefits' ? 'bg-green-500 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Benefits
            </button>
            <button
              onClick={() => setActiveSection('how-it-works')}
              className={`px-6 py-2 rounded-lg transition-colors ${
                activeSection === 'how-it-works' ? 'bg-green-500 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              How It Works
            </button>
          </div>
        </div>

        {/* Content Sections */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {activeSection === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Platform</h2>
                  <p className="text-gray-600 mb-4">
                    Bhutan Fresh Market is a revolutionary platform that connects local farmers directly with consumers,
                    ensuring fresh, quality produce reaches your table while supporting sustainable farming practices.
                  </p>
                  <p className="text-gray-600">
                    We believe in creating a transparent and efficient marketplace that benefits both farmers and consumers,
                    while promoting environmental sustainability and community development.
                  </p>
                </div>
                <div className="relative h-[300px] rounded-lg overflow-hidden">
                  <Image
                    src="/images/learn-more/farmers.jpg"
                    alt="Local Farmers"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                <div className="text-center">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaLeaf className="text-2xl text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Sustainable</h3>
                  <p className="text-gray-600">Promoting eco-friendly farming practices</p>
                </div>
                <div className="text-center">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaHandshake className="text-2xl text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Fair Trade</h3>
                  <p className="text-gray-600">Ensuring fair prices for farmers</p>
                </div>
                <div className="text-center">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaTruck className="text-2xl text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
                  <p className="text-gray-600">Quick and reliable delivery service</p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'benefits' && (
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Benefits</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4">For Consumers</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <FaLeaf className="text-green-500 mt-1 mr-3" />
                      <div>
                        <h4 className="font-semibold">Fresh Produce</h4>
                        <p className="text-gray-600">Get the freshest produce directly from local farmers</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <FaShieldAlt className="text-green-500 mt-1 mr-3" />
                      <div>
                        <h4 className="font-semibold">Quality Assurance</h4>
                        <p className="text-gray-600">Rigorous quality checks ensure the best products</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <FaTruck className="text-green-500 mt-1 mr-3" />
                      <div>
                        <h4 className="font-semibold">Convenient Delivery</h4>
                        <p className="text-gray-600">Fast and reliable delivery to your doorstep</p>
                      </div>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4">For Farmers</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <FaHandshake className="text-green-500 mt-1 mr-3" />
                      <div>
                        <h4 className="font-semibold">Fair Pricing</h4>
                        <p className="text-gray-600">Set your own prices and receive fair compensation</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <FaUsers className="text-green-500 mt-1 mr-3" />
                      <div>
                        <h4 className="font-semibold">Market Access</h4>
                        <p className="text-gray-600">Direct access to a large customer base</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <FaLeaf className="text-green-500 mt-1 mr-3" />
                      <div>
                        <h4 className="font-semibold">Sustainable Practices</h4>
                        <p className="text-gray-600">Support for eco-friendly farming methods</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'how-it-works' && (
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">How It Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-green-600">1</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Browse Products</h3>
                  <p className="text-gray-600">
                    Explore our wide selection of fresh produce from local farmers
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-green-600">2</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Place Order</h3>
                  <p className="text-gray-600">
                    Select your items and complete your purchase securely
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-green-600">3</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
                  <p className="text-gray-600">
                    Receive your fresh produce at your doorstep
                  </p>
                </div>
              </div>

              <div className="mt-12 text-center">
                <Link
                  href="/shop"
                  className="inline-block bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 transition-colors"
                >
                  Start Shopping
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 