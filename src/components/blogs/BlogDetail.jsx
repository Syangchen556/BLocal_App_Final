'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';

export default function BlogDetail({ blogId }) {
  const { data: session } = useSession();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    fetchBlog();
  }, [blogId]);

  const fetchBlog = async () => {
    try {
      const response = await fetch(`/api/blogs/${blogId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch blog');
      }

      setBlog(data);
      if (session) {
        // Check if user has liked the blog
        const likeResponse = await fetch(`/api/blogs/${blogId}/likes`);
        const likeData = await likeResponse.json();
        setLiked(likeData.hasLiked);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/blogs/${blogId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: comment }),
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      setComment('');
      fetchBlog(); // Refresh blog to get new comment
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async () => {
    if (!session) return;

    try {
      const response = await fetch(`/api/blogs/${blogId}/likes`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to toggle like');
      }

      const data = await response.json();
      setLiked(data.hasLiked);
      setBlog(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          likes: data.likes
        }
      }));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div>Loading blog...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!blog) {
    return <div>Blog not found</div>;
  }

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="mb-8">
        <div className="relative h-96 mb-8">
          <Image
            src={blog.media.featuredImage}
            alt={blog.title}
            fill
            className="object-cover rounded-lg"
          />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {blog.title}
        </h1>
        <div className="flex items-center gap-4 text-gray-500 mb-4">
          <span>By {blog.author.name}</span>
          <span>•</span>
          <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
          <span>•</span>
          <span>{blog.metadata.readTime} min read</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 text-sm font-semibold text-indigo-600 bg-indigo-100 rounded-full">
            {blog.category}
          </span>
          {blog.tags?.map(tag => (
            <span
              key={tag}
              className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </header>

      {/* Content */}
      <div className="prose prose-lg max-w-none mb-12">
        {blog.content}
      </div>

      {/* Video */}
      {blog.media.video?.url && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Video</h2>
          <div className="relative aspect-video">
            <iframe
              src={blog.media.video.url}
              title={blog.title}
              className="absolute inset-0 w-full h-full rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          {blog.media.video.duration > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              Duration: {Math.floor(blog.media.video.duration / 60)}:{(blog.media.video.duration % 60).toString().padStart(2, '0')}
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-8 mb-12">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 ${
            liked ? 'text-red-500' : 'text-gray-500'
          }`}
        >
          <svg
            className="w-6 h-6"
            fill={liked ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <span>{blog.metadata.likes} Likes</span>
        </button>
        <div className="flex items-center gap-2 text-gray-500">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          <span>{blog.metadata.views} Views</span>
        </div>
      </div>

      {/* Comments */}
      <section className="border-t pt-8">
        <h2 className="text-2xl font-bold mb-6">Comments ({blog.comments?.length || 0})</h2>

        {session ? (
          <form onSubmit={handleComment} className="mb-8">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment..."
              className="w-full p-4 border rounded-lg mb-4"
              rows={4}
            />
            <button
              type="submit"
              disabled={submitting || !comment.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </form>
        ) : (
          <div className="mb-8 text-center">
            <Link
              href="/auth/signin"
              className="text-indigo-600 hover:text-indigo-700"
            >
              Sign in to comment
            </Link>
          </div>
        )}

        <div className="space-y-6">
          {blog.comments?.map((comment) => (
            <div key={comment._id} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Image
                  src={comment.author.image || '/default-avatar.png'}
                  alt={comment.author.name}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <span className="font-semibold">{comment.author.name}</span>
                <span className="text-gray-500 text-sm">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-700">{comment.content}</p>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
} 