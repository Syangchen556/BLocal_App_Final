'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaCreditCard, FaMoneyBill, FaMobile } from 'react-icons/fa';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';

export default function Checkout() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('CARD');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    if (session.user.role === 'SELLER') {
      router.push('/dashboard/seller');
      return;
    }

    fetchCart();
  }, [session, router]);

  const fetchCart = async () => {
    try {
      const response = await fetch('/api/cart');
      if (response.ok) {
        const data = await response.json();
        setCart(data);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setToast({
        message: 'Error loading cart',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!cart?.items?.length) return 0;
    return cart.items.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  };

  const handlePaymentMethodChange = (method) => {
    setSelectedPaymentMethod(method);
  };

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cart.items.map(item => ({
            product: item.product._id,
            quantity: item.quantity
          })),
          paymentMethod: selectedPaymentMethod
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to place order');
      }

      const order = await response.json();
      setToast({
        message: 'Order placed successfully!',
        type: 'success'
      });

      // Redirect to order confirmation page
      router.push(`/dashboard/buyer/orders/${order._id}`);
    } catch (error) {
      console.error('Error placing order:', error);
      setToast({
        message: 'Error placing order',
        type: 'error'
      });
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <FaArrowLeft className="mr-2" />
            Back to Cart
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
            <div className="space-y-4">
              {cart?.items?.map((item) => (
                <div key={item.product._id} className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.product.name}</p>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    Nu. {item.product.price * item.quantity}
                  </p>
                </div>
              ))}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <p className="text-lg font-semibold text-gray-900">Total</p>
                  <p className="text-lg font-semibold text-gray-900">
                    Nu. {calculateTotal()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Method</h2>
            <div className="space-y-4">
              <button
                onClick={() => handlePaymentMethodChange('CARD')}
                className={`w-full p-4 border rounded-lg flex items-center space-x-3 ${
                  selectedPaymentMethod === 'CARD'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FaCreditCard className={`text-xl ${
                  selectedPaymentMethod === 'CARD' ? 'text-blue-500' : 'text-gray-400'
                }`} />
                <span className="text-gray-900">Credit/Debit Card</span>
              </button>

              <button
                onClick={() => handlePaymentMethodChange('CASH')}
                className={`w-full p-4 border rounded-lg flex items-center space-x-3 ${
                  selectedPaymentMethod === 'CASH'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FaMoneyBill className={`text-xl ${
                  selectedPaymentMethod === 'CASH' ? 'text-blue-500' : 'text-gray-400'
                }`} />
                <span className="text-gray-900">Cash on Delivery</span>
              </button>

              <button
                onClick={() => handlePaymentMethodChange('MOBILE_MONEY')}
                className={`w-full p-4 border rounded-lg flex items-center space-x-3 ${
                  selectedPaymentMethod === 'MOBILE_MONEY'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FaMobile className={`text-xl ${
                  selectedPaymentMethod === 'MOBILE_MONEY' ? 'text-blue-500' : 'text-gray-400'
                }`} />
                <span className="text-gray-900">Mobile Money</span>
              </button>
            </div>

            <div className="mt-8">
              <Button
                variant="primary"
                onClick={handlePlaceOrder}
                className="w-full"
                disabled={loading}
              >
                Place Order
              </Button>
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