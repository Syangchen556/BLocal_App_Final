'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { FaSearch, FaCheck, FaTimes, FaStore, FaChartLine } from 'react-icons/fa';

export default function AdminShopsPage() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  useEffect(() => {
    if (status === 'loading') return;

    // Redirect if not admin
    if (!session || session.user.role.toUpperCase() !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }

    fetchShops();
  }, [session, status, router]);

  const fetchShops = async () => {
    try {
      const response = await fetch('/api/admin/shops');
      if (!response.ok) {
        throw new Error('Failed to fetch shops');
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format received');
      }
      setShops(data);
      
      // Calculate statistics
      const stats = {
        total: data.length,
        pending: data.filter(shop => shop.status === 'inactive').length, // inactive is our pending state
        approved: data.filter(shop => shop.status === 'active').length,
        rejected: data.filter(shop => shop.status === 'rejected').length
      };
      setStats(stats);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (shopId, newStatus, message = '') => {
    try {
      // Show confirmation dialog for important actions
      if (newStatus === 'active' || newStatus === 'rejected') {
        if (!confirm(`Are you sure you want to ${newStatus === 'active' ? 'approve' : 'reject'} this shop?`)) {
          return;
        }
      }
      
      // Default messages for different status changes
      if (!message) {
        if (newStatus === 'active') {
          message = 'Shop approved by admin. You can now start adding products.';
        } else if (newStatus === 'rejected') {
          message = 'Shop request rejected by admin. Please contact support for more information.';
        } else if (newStatus === 'inactive') {
          message = 'Shop deactivated by admin.';
        }
      }
      
      const response = await fetch('/api/admin/shops', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          shopId, 
          status: newStatus,
          message,
          notifySeller: true // Add flag to send notification to seller
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update shop status');
      }

      // Refresh the shops list
      await fetchShops();
      toast.success(`Shop ${newStatus === 'active' ? 'approved' : newStatus} successfully`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'inactive': // inactive is our pending state
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'suspended':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Format status for display
  const formatStatus = (status) => {
    if (status === 'inactive') {
      return 'Pending';
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const filteredShops = shops.filter(shop =>
    shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shop.ownerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen p-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Shop Management</h1>
        <p className="text-gray-600">Manage all shops in the system</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <FaStore className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">Total Shops</h2>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <FaChartLine className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">Pending Approval</h2>
              <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <FaCheck className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">Approved</h2>
              <p className="text-2xl font-semibold text-gray-900">{stats.approved}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-full">
              <FaTimes className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">Rejected</h2>
              <p className="text-2xl font-semibold text-gray-900">{stats.rejected}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search shops..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Shops Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden mt-8">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shop
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Products
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredShops.map((shop) => (
                <tr key={shop._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {shop.logo ? (
                        <div className="flex-shrink-0 h-10 w-10 relative">
                          <Image
                            src={shop.logo}
                            alt={shop.name}
                            fill
                            className="rounded-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 text-sm">
                            {shop.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {shop.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {shop.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{shop.ownerName}</div>
                    <div className="text-sm text-gray-500">{shop.ownerEmail}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {shop.productCount || 0} products
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {shop.rating ? (
                      <div className="flex items-center">
                        <span className="text-yellow-400">★</span>
                        <span className="ml-1">{shop.rating.toFixed(1)}</span>
                      </div>
                    ) : (
                      'No ratings'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(shop.status)}`}>
                      {formatStatus(shop.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link 
                      href={`/shop/${shop._id}`}
                      className="text-green-600 hover:text-green-900 mr-4"
                    >
                      View
                    </Link>
                    {shop.status === 'inactive' ? (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(
                            shop._id, 
                            'active',
                            'Shop approved by admin. You can now start adding products.'
                          )}
                          className="text-blue-600 hover:text-blue-900 mr-2"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(
                            shop._id, 
                            'rejected',
                            'Shop request rejected by admin. Please contact support for more information.'
                          )}
                          className="text-red-600 hover:text-red-900"
                        >
                          Reject
                        </button>
                      </>
                    ) : shop.status === 'active' ? (
                      <button
                        onClick={() => handleStatusUpdate(
                          shop._id, 
                          'inactive',
                          'Shop deactivated by admin.'
                        )}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Deactivate
                      </button>
                    ) : shop.status === 'rejected' ? (
                      <button
                        onClick={() => handleStatusUpdate(
                          shop._id, 
                          'inactive',
                          'Shop request reactivated for review.'
                        )}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Review Again
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 