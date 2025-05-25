'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaStore, FaEdit, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function ShopProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    if (session.user.role !== 'SELLER') {
      router.push('/dashboard');
      return;
    }

    fetchShopData();
  }, [session, router]);

  const fetchShopData = async () => {
    try {
      const response = await fetch('/api/shop/my-shop');
      if (response.ok) {
        const data = await response.json();
        setShop(data);
        setFormData({
          name: data.name || '',
          description: data.description || '',
          address: data.address || '',
          phone: data.phone || '',
          email: data.email || '',
        });
      }
    } catch (error) {
      console.error('Error fetching shop data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/shop/my-shop', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedShop = await response.json();
        setShop(updatedShop);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating shop:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Shop Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FaStore className="text-3xl text-green-600 mr-4" />
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Edit Shop Profile' : 'Shop Profile'}
              </h1>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <FaEdit className="mr-2" />
                Edit Profile
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Shop Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{shop?.name}</h2>
                <p className="mt-2 text-gray-600">{shop?.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <FaMapMarkerAlt className="text-gray-400" />
                  <span className="text-gray-600">{shop?.address || 'No address provided'}</span>
                </div>

                <div className="flex items-center space-x-3">
                  <FaPhone className="text-gray-400" />
                  <span className="text-gray-600">{shop?.phone || 'No phone provided'}</span>
                </div>

                <div className="flex items-center space-x-3">
                  <FaEnvelope className="text-gray-400" />
                  <span className="text-gray-600">{shop?.email || 'No email provided'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Shop Statistics */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Shop Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500">Total Products</h3>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{shop?.totalProducts || 0}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{shop?.totalOrders || 0}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500">Total Sales</h3>
              <p className="mt-2 text-3xl font-semibold text-gray-900">Nu. {shop?.totalSales || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 