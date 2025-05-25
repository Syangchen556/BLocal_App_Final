'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FaStore, FaMapMarkerAlt, FaPhone, FaEnvelope, FaInfoCircle, FaClock } from 'react-icons/fa';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';

export default function CreateShop() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    phone: '',
    email: '',
    businessHours: {
      monday: { open: '09:00', close: '18:00' },
      tuesday: { open: '09:00', close: '18:00' },
      wednesday: { open: '09:00', close: '18:00' },
      thursday: { open: '09:00', close: '18:00' },
      friday: { open: '09:00', close: '18:00' },
      saturday: { open: '09:00', close: '17:00' },
      sunday: { open: '10:00', close: '16:00' }
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/shop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error creating shop');
      }

      setSubmitted(true);
      setToast({
        message: 'Shop registration submitted successfully! Waiting for admin approval.',
        type: 'success'
      });

      // Wait 3 seconds before redirecting
      setTimeout(() => {
        router.push('/shop/profile');
      }, 3000);
    } catch (error) {
      setToast({
        message: error.message,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6 mt-8">
          <div className="text-center">
            <FaInfoCircle className="mx-auto h-12 w-12 text-blue-500" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Shop Registration Submitted</h2>
            <p className="mt-2 text-gray-600">
              Your shop registration has been submitted successfully. An admin will review your application shortly.
              You will be notified once your shop is approved.
            </p>
            <div className="mt-6">
              <Button
                onClick={() => router.push('/shop/profile')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                View Shop Status
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Welcome Section */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center mb-4">
            <FaStore className="text-3xl mr-4" />
            <h1 className="text-2xl font-bold">Welcome to BLocal!</h1>
          </div>
          <p className="mb-4">
            You're just a few steps away from starting your online shop. Fill out the form below to begin your journey as a seller.
          </p>
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold mb-2">What happens next?</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Fill out your shop details below</li>
              <li>Submit for admin review</li>
              <li>Once approved, you can start adding products</li>
              <li>Start selling to customers across Bhutan!</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Shop Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Enter your shop name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <div className="mt-1">
                <textarea
                  name="description"
                  id="description"
                  rows={3}
                  required
                  value={formData.description}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Tell customers about your shop and what you sell"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="address.street" className="block text-sm font-medium text-gray-700">
                  Street Address
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="address.street"
                    id="address.street"
                    required
                    value={formData.address.street}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="address.city" className="block text-sm font-medium text-gray-700">
                  City
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="address.city"
                    id="address.city"
                    required
                    value={formData.address.city}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="address.state" className="block text-sm font-medium text-gray-700">
                  State
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="address.state"
                    id="address.state"
                    required
                    value={formData.address.state}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="address.zipCode" className="block text-sm font-medium text-gray-700">
                  ZIP Code
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="address.zipCode"
                    id="address.zipCode"
                    required
                    value={formData.address.zipCode}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <div className="mt-1">
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="+975 "
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Business Email
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Business Hours</h3>
              <div className="grid grid-cols-1 gap-4">
                {Object.entries(formData.businessHours).map(([day, hours]) => (
                  <div key={day} className="flex items-center space-x-4">
                    <span className="w-24 text-sm font-medium text-gray-700 capitalize">{day}</span>
                    <input
                      type="time"
                      value={hours.open}
                      onChange={(e) => handleChange({
                        target: {
                          name: `businessHours.${day}.open`,
                          value: e.target.value
                        }
                      })}
                      className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="time"
                      value={hours.close}
                      onChange={(e) => handleChange({
                        target: {
                          name: `businessHours.${day}.close`,
                          value: e.target.value
                        }
                      })}
                      className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-5">
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={loading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {loading ? 'Submitting...' : 'Submit for Review'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
} 