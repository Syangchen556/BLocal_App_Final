'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FaStore, FaBox, FaChartLine, FaCog, FaPlus, FaChartBar, FaShoppingCart, FaClipboardList } from 'react-icons/fa';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import Toast from '@/components/ui/Toast';

export default function SellerDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [shop, setShop] = useState(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalSales: 0,
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

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
      setLoading(true);
      const response = await fetch('/api/shops/me');
      if (!response.ok) throw new Error('Failed to fetch shop data');
      const data = await response.json();
      setShop(data.shop);
      setStats(data.stats);
    } catch (error) {
      setError(error.message);
      setToast({
        message: 'Error fetching shop data',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Shop Found</h2>
          <p className="text-gray-600 mb-8">You need to create a shop first to start selling.</p>
          <button
            onClick={() => router.push('/dashboard/seller/create-shop')}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Create Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome back, {shop.name}!</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <FaBox className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalProducts}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <FaShoppingCart className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalOrders}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <FaChartLine className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                <p className="text-2xl font-semibold text-gray-900">Nu. {stats.totalSales.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <button
            onClick={() => router.push('/dashboard/seller/products')}
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <FaBox className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Manage Products</p>
                <p className="text-xs text-gray-500">Add, edit, or remove products</p>
              </div>
            </div>
          </button>
          <button
            onClick={() => router.push('/dashboard/seller/orders')}
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <FaClipboardList className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Manage Orders</p>
                <p className="text-xs text-gray-500">View and process orders</p>
              </div>
            </div>
          </button>
          <button
            onClick={() => router.push('/dashboard/seller/sales')}
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <FaChartLine className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Sales Analytics</p>
                <p className="text-xs text-gray-500">View sales reports and trends</p>
              </div>
            </div>
          </button>
          <button
            onClick={() => router.push('/dashboard/seller/profile')}
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <FaStore className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Shop Profile</p>
                <p className="text-xs text-gray-500">Edit shop information</p>
              </div>
            </div>
          </button>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Orders</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {stats.recentOrders.map((order) => (
              <div key={order._id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Order #{order._id.slice(-6)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <button
                      onClick={() => router.push(`/dashboard/seller/orders/${order._id}`)}
                      className="text-green-600 hover:text-green-900"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {stats.recentOrders.length === 0 && (
              <div className="px-6 py-4 text-center text-gray-500">
                No recent orders
              </div>
            )}
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
    </div>
  );
} 