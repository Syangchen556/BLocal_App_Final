'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaBox, FaHistory, FaChartPie, FaDownload, FaShoppingCart, FaHeart, FaBell, FaTrash, FaPlus, FaMinus } from 'react-icons/fa';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Toast from '@/components/ui/Toast';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';

// Cart Items Component
function CartItems() {
  const { cart, loading, removeFromCart, updateQuantity } = useCart();
  const router = useRouter();

  if (loading) {
    return <div className="py-4 text-center"><LoadingSpinner size="sm" /></div>;
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="py-8 text-center">
        <FaShoppingCart className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <p className="text-gray-500">Your cart is empty</p>
        <button
          onClick={() => router.push('/products')}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          Shop Now
        </button>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {cart.items.slice(0, 3).map((item) => (
        <div key={item.productId || item._id} className="py-4 flex items-center">
          <div className="relative h-16 w-16 flex-shrink-0">
            {item.product && item.product.imageUrl ? (
              <Image
                src={item.product.imageUrl}
                alt={item.product.name || 'Product'}
                fill
                className="object-cover rounded-md"
              />
            ) : (
              <div className="h-full w-full bg-gray-200 rounded-md flex items-center justify-center">
                <FaShoppingCart className="text-gray-400" />
              </div>
            )}
          </div>
          <div className="ml-4 flex-1">
            <h3 className="text-sm font-medium text-gray-900">
              {item.product && item.product.name ? item.product.name : 'Product'}
            </h3>
            <p className="text-sm text-gray-500">
              {item.quantity} × Nu. {item.product && item.product.price ? item.product.price.toFixed(2) : '0.00'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => updateQuantity(item.productId || item._id, Math.max(1, item.quantity - 1))}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <FaMinus className="h-3 w-3 text-gray-500" />
            </button>
            <span className="text-sm text-gray-700">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.productId || item._id, item.quantity + 1)}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <FaPlus className="h-3 w-3 text-gray-500" />
            </button>
          </div>
          <button
            onClick={() => removeFromCart(item.productId || item._id)}
            className="ml-4 text-red-500 hover:text-red-700"
          >
            <FaTrash className="h-4 w-4" />
          </button>
        </div>
      ))}
      {cart.items.length > 3 && (
        <div className="py-4 text-center">
          <button
            onClick={() => router.push('/cart')}
            className="text-green-600 hover:text-green-800 text-sm font-medium"
          >
            View all {cart.items.length} items
          </button>
        </div>
      )}
    </div>
  );
}

// Wishlist Items Component
function WishlistItems() {
  const { wishlist, loading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [toast, setToast] = useState(null);

  if (loading) {
    return <div className="py-4 text-center"><LoadingSpinner size="sm" /></div>;
  }

  if (!wishlist || !wishlist.items || wishlist.items.length === 0) {
    return (
      <div className="py-8 text-center">
        <FaHeart className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <p className="text-gray-500">Your wishlist is empty</p>
        <button
          onClick={() => router.push('/products')}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          Discover Products
        </button>
      </div>
    );
  }

  const handleAddToCart = async (product) => {
    try {
      setIsAdding(true);
      await addToCart(product);
      // Import toast from react-hot-toast at the top of the file
      // Using the Toast component from UI instead
      setToast({
        message: 'Added to cart successfully',
        type: 'success'
      });
    } catch (error) {
      setToast({
        message: 'Failed to add to cart',
        type: 'error'
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {wishlist.items.slice(0, 3).map((item) => (
          <div key={item.product?._id || item._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="relative h-32 mb-2">
              <Image
                src={item.product && item.product.imageUrl ? item.product.imageUrl : '/images/product-placeholder.jpg'}
                alt={item.product && item.product.name ? item.product.name : 'Product'}
                fill
                className="object-cover rounded-md"
              />
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              {item.product && item.product.name ? item.product.name : 'Product'}
            </h3>
            <p className="text-sm text-gray-500 mb-2 line-clamp-2">
              {item.product && item.product.description ? item.product.description : 'No description available'}
            </p>
            <div className="flex justify-between items-center">
              <p className="text-green-600 font-semibold">
                Nu. {item.product && item.product.price ? item.product.price.toFixed(2) : '0.00'}
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => item.product && handleAddToCart(item.product)}
                  className="p-1 text-green-600 hover:text-green-800"
                  disabled={isAdding || !item.product}
                >
                  <FaShoppingCart className="h-4 w-4" />
                </button>
                <button
                  onClick={() => removeFromWishlist(item.product?._id || item._id)}
                  className="p-1 text-red-500 hover:text-red-700"
                >
                  <FaTrash className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {wishlist.items.length > 3 && (
          <div className="col-span-full text-center py-2">
            <button
              onClick={() => router.push('/wishlist')}
              className="text-green-600 hover:text-green-800 text-sm font-medium"
            >
              View all {wishlist.items.length} items
            </button>
          </div>
        )}
      </div>
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

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

    if (session.user.role.toUpperCase() !== 'BUYER') {
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

        {/* Cart Items */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Your Cart</h2>
            <div className="flex items-center">
              <FaShoppingCart className="text-gray-400 text-xl mr-2" />
              <button
                onClick={() => router.push('/cart')}
                className="text-sm text-green-600 hover:text-green-800"
              >
                View All
              </button>
            </div>
          </div>
          <CartItems />
        </div>

        {/* Wishlist Items */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Your Wishlist</h2>
            <div className="flex items-center">
              <FaHeart className="text-gray-400 text-xl mr-2" />
              <button
                onClick={() => router.push('/wishlist')}
                className="text-sm text-green-600 hover:text-green-800"
              >
                View All
              </button>
            </div>
          </div>
          <WishlistItems />
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