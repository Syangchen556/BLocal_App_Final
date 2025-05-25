'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaCheck, FaTimes, FaTruck } from 'react-icons/fa';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Toast from '@/components/ui/Toast';

export default function OrderDetails({ params }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [order, setOrder] = useState(null);
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

    fetchOrderDetails();
  }, [session, router, params.orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders/${params.orderId}`);
      if (!response.ok) throw new Error('Failed to fetch order details');
      const data = await response.json();
      setOrder(data);
    } catch (error) {
      setError(error.message);
      setToast({
        message: 'Error fetching order details',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      const response = await fetch(`/api/orders/${params.orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update order status');

      setToast({
        message: 'Order status updated successfully',
        type: 'success'
      });

      // Refresh order details
      fetchOrderDetails();
    } catch (error) {
      setToast({
        message: 'Error updating order status',
        type: 'error'
      });
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
          <button
            onClick={() => router.push('/dashboard/seller/orders')}
            className="text-green-600 hover:text-green-900"
          >
            <FaArrowLeft className="inline mr-2" />
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard/seller/orders')}
            className="text-green-600 hover:text-green-900"
          >
            <FaArrowLeft className="inline mr-2" />
            Back to Orders
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Order #{order._id.slice(-6)}
              </h1>
              <div className="flex items-center space-x-4">
                {getStatusBadge(order.status)}
                {order.status === 'pending' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleStatusUpdate('processing')}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <FaCheck className="mr-2" />
                      Process Order
                    </button>
                    <button
                      onClick={() => handleStatusUpdate('cancelled')}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                    >
                      <FaTimes className="mr-2" />
                      Cancel Order
                    </button>
                  </div>
                )}
                {order.status === 'processing' && (
                  <button
                    onClick={() => handleStatusUpdate('shipped')}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                  >
                    <FaTruck className="mr-2" />
                    Mark as Shipped
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Information */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Name:</span> {order.customer.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Email:</span> {order.customer.email}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Phone:</span> {order.customer.phone}
                  </p>
                </div>
              </div>

              {/* Order Information */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Order Information</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Order Date:</span>{' '}
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Payment Method:</span> {order.paymentMethod}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Total Amount:</span> Nu. {order.total.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="mt-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Items</h2>
              <div className="bg-gray-50 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {order.items.map((item) => (
                      <tr key={item._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={item.product.images[0]}
                                alt={item.product.name}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {item.product.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Nu. {item.price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Nu. {(item.price * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
    </div>
  );
} 