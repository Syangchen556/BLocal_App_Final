'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function BuyerStats({ userId }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, [userId]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/users/${userId}/stats`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch stats');
      }

      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading statistics...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!stats) {
    return <div>No statistics available.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900">Total Orders</h3>
          <p className="mt-2 text-3xl font-bold text-indigo-600">
            {stats.totalOrders}
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900">Total Spent</h3>
          <p className="mt-2 text-3xl font-bold text-indigo-600">
            ${stats.totalSpent.toFixed(2)}
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900">Average Order Value</h3>
          <p className="mt-2 text-3xl font-bold text-indigo-600">
            ${stats.averageOrderValue.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Most Purchased Categories */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Most Purchased Categories
        </h3>
        <div className="space-y-4">
          {stats.topCategories.map((category) => (
            <div key={category.name} className="flex items-center justify-between">
              <span className="text-gray-600">{category.name}</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2.5 mr-2">
                  <div
                    className="bg-indigo-600 h-2.5 rounded-full"
                    style={{ width: `${(category.count / stats.totalOrders) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-gray-500">{category.count} orders</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Purchases */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Recent Purchases
        </h3>
        <div className="space-y-4">
          {stats.recentPurchases.map((purchase) => (
            <div key={purchase._id} className="flex items-center space-x-4">
              <div className="relative w-16 h-16">
                <Image
                  src={purchase.product.images[0]}
                  alt={purchase.product.name}
                  fill
                  className="object-cover rounded-md"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {purchase.product.name}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(purchase.date).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  ${purchase.price.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">
                  Quantity: {purchase.quantity}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Favorite Shops */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Favorite Shops
        </h3>
        <div className="space-y-4">
          {stats.favoriteShops.map((shop) => (
            <div key={shop._id} className="flex items-center space-x-4">
              <div className="relative w-12 h-12">
                <Image
                  src={shop.logo}
                  alt={shop.name}
                  fill
                  className="object-cover rounded-full"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{shop.name}</p>
                <p className="text-sm text-gray-500">
                  {shop.orderCount} orders
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  ${shop.totalSpent.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 