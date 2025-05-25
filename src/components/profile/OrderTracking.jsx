'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const orderStatuses = [
  { id: 'PLACED', label: 'Order Placed' },
  { id: 'CONFIRMED', label: 'Order Confirmed' },
  { id: 'PROCESSING', label: 'Processing' },
  { id: 'SHIPPED', label: 'Shipped' },
  { id: 'DELIVERED', label: 'Delivered' }
];

export default function OrderTracking({ userId }) {
  const [activeOrders, setActiveOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchActiveOrders();
  }, [userId]);

  const fetchActiveOrders = async () => {
    try {
      const response = await fetch(`/api/orders?userId=${userId}&status=active`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch orders');
      }

      setActiveOrders(data.orders);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIndex = (status) => {
    return orderStatuses.findIndex(s => s.id === status);
  };

  if (loading) {
    return <div>Loading orders...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Tracking</h2>

      {activeOrders.length === 0 ? (
        <p className="text-gray-500">No active orders to track.</p>
      ) : (
        <div className="space-y-8">
          {activeOrders.map((order) => (
            <div key={order._id} className="border rounded-lg p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Order #{order._id}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    Total: ${order.total.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {order.items.length} items
                  </p>
                </div>
              </div>

              {/* Order Status Timeline */}
              <div className="relative">
                <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-200" />
                <div className="relative flex justify-between">
                  {orderStatuses.map((status, index) => {
                    const isCompleted = index <= getStatusIndex(order.status);
                    const isCurrent = index === getStatusIndex(order.status);

                    return (
                      <div key={status.id} className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            isCompleted
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-200 text-gray-400'
                          }`}
                        >
                          {isCompleted ? (
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          ) : (
                            <span className="text-sm">{index + 1}</span>
                          )}
                        </div>
                        <span
                          className={`mt-2 text-xs font-medium ${
                            isCurrent
                              ? 'text-indigo-600'
                              : isCompleted
                              ? 'text-gray-900'
                              : 'text-gray-500'
                          }`}
                        >
                          {status.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Items */}
              <div className="mt-8 space-y-4">
                {order.items.map((item) => (
                  <div key={item._id} className="flex items-center space-x-4">
                    <div className="relative w-16 h-16">
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {item.product.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 