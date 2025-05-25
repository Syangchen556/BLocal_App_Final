'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { FaBox, FaShoppingBag, FaChartLine, FaTruck, FaHistory, FaHeart, FaCog } from 'react-icons/fa';

const AdminDashboard = () => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
        <h3 className="text-xl font-semibold mb-2">User Management</h3>
        <p className="text-gray-600 mb-4">Manage users and their roles</p>
        <Link href="/dashboard/admin/users" className="text-green-600 hover:text-green-700">
          View Users →
        </Link>
      </div>
      <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
        <h3 className="text-xl font-semibold mb-2">Analytics</h3>
        <p className="text-gray-600 mb-4">View site statistics and reports</p>
        <Link href="/dashboard/admin/analytics" className="text-green-600 hover:text-green-700">
          View Analytics →
        </Link>
      </div>
      <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
        <h3 className="text-xl font-semibold mb-2">Settings</h3>
        <p className="text-gray-600 mb-4">Configure system settings</p>
        <Link href="/dashboard/admin/settings" className="text-green-600 hover:text-green-700">
          Manage Settings →
        </Link>
      </div>
    </div>
  </div>
);

const SellerDashboard = () => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Seller Dashboard</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
        <div className="flex items-center mb-4">
          <FaBox className="text-green-500 text-2xl mr-3" />
          <h3 className="text-xl font-semibold">Inventory</h3>
        </div>
        <p className="text-gray-600 mb-4">Manage your product inventory</p>
        <Link href="/dashboard/seller/inventory" className="text-green-600 hover:text-green-700">
          Manage Inventory →
        </Link>
      </div>
      <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
        <div className="flex items-center mb-4">
          <FaShoppingBag className="text-blue-500 text-2xl mr-3" />
          <h3 className="text-xl font-semibold">Products</h3>
        </div>
        <p className="text-gray-600 mb-4">Add and manage your products</p>
        <Link href="/dashboard/seller/products" className="text-green-600 hover:text-green-700">
          Manage Products →
        </Link>
      </div>
      <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
        <div className="flex items-center mb-4">
          <FaChartLine className="text-purple-500 text-2xl mr-3" />
          <h3 className="text-xl font-semibold">Sales</h3>
        </div>
        <p className="text-gray-600 mb-4">View your sales analytics</p>
        <Link href="/dashboard/seller/sales" className="text-green-600 hover:text-green-700">
          View Sales →
        </Link>
      </div>
      <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
        <div className="flex items-center mb-4">
          <FaTruck className="text-yellow-500 text-2xl mr-3" />
          <h3 className="text-xl font-semibold">Orders</h3>
        </div>
        <p className="text-gray-600 mb-4">Manage customer orders</p>
        <Link href="/dashboard/seller/orders" className="text-green-600 hover:text-green-700">
          View Orders →
        </Link>
      </div>
    </div>
  </div>
);

const BuyerDashboard = () => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Buyer Dashboard</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
        <div className="flex items-center mb-4">
          <FaHistory className="text-blue-500 text-2xl mr-3" />
          <h3 className="text-xl font-semibold">Order History</h3>
        </div>
        <p className="text-gray-600 mb-4">View and track your orders</p>
        <Link href="/dashboard/buyer/orders" className="text-green-600 hover:text-green-700">
          View Orders →
        </Link>
      </div>
      <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
        <div className="flex items-center mb-4">
          <FaHeart className="text-red-500 text-2xl mr-3" />
          <h3 className="text-xl font-semibold">Wishlist</h3>
        </div>
        <p className="text-gray-600 mb-4">View your saved items</p>
        <Link href="/wishlist" className="text-green-600 hover:text-green-700">
          View Wishlist →
        </Link>
      </div>
      <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
        <div className="flex items-center mb-4">
          <FaCog className="text-gray-500 text-2xl mr-3" />
          <h3 className="text-xl font-semibold">Settings</h3>
        </div>
        <p className="text-gray-600 mb-4">Manage your account settings</p>
        <Link href="/dashboard/buyer/settings" className="text-green-600 hover:text-green-700">
          Manage Settings →
        </Link>
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {session.user.role === 'admin' && <AdminDashboard />}
        {session.user.role === 'seller' && <SellerDashboard />}
        {session.user.role === 'buyer' && <BuyerDashboard />}
      </div>
    </div>
  );
} 