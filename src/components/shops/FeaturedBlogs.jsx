import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaBookmark, FaRegBookmark, FaTrash } from 'react-icons/fa';
import { useSession } from 'next-auth/react';

export default function FeaturedBlogs({ shopId, isOwner = false }) {
  const [featuredBlogs, setFeaturedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: session } = useSession();

  useEffect(() => {
    fetchFeaturedBlogs();
  }, [shopId]);

  const fetchFeaturedBlogs = async () => {
    try {
      const response = await fetch(`/api/shops/${shopId}/featured-blogs`);
      if (!response.ok) {
        throw new Error('Failed to fetch featured blogs');
      }
      const data = await response.json();
      setFeaturedBlogs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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

      // Update local state
      setFeaturedBlogs(prev => prev.filter(blog => blog._id !== blogId));
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

  if (featuredBlogs.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        No featured blog posts yet
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Featured Blog Posts</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredBlogs.map((blog) => (
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
                {isOwner && (
                  <button
                    onClick={() => handleRemoveBlog(blog._id)}
                    className="text-red-500 hover:text-red-700"
                    title="Remove from featured"
                  >
                    <FaTrash />
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
                <div className="flex items-center">
                  {blog.author.image && (
                    <div className="relative h-6 w-6 mr-2">
                      <Image
                        src={blog.author.image}
                        alt={blog.author.name}
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                  )}
                  <span>{blog.author.name}</span>
                </div>
                <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 