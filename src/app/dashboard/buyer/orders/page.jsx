'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { FaSearch, FaTruck, FaBox, FaCheckCircle, FaClock } from 'react-icons/fa';

export default function BuyerOrders() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');

  // Sample orders - In a real app, these would come from your database
  const [orders] = useState([
    {
      id: 1,
      orderNumber: "ORD-2024-001",
      date: "2024-03-15",
      total: 45.99,
      status: "Delivered",
      items: [
        { name: "Fresh Tomatoes", quantity: 2, price: 5.99 },
        { name: "Organic Carrots", quantity: 3, price: 3.99 }
      ],
      tracking: {
        carrier: "Local Delivery",
        number: "TRK123456",
        status: "Delivered",
        updates: [
          { date: "2024-03-15 14:00", status: "Delivered to customer" },
          { date: "2024-03-15 10:00", status: "Out for delivery" },
          { date: "2024-03-14 18:00", status: "Processing" }
        ]
      }
    },
    {
      id: 2,
      orderNumber: "ORD-2024-002",
      date: "2024-03-16",
      total: 32.50,
      status: "In Transit",
      items: [
        { name: "Fresh Apples", quantity: 5, price: 3.50 },
        { name: "Organic Potatoes", quantity: 2, price: 4.99 }
      ],
      tracking: {
        carrier: "Local Delivery",
        number: "TRK123457",
        status: "In Transit",
        updates: [
          { date: "2024-03-16 09:00", status: "Out for delivery" },
          { date: "2024-03-15 18:00", status: "Processing" }
        ]
      }
    }
  ]);

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <FaCheckCircle className="text-green-500" />;
      case 'in transit':
        return <FaTruck className="text-blue-500" />;
      case 'processing':
        return <FaBox className="text-yellow-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  const filteredOrders = orders.filter(order =>
    order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow overflow-hidden">
              {/* Order Header */}
              <div className="border-b border-gray-200 bg-gray-50 p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Order #{order.orderNumber}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Placed on {new Date(order.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(order.status)}
                    <span className={`
                      px-3 py-1 rounded-full text-sm font-semibold
                      ${order.status.toLowerCase() === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status.toLowerCase() === 'in transit' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'}
                    `}>
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Items</h4>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600">{item.quantity}x</span>
                        <span className="ml-2 text-sm text-gray-900">{item.name}</span>
                      </div>
                      <span className="text-sm text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">Total</span>
                    <span className="font-medium text-gray-900">
                      ${order.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tracking Information */}
              <div className="border-t border-gray-200 bg-gray-50 p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Tracking Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Carrier:</span>
                    <span className="text-gray-900">{order.tracking.carrier}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tracking Number:</span>
                    <span className="text-gray-900">{order.tracking.number}</span>
                  </div>
                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Updates</h5>
                    <div className="space-y-2">
                      {order.tracking.updates.map((update, index) => (
                        <div key={index} className="flex items-start space-x-2 text-sm">
                          <div className="w-32 flex-shrink-0 text-gray-500">
                            {update.date.split(' ')[1]}
                          </div>
                          <div className="flex-1 text-gray-900">
                            {update.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">No orders found</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 