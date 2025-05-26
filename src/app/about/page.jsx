'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaLeaf, FaUsers, FaHandshake, FaStore } from 'react-icons/fa';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AboutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('about');

  const handleBecomeSeller = () => {
    if (session?.user) {
      router.push('/dashboard/seller/create-shop');
    } else {
      router.push('/auth/signin');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[400px] bg-green-50">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative h-full flex items-center justify-center text-center">
          <div className="max-w-3xl px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-green-800">About Bhutan Fresh Market</h1>
            <p className="text-xl text-green-600">Connecting local farmers with consumers through sustainable practices</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-lg border border-gray-200 p-1 bg-white">
            <button
              onClick={() => setActiveTab('about')}
              className={`px-6 py-2 rounded-lg transition-colors ${
                activeTab === 'about' ? 'bg-green-500 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              About Us
            </button>
            <button
              onClick={() => setActiveTab('mission')}
              className={`px-6 py-2 rounded-lg transition-colors ${
                activeTab === 'mission' ? 'bg-green-500 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Our Mission
            </button>
            <button
              onClick={() => setActiveTab('seller')}
              className={`px-6 py-2 rounded-lg transition-colors ${
                activeTab === 'seller' ? 'bg-green-500 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Become a Seller
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {activeTab === 'about' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
                  <p className="text-gray-600 mb-4">
                    Bhutan Fresh Market was founded with a vision to revolutionize the way fresh produce reaches consumers in Bhutan. 
                    We believe in creating a sustainable ecosystem that benefits both farmers and consumers.
                  </p>
                  <p className="text-gray-600">
                    Our platform connects local farmers directly with consumers, ensuring fair prices for producers 
                    and fresh, quality products for buyers.
                  </p>
                </div>
                <div className="relative h-[300px] rounded-lg overflow-hidden">
                  <Image
                    src="/images/about/farmers-market.jpg"
                    alt="Farmers Market"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 text-green-500 mb-4">
                    <FaLeaf className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-green-700">Sustainability</h3>
                  <p className="text-gray-600">We&apos;re committed to environmentally friendly practices in everything we do.</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 text-green-500 mb-4">
                    <FaUsers className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-green-700">Community</h3>
                  <p className="text-gray-600">Supporting local communities and building strong relationships with farmers.</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 text-green-500 mb-4">
                    <FaHandshake className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-green-700">Integrity</h3>
                  <p className="text-gray-600">Honest business practices and transparency in all our operations.</p>
                </div>
              </div>

              {/* Bhutan Details */}
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Bhutan Fresh Market Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Contact Us</h4>
                    <p className="text-gray-600">
                      Phone: +975 1234 5678<br />
                      Email: info@bhutanfreshmarket.bt<br />
                      Location: Thimphu, Bhutan
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Our Values</h4>
                    <ul className="list-disc list-inside text-gray-600 space-y-2">
                      <li>Supporting Local Farmers</li>
                      <li>Sustainable Agriculture</li>
                      <li>Fair Trade Practices</li>
                      <li>Quality Assurance</li>
                      <li>Community Development</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'mission' && (
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Empowering Local Farmers</h3>
                  <p className="text-gray-600 mb-4">
                    We are committed to supporting local farmers by providing them with a direct platform to sell their products.
                    This eliminates middlemen and ensures farmers receive fair compensation for their hard work.
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-2">
                    <li>Direct market access for farmers</li>
                    <li>Fair pricing and transparent transactions</li>
                    <li>Training and support programs</li>
                    <li>Sustainable farming practices</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4">Quality for Consumers</h3>
                  <p className="text-gray-600 mb-4">
                    Our commitment to quality ensures that consumers receive the freshest and highest quality produce,
                    while supporting local agriculture and sustainable practices.
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-2">
                    <li>Fresh, locally grown produce</li>
                    <li>Transparent sourcing information</li>
                    <li>Quality assurance standards</li>
                    <li>Convenient delivery options</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'seller' && (
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Become a Seller</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Why Sell With Us?</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <FaStore className="text-green-500 mt-1 mr-3" />
                      <div>
                        <h4 className="font-semibold">Direct Market Access</h4>
                        <p className="text-gray-600">Reach customers directly without intermediaries</p>
                      </div>
                    </li>
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
                        <h4 className="font-semibold">Growing Customer Base</h4>
                        <p className="text-gray-600">Access to a large and growing customer network</p>
                      </div>
                    </li>
                  </ul>
                </div>
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-4">Get Started</h3>
                  <p className="text-gray-600 mb-6">
                    Join our community of sellers and start growing your business today.
                    Our platform makes it easy to list your products and reach customers.
                  </p>
                  <Link
                    href="/dashboard/seller/register"
                    className="inline-block bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Register as a Seller
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 