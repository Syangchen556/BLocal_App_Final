'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  FaUsers,
  FaShoppingCart,
  FaStore,
  FaBox,
  FaChartLine,
  FaChartBar,
  FaChartPie,
  FaArrowUp,
  FaArrowDown,
} from 'react-icons/fa';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AdminAnalytics() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('month'); // month, quarter, year
  const [stats, setStats] = useState({
    overview: {
      totalUsers: 0,
      totalOrders: 0,
      totalRevenue: 0,
      totalProducts: 0,
      userGrowth: 0,
      orderGrowth: 0,
      revenueGrowth: 0,
      productGrowth: 0,
    },
    salesData: [],
    topProducts: [],
    topCategories: [],
    userStats: {
      total: 0,
      buyers: 0,
      sellers: 0,
      admins: 0,
    },
    orderStats: {
      total: 0,
      pending: 0,
      processing: 0,
      delivered: 0,
      cancelled: 0,
    },
  });

  useEffect(() => {
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/');
      return;
    }

    fetchAnalytics();
  }, [session, router, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/analytics?timeRange=${timeRange}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchAnalytics}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <div className="flex space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.overview.totalUsers}</p>
                <div className="flex items-center mt-2">
                  {stats.overview.userGrowth >= 0 ? (
                    <FaArrowUp className="text-green-500" />
                  ) : (
                    <FaArrowDown className="text-red-500" />
                  )}
                  <span className={`text-sm ml-1 ${
                    stats.overview.userGrowth >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {Math.abs(stats.overview.userGrowth)}%
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <FaUsers className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.overview.totalOrders}</p>
                <div className="flex items-center mt-2">
                  {stats.overview.orderGrowth >= 0 ? (
                    <FaArrowUp className="text-green-500" />
                  ) : (
                    <FaArrowDown className="text-red-500" />
                  )}
                  <span className={`text-sm ml-1 ${
                    stats.overview.orderGrowth >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {Math.abs(stats.overview.orderGrowth)}%
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <FaShoppingCart className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">Nu. {stats.overview.totalRevenue}</p>
                <div className="flex items-center mt-2">
                  {stats.overview.revenueGrowth >= 0 ? (
                    <FaArrowUp className="text-green-500" />
                  ) : (
                    <FaArrowDown className="text-red-500" />
                  )}
                  <span className={`text-sm ml-1 ${
                    stats.overview.revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {Math.abs(stats.overview.revenueGrowth)}%
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <FaChartLine className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.overview.totalProducts}</p>
                <div className="flex items-center mt-2">
                  {stats.overview.productGrowth >= 0 ? (
                    <FaArrowUp className="text-green-500" />
                  ) : (
                    <FaArrowDown className="text-red-500" />
                  )}
                  <span className={`text-sm ml-1 ${
                    stats.overview.productGrowth >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {Math.abs(stats.overview.productGrowth)}%
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <FaBox className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Sales Trend */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Sales Trend</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="sales" stroke="#4F46E5" name="Sales" />
                  <Line type="monotone" dataKey="orders" stroke="#10B981" name="Orders" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* User Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">User Distribution</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Buyers', value: stats.userStats.buyers },
                      { name: 'Sellers', value: stats.userStats.sellers },
                      { name: 'Admins', value: stats.userStats.admins },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {[
                      { name: 'Buyers', value: stats.userStats.buyers },
                      { name: 'Sellers', value: stats.userStats.sellers },
                      { name: 'Admins', value: stats.userStats.admins },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top Products and Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Products */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Selling Products</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topProducts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sales" fill="#4F46E5" name="Sales" />
                  <Bar dataKey="revenue" fill="#10B981" name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Categories */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Categories</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topCategories}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="products" fill="#4F46E5" name="Products" />
                  <Bar dataKey="sales" fill="#10B981" name="Sales" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 