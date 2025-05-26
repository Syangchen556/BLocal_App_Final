'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaCheck, FaArrowLeft, FaHome, FaShoppingBag } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';

export default function OrderConfirmationPage({ params }) {
  const { data: session } = useSession();
  const router = useRouter();
  const { orderId } = params;
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    
    if (!orderId) {
      setError('No order ID provided');
      setLoading(false);
      return;
    }
    
    fetchOrderDetails();
  }, [session, orderId, router]);
  
  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch the order details
      const response = await fetch(`/api/orders/${orderId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }
      
      const data = await response.json();
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
      setError('Failed to load order details. Please try again.');
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-700 mb-6">{error}</p>
          <Button
            variant="primary"
            onClick={() => router.push('/dashboard/buyer')}
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCheck className="text-green-500 text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">
            Thank you for your purchase. Your order has been confirmed and is being processed.
          </p>
        </div>
        
        <div className="border-t border-b py-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between mb-4">
            <div>
              <h2 className="text-sm text-gray-500">Order Number</h2>
              <p className="font-medium">{order?.orderNumber || orderId}</p>
            </div>
            <div>
              <h2 className="text-sm text-gray-500">Order Date</h2>
              <p className="font-medium">
                {order?.createdAt 
                  ? new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : 'N/A'}
              </p>
            </div>
            <div>
              <h2 className="text-sm text-gray-500">Order Status</h2>
              <p className="font-medium capitalize">{order?.status || 'Processing'}</p>
            </div>
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
          
          <div className="space-y-4">
            {order?.items?.map((item, index) => (
              <div key={index} className="flex items-center py-4 border-b">
                <div className="relative h-16 w-16 flex-shrink-0 rounded-md overflow-hidden">
                  {item.product?.imageUrl ? (
                    <Image
                      src={item.product.imageUrl}
                      alt={item.product?.name || 'Product'}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                      <span className="text-xs text-gray-500">No Image</span>
                    </div>
                  )}
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-sm font-medium text-gray-900">
                    {item.product?.name || 'Product'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Quantity: {item.quantity}
                  </p>
                </div>
                <div className="text-sm font-medium text-gray-900">
                  Nu. {((item.price || 0) * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
            
            <div className="space-y-2 pt-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>Nu. {order?.total ? order.total.toFixed(2) : '0.00'}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>Nu. 0.00</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span>Nu. 0.00</span>
              </div>
              
              <div className="flex justify-between font-bold pt-2 border-t">
                <span>Total</span>
                <span>Nu. {order?.total ? order.total.toFixed(2) : '0.00'}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <Button
            variant="outline"
            className="flex-1 flex items-center justify-center"
            onClick={() => router.push('/shop')}
          >
            <FaHome className="mr-2" />
            Continue Shopping
          </Button>
          <Button
            variant="primary"
            className="flex-1 flex items-center justify-center"
            onClick={() => router.push('/dashboard/buyer')}
          >
            <FaShoppingBag className="mr-2" />
            View My Orders
          </Button>
        </div>
      </div>
    </div>
  );
}
