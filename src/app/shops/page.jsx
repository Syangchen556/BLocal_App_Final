'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { FaStore, FaBox, FaUsers, FaChartLine } from 'react-icons/fa';

export default function ShopPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user?.role !== 'seller') {
      router.push('/');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!session || session.user.role !== 'seller') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">My Shop</h1>
          <p className="mt-2 text-gray-600">Manage your shop and products</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Products Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <FaBox className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-900">Products</h2>
                <p className="text-gray-600">Manage your products</p>
              </div>
            </div>
            <div className="mt-4">
              <a
                href="/dashboard/seller/products"
                className="text-green-600 hover:text-green-700 font-medium"
              >
                View Products →
              </a>
            </div>
          </div>

          {/* Orders Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <FaChartLine className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-900">Orders</h2>
                <p className="text-gray-600">View and manage orders</p>
              </div>
            </div>
            <div className="mt-4">
              <a
                href="/dashboard/seller/orders"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                View Orders →
              </a>
            </div>
          </div>

          {/* Customers Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <FaUsers className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-900">Customers</h2>
                <p className="text-gray-600">View customer information</p>
              </div>
            </div>
            <div className="mt-4">
              <a
                href="/dashboard/seller/customers"
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                View Customers →
              </a>
            </div>
          </div>

          {/* Shop Settings Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <FaStore className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-900">Shop Settings</h2>
                <p className="text-gray-600">Manage shop settings</p>
              </div>
            </div>
            <div className="mt-4">
              <a
                href="/dashboard/seller/settings"
                className="text-yellow-600 hover:text-yellow-700 font-medium"
              >
                View Settings →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 