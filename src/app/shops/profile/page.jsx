'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaStore, FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaEdit, FaPlus } from 'react-icons/fa';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';

export default function ShopProfile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [shop, setShop] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user.role !== 'SELLER') {
      router.push('/auth/signin');
      return;
    }

    fetchShopData();
  }, [session, status]);

  const fetchShopData = async () => {
    try {
      const response = await fetch('/api/shop');
      if (response.ok) {
        const data = await response.json();
        setShop(data);
      }
    } catch (error) {
      console.error('Error fetching shop data:', error);
      setToast({
        message: 'Error fetching shop data',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6 mt-8">
          <div className="text-center">
            <FaStore className="mx-auto h-12 w-12 text-blue-500" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Start Your Shop</h2>
            <p className="mt-2 text-gray-600">
              You haven't created a shop yet. Start selling your products by creating your shop now.
            </p>
            <div className="mt-6">
              <Button
                onClick={() => router.push('/dashboard/seller/create-shop')}
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <FaPlus className="mr-2" />
                Create New Shop
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (shop.status === 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6 mt-8">
          <div className="text-center">
            <FaStore className="mx-auto h-12 w-12 text-yellow-500" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Shop Under Review</h2>
            <p className="mt-2 text-gray-600">
              Your shop registration is currently under review. We'll notify you once it's approved.
            </p>
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-yellow-800">Shop Details</h3>
              <div className="mt-3 text-left">
                <p className="text-sm text-yellow-700"><strong>Name:</strong> {shop.name}</p>
                <p className="text-sm text-yellow-700"><strong>Email:</strong> {shop.email}</p>
                <p className="text-sm text-yellow-700"><strong>Phone:</strong> {shop.phone}</p>
                <p className="text-sm text-yellow-700"><strong>Address:</strong> {shop.fullAddress}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="relative h-48">
            <Image
              src={shop.media.coverImage}
              alt={shop.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="relative h-24 w-24 mx-auto mb-4">
                  <Image
                    src={shop.media.logo}
                    alt={shop.name}
                    fill
                    className="rounded-full object-cover border-4 border-white"
                  />
                </div>
                <h1 className="text-3xl font-bold">{shop.name}</h1>
                <p className="mt-2 text-gray-200">{shop.description}</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Shop Information</h2>
              <Button
                onClick={() => router.push('/dashboard/seller/edit-shop')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <FaEdit className="mr-2" />
                Edit Shop
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Details</h3>
                <div className="space-y-3">
                  <p className="flex items-center text-gray-600">
                    <FaMapMarkerAlt className="mr-2" />
                    {shop.fullAddress}
                  </p>
                  <p className="flex items-center text-gray-600">
                    <FaPhone className="mr-2" />
                    {shop.phone}
                  </p>
                  <p className="flex items-center text-gray-600">
                    <FaEnvelope className="mr-2" />
                    {shop.email}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Business Hours</h3>
                <div className="space-y-2">
                  {Object.entries(shop.businessHours).map(([day, hours]) => (
                    <div key={day} className="flex justify-between text-sm">
                      <span className="text-gray-600 capitalize">{day}</span>
                      <span className="text-gray-900">
                        {hours.open} - {hours.close}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Shop Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">{shop.statistics.totalProducts}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{shop.statistics.totalOrders}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Sales</p>
                  <p className="text-2xl font-bold text-gray-900">Nu. {shop.statistics.totalSales}</p>
                </div>
              </div>
            </div>
          </div>
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