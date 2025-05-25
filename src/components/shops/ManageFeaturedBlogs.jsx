import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaPlus, FaTrash } from 'react-icons/fa';

export default function ManageFeaturedBlogs({ shopId }) {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBlogs, setSelectedBlogs] = useState([]);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await fetch('/api/blogs/my-blogs');
      if (!response.ok) {
        throw new Error('Failed to fetch blogs');
      }
      const data = await response.json();
      setBlogs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBlog = async (blogId) => {
    try {
      const response = await fetch(`/api/shops/${shopId}/featured-blogs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ blogId }),
      });

      if (!response.ok) {
        throw new Error('Failed to add blog to featured');
      }

      // Update selected blogs
      setSelectedBlogs(prev => [...prev, blogId]);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemoveBlog = async (blogId) => {
    try {
      const response = await fetch(`/api/shops/${shopId}/featured-blogs`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ blogId }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove blog from featured');
      }

      // Update selected blogs
      setSelectedBlogs(prev => prev.filter(id => id !== blogId));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-4">
        {error}
      </div>
    );
  }

  if (blogs.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        No blog posts available. <Link href="/blogs/write" className="text-indigo-600 hover:text-indigo-800">Write your first blog</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Manage Featured Blog Posts</h2>
        <Link
          href="/blogs/write"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <FaPlus className="mr-2" />
          Write New Blog
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((blog) => (
          <div key={blog._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative h-48">
              <Image
                src={blog.media.featuredImage}
                alt={blog.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-1 text-xs font-semibold text-indigo-600 bg-indigo-100 rounded-full">
                  {blog.category}
                </span>
                {selectedBlogs.includes(blog._id) ? (
                  <button
                    onClick={() => handleRemoveBlog(blog._id)}
                    className="text-red-500 hover:text-red-700"
                    title="Remove from featured"
                  >
                    <FaTrash />
                  </button>
                ) : (
                  <button
                    onClick={() => handleAddBlog(blog._id)}
                    className="text-indigo-500 hover:text-indigo-700"
                    title="Add to featured"
                  >
                    <FaPlus />
                  </button>
                )}
              </div>
              <Link href={`/blogs/${blog._id}`}>
                <h3 className="text-xl font-semibold text-gray-900 hover:text-indigo-600 mb-2">
                  {blog.title}
                </h3>
              </Link>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {blog.summary}
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                <span className="capitalize">{blog.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 