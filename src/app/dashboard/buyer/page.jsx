'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaBox, FaHistory, FaChartPie, FaDownload, FaShoppingCart, FaHeart, FaBell } from 'react-icons/fa';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Toast from '@/components/ui/Toast';

export default function BuyerDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [frequentProducts, setFrequentProducts] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    if (session.user.role !== 'BUYER') {
      router.push('/dashboard');
      return;
    }

    fetchOrderHistory();
    fetchFrequentProducts();
  }, [session, router]);

  const fetchOrderHistory = async () => {
    try {
      const response = await fetch('/api/orders/buyer');
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      setToast({
        message: 'Error fetching orders',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFrequentProducts = async () => {
    try {
      const response = await fetch('/api/orders/buyer/frequent-products');
      if (!response.ok) throw new Error('Failed to fetch frequent products');
      const data = await response.json();
      setFrequentProducts(data);
    } catch (error) {
      setToast({
        message: 'Error fetching frequent products',
        type: 'error'
      });
    }
  };

  const handleDownloadBill = async (orderId) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/bill`);
      if (!response.ok) throw new Error('Failed to download bill');
      
      // Create blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `order-${orderId}.pdf`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setToast({
        message: 'Error downloading bill',
        type: 'error'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Buyer Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome back, {session.user.name}!</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <button
            onClick={() => router.push('/dashboard/buyer/orders')}
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <FaHistory className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Order History</p>
                <p className="text-xs text-gray-500">View your orders</p>
              </div>
            </div>
          </button>
          <button
            onClick={() => router.push('/cart')}
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <FaShoppingCart className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Shopping Cart</p>
                <p className="text-xs text-gray-500">View your cart</p>
              </div>
            </div>
          </button>
          <button
            onClick={() => router.push('/dashboard/buyer/wishlist')}
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 text-red-600">
                <FaHeart className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Wishlist</p>
                <p className="text-xs text-gray-500">View saved items</p>
              </div>
            </div>
          </button>
          <button
            onClick={() => router.push('/dashboard/buyer/notifications')}
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <FaBell className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Notifications</p>
                <p className="text-xs text-gray-500">View updates</p>
              </div>
            </div>
          </button>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Orders</h2>
            <FaHistory className="text-gray-400 text-xl" />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-6 py-3 border-b text-left">Order ID</th>
                  <th className="px-6 py-3 border-b text-left">Date</th>
                  <th className="px-6 py-3 border-b text-left">Items</th>
                  <th className="px-6 py-3 border-b text-right">Total</th>
                  <th className="px-6 py-3 border-b text-center">Status</th>
                  <th className="px-6 py-3 border-b text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order) => (
                  <tr key={order._id}>
                    <td className="px-6 py-4 border-b">#{order._id.slice(-6)}</td>
                    <td className="px-6 py-4 border-b">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 border-b">
                      {order.items.map(item => `${item.quantity}x ${item.product.name}`).join(', ')}
                    </td>
                    <td className="px-6 py-4 border-b text-right">Nu. {order.total.toFixed(2)}</td>
                    <td className="px-6 py-4 border-b">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 border-b text-center">
                      <button
                        onClick={() => handleDownloadBill(order._id)}
                        className="text-green-600 hover:text-green-900"
                        title="Download Bill"
                      >
                        <FaDownload />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Frequently Bought Products */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Frequently Bought Products</h2>
            <FaChartPie className="text-gray-400 text-xl" />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-6 py-3 border-b text-left">Product</th>
                  <th className="px-6 py-3 border-b text-center">Times Purchased</th>
                  <th className="px-6 py-3 border-b text-right">Last Purchased</th>
                </tr>
              </thead>
              <tbody>
                {frequentProducts.map((product, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 border-b">{product.name}</td>
                    <td className="px-6 py-4 border-b text-center">{product.purchases}</td>
                    <td className="px-6 py-4 border-b text-right">{new Date(product.lastPurchased).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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