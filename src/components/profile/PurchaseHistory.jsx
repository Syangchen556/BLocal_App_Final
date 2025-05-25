'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function PurchaseHistory({ userId }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [userId]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/orders?userId=${userId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch orders');
      }

      setOrders(data.orders);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading orders...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Purchase History</h2>

      {orders.length === 0 ? (
        <p className="text-gray-500">No orders found.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-gray-500">Order #{order._id}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                  order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {order.status}
                </span>
              </div>

              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item._id} className="flex items-center space-x-4">
                    <div className="relative w-20 h-20">
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                    <div className="flex-1">
                      <Link
                        href={`/products/${item.product._id}`}
                        className="text-sm font-medium text-gray-900 hover:text-indigo-600"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity}
                      </p>
                      <p className="text-sm text-gray-900">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total</span>
                  <span className="font-medium text-gray-900">
                    ${order.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 