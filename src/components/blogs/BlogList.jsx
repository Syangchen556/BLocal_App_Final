'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [category, setCategory] = useState('');
  const [tag, setTag] = useState('');

  const fetchBlogs = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(category && { category }),
        ...(tag && { tag })
      });

      const response = await fetch(`/api/blogs?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch blogs');
      }

      if (page === 1) {
        setBlogs(data.blogs);
      } else {
        setBlogs(prev => [...prev, ...data.blogs]);
      }

      setHasMore(data.pagination.page < data.pagination.pages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [page, category, tag]);

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  if (loading && page === 1) {
    return <div>Loading blogs...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Blog Posts</h1>
        <Link
          href="/blogs/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Write a Blog
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-8 flex gap-4">
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          className="rounded-md border-gray-300"
        >
          <option value="">All Categories</option>
          <option value="RECIPES">Recipes</option>
          <option value="FARMING">Farming</option>
          <option value="NUTRITION">Nutrition</option>
          <option value="SUSTAINABILITY">Sustainability</option>
          <option value="OTHER">Other</option>
        </select>

        <input
          type="text"
          value={tag}
          onChange={(e) => {
            setTag(e.target.value);
            setPage(1);
          }}
          placeholder="Filter by tag"
          className="rounded-md border-gray-300"
        />
      </div>

      {/* Blog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogs.map((blog) => (
          <Link
            key={blog._id}
            href={`/blogs/${blog._id}`}
            className="group"
          >
            <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48">
                <Image
                  src={blog.media.featuredImage}
                  alt={blog.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 text-xs font-semibold text-indigo-600 bg-indigo-100 rounded-full">
                    {blog.category}
                  </span>
                  {blog.media.video?.url && (
                    <span className="px-2 py-1 text-xs font-semibold text-red-600 bg-red-100 rounded-full">
                      Video
                    </span>
                  )}
                  <span className="text-sm text-gray-500">
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600">
                  {blog.title}
                </h2>
                <p className="mt-2 text-gray-600 line-clamp-3">
                  {blog.summary}
                </p>
                <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                  <span>{blog.metadata.views} views</span>
                  <span>{blog.metadata.likes} likes</span>
                  <span>{blog.comments?.length || 0} comments</span>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="mt-8 text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
} 