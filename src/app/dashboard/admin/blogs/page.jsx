'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  FaSearch,
  FaTrash,
  FaEye,
  FaEdit,
  FaCheck,
  FaTimes,
} from 'react-icons/fa';

export default function AdminBlogs() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/');
      return;
    }

    fetchBlogs();
  }, [session, router]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/admin/blogs');
      if (!res.ok) throw new Error('Failed to fetch blogs');
      
      const data = await res.json();
      setBlogs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (blogId, status) => {
    try {
      const res = await fetch('/api/admin/blogs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: blogId, status }),
      });

      if (!res.ok) throw new Error('Failed to update blog status');
      
      // Refresh blogs list
      fetchBlogs();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (blogId) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;

    try {
      const res = await fetch(`/api/admin/blogs?id=${blogId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete blog');
      
      // Refresh blogs list
      fetchBlogs();
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = 
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.author.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || blog.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading blogs...</p>
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
              onClick={fetchBlogs}
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
          <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
          <button
            onClick={() => router.push('/dashboard/admin')}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search blogs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Blogs Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Blog Post
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
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
                {filteredBlogs.map((blog) => (
                  <tr key={blog._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 relative flex-shrink-0">
                          <Image
                            src={blog.coverImage || '/placeholder.png'}
                            alt={blog.title}
                            fill
                            className="rounded-lg object-cover"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {blog.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {blog.summary.substring(0, 50)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{blog.author.name}</div>
                      <div className="text-sm text-gray-500">{blog.author.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{blog.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={blog.status}
                        onChange={(e) => handleStatusUpdate(blog._id, e.target.value)}
                        className="text-sm text-gray-900 border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="pending">Pending</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => router.push(`/blogs/${blog._id}`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <FaEye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => router.push(`/blogs/${blog._id}/edit`)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <FaEdit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(blog._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FaTrash className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 