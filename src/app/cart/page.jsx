'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaTrash, FaMinus, FaPlus, FaShoppingBag, FaCreditCard } from 'react-icons/fa';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import { useCart } from '@/contexts/CartContext';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function Cart() {
  const { data: session } = useSession();
  const router = useRouter();
  const { cart, loading, updateQuantity, removeFromCart, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmTitle, setConfirmTitle] = useState('Confirm Action');
  const [confirmMessage, setConfirmMessage] = useState('Are you sure you want to proceed with this action? This cannot be undone.');

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    if (session?.user?.role?.toUpperCase() === 'SELLER') {
      router.push('/dashboard/seller');
      return;
    }
  }, [session, router]);

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      setIsLoading(true);
      await updateQuantity(productId, newQuantity);
      toast.success('Cart updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update cart');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveItem = async (productId) => {
    setConfirmAction(() => async () => {
      try {
        setIsLoading(true);
        await removeFromCart(productId);
        toast.success('Item removed from cart');
      } catch (error) {
        toast.error(error.message || 'Failed to remove item');
      } finally {
        setIsLoading(false);
        setShowConfirm(false);
      }
    });
    setShowConfirm(true);
  };

  const handleClearCart = () => {
    setConfirmTitle('Clear Cart');
    setConfirmMessage('Are you sure you want to clear your entire cart? This action cannot be undone.');
    setConfirmAction(() => async () => {
      try {
        setIsLoading(true);
        await clearCart();
        toast.success('Cart cleared successfully');
      } catch (error) {
        toast.error(error.message || 'Failed to clear cart');
      } finally {
        setIsLoading(false);
        setShowConfirm(false);
      }
    });
    setShowConfirm(true);
  };
  
  const handlePlaceOrder = () => {
    setConfirmTitle('Place Order');
    setConfirmMessage('Are you sure you want to place this order? You will be redirected to the payment page.');
    setConfirmAction(() => async () => {
      try {
        setIsLoading(true);
        
        // Create order in the database
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            items: cart.items.map(item => ({
              productId: item.product?._id,
              quantity: item.quantity,
              price: item.product?.price || 0
            })),
            total: cart.total
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to place order');
        }

        const data = await response.json();
        
        // Clear the cart after successful order placement
        await clearCart();
        
        toast.success('Order placed successfully!');
        
        // Redirect to payment page with order ID
        router.push(`/payment?orderId=${data.orderId}`);
      } catch (error) {
        console.error('Error placing order:', error);
        toast.error(error.message || 'Failed to place order');
      } finally {
        setIsLoading(false);
        setShowConfirm(false);
      }
    });
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    if (confirmAction) {
      await confirmAction();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        {cart?.items?.length > 0 && (
          <button
            onClick={handleClearCart}
            className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-700"
          >
            <FaTrash />
            <span>Clear Cart</span>
          </button>
        )}
      </div>

      {!cart || !cart.items || !cart.items.length ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-500 mb-4">Your cart is empty</p>
          <Button
            variant="primary"
            onClick={() => router.push('/shop')}
          >
            Continue Shopping
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="divide-y divide-gray-200">
                {cart.items.map((item) => (
                  <div key={item.product?._id || item._id} className="p-6 flex items-center">
                    <div className="relative h-24 w-24 flex-shrink-0">
                      {item.product && item.product.imageUrl ? (
                        <Image
                          src={item.product.imageUrl}
                          alt={item.product.name || 'Product'}
                          fill
                          className="object-cover rounded-md"
                        />
                      ) : (
                        <div className="h-full w-full bg-gray-200 rounded-md flex items-center justify-center">
                          <span className="text-gray-400">No Image</span>
                        </div>
                      )}
                    </div>
                    <div className="ml-6 flex-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        {item.product?.name || 'Product'}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {item.product?.shop?.name || 'Shop'}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center">
                          <button
                            onClick={() => handleQuantityChange(item.product?._id || item._id, item.quantity - 1)}
                            className="p-1 rounded-full hover:bg-gray-100"
                          >
                            <FaMinus className="h-4 w-4 text-gray-500" />
                          </button>
                          <span className="mx-2 text-gray-700">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.product?._id || item._id, item.quantity + 1)}
                            className="p-1 rounded-full hover:bg-gray-100"
                          >
                            <FaPlus className="h-4 w-4 text-gray-500" />
                          </button>
                        </div>
                        <div className="flex items-center">
                          <span className="text-gray-900 font-medium">
                            Nu. {item.product && item.product.price ? (item.product.price * item.quantity).toFixed(2) : '0.00'}
                          </span>
                          <button
                            onClick={() => handleRemoveItem(item.product?._id || item._id)}
                            className="ml-4 text-red-500 hover:text-red-700"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900 font-medium">
                    Nu. {cart && cart.total ? cart.total.toFixed(2) : '0.00'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900 font-medium">Nu. 0.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900 font-medium">Nu. 0.00</span>
                </div>
                <div className="border-t pt-4 flex justify-between">
                  <span className="text-lg font-medium text-gray-900">Total</span>
                  <span className="text-lg font-bold text-gray-900">
                    Nu. {cart && cart.total ? cart.total.toFixed(2) : '0.00'}
                  </span>
                </div>
                <Button
                  variant="primary"
                  className="w-full mt-4"
                  onClick={handlePlaceOrder}
                  disabled={isLoading}
                >
                  <FaShoppingBag className="mr-2" />
                  Place Order
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirm}
        title={confirmTitle}
        message={confirmMessage}
      />
    </div>
  );
}