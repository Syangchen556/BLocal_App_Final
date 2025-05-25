'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function FeaturedBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch('/api/blogs?featured=true');
        if (!response.ok) {
          throw new Error('Failed to fetch blogs');
        }
        const data = await response.json();
        setBlogs(data);
      } catch (error) {
        console.error('Error fetching blogs:', error);
        setError('Failed to load blogs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 py-8">
        {error}
      </div>
    );
  }

  if (!blogs.length) {
    return (
      <div className="text-center text-gray-600 py-8">
        No featured blogs available at the moment.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {blogs.map((blog) => (
        <Link 
          key={blog._id} 
          href={`/blog/${blog._id}`}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
        >
          <div className="relative h-48 w-full">
            <Image
              src={blog.image || '/images/vegetables-hero.jpg'}
              alt={blog.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="p-4">
            <h3 className="text-xl font-semibold mb-2 hover:text-green-600">
              {blog.title}
            </h3>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {blog.content}
            </p>
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
              <span>{blog.author?.name || 'Anonymous'}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
} 