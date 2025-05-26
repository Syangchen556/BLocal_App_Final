'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FaStore, FaCheck, FaSpinner } from 'react-icons/fa';

export default function BecomeSeller() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    shopName: '',
    description: '',
    phoneNumber: '',
    address: '',
    agreeToTerms: false
  });

  // Redirect if not logged in
  if (!session) {
    router.push('/auth/signin?callbackUrl=/become-seller');
    return null;
  }

  // If already a seller, redirect to seller dashboard
  if (session?.user?.role === 'seller' || session?.user?.role === 'admin') {
    router.push('/dashboard/seller');
    return null;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.agreeToTerms) {
      toast.error('You must agree to the terms and conditions');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const response = await fetch('/api/users/become-seller', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to become a seller');
      }

      // Update the session with the new role
      await update({ role: 'seller' });
      
      toast.success('Congratulations! You are now a seller');
      router.push('/dashboard/seller');
    } catch (error) {
      console.error('Error becoming a seller:', error);
      toast.error(error.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-green-600 py-6 px-8">
          <div className="flex items-center">
            <FaStore className="text-white text-3xl mr-4" />
            <h1 className="text-2xl font-bold text-white">Become a Seller</h1>
          </div>
        </div>
        
        <div className="p-8">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Join our Marketplace</h2>
            <p className="text-gray-600">
              Start selling your products on BLocal and reach more customers in your area.
              Fill out the form below to get started.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="shopName" className="block text-sm font-medium text-gray-700 mb-1">
                Shop Name *
              </label>
              <input
                id="shopName"
                name="shopName"
                type="text"
                required
                value={formData.shopName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Your shop name"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Shop Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Tell customers about your shop and what you sell"
              />
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                required
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Your contact number"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Business Address *
              </label>
              <textarea
                id="address"
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Your business address"
              />
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="agreeToTerms" className="font-medium text-gray-700">
                  I agree to the <a href="/terms" className="text-green-600 hover:text-green-500">Terms and Conditions</a> and <a href="/privacy" className="text-green-600 hover:text-green-500">Privacy Policy</a>
                </label>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-800 mb-2">Benefits of becoming a seller:</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Access to our growing customer base</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Easy-to-use seller dashboard</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Secure payment processing</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Marketing tools to promote your products</span>
                </li>
              </ul>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  'Become a Seller'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
