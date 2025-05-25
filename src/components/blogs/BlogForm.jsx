'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

const categories = ['RECIPES', 'FARMING', 'NUTRITION', 'SUSTAINABILITY', 'OTHER'];

export default function BlogForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    category: 'RECIPES',
    tags: '',
    media: {
      featuredImage: '',
      video: {
        url: '',
        thumbnail: '',
        duration: 0
      },
      gallery: []
    },
    status: 'DRAFT'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'tags') {
      setFormData(prev => ({
        ...prev,
        tags: value.split(',').map(tag => tag.trim())
      }));
    } else if (name === 'featuredImage') {
      setFormData(prev => ({
        ...prev,
        media: {
          ...prev.media,
          featuredImage: value
        }
      }));
    } else if (name === 'videoUrl') {
      setFormData(prev => ({
        ...prev,
        media: {
          ...prev.media,
          video: {
            ...prev.media.video,
            url: value
          }
        }
      }));
    } else if (name === 'videoThumbnail') {
      setFormData(prev => ({
        ...prev,
        media: {
          ...prev.media,
          video: {
            ...prev.media.video,
            thumbnail: value
          }
        }
      }));
    } else if (name === 'videoDuration') {
      setFormData(prev => ({
        ...prev,
        media: {
          ...prev.media,
          video: {
            ...prev.media.video,
            duration: parseInt(value) || 0
          }
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create blog');
      }

      router.push('/blogs');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return <div>Please sign in to create a blog post.</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6 space-y-6">
      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">
          Content
        </label>
        <textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleChange}
          required
          rows={10}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="summary" className="block text-sm font-medium text-gray-700">
          Summary
        </label>
        <textarea
          id="summary"
          name="summary"
          value={formData.summary}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Category
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
          Tags (comma-separated)
        </label>
        <input
          type="text"
          id="tags"
          name="tags"
          value={formData.tags.join(', ')}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="featuredImage" className="block text-sm font-medium text-gray-700">
          Featured Image URL
        </label>
        <input
          type="url"
          id="featuredImage"
          name="featuredImage"
          value={formData.media.featuredImage}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      {/* Video Section */}
      <div className="space-y-4 border-t pt-4">
        <h3 className="text-lg font-medium text-gray-900">Video (Optional)</h3>
        
        <div>
          <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700">
            Video URL
          </label>
          <input
            type="url"
            id="videoUrl"
            name="videoUrl"
            value={formData.media.video.url}
            onChange={handleChange}
            placeholder="https://youtube.com/watch?v=..."
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <p className="mt-1 text-sm text-gray-500">
            Supported platforms: YouTube, Vimeo
          </p>
        </div>

        <div>
          <label htmlFor="videoThumbnail" className="block text-sm font-medium text-gray-700">
            Video Thumbnail URL
          </label>
          <input
            type="url"
            id="videoThumbnail"
            name="videoThumbnail"
            value={formData.media.video.thumbnail}
            onChange={handleChange}
            placeholder="https://..."
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="videoDuration" className="block text-sm font-medium text-gray-700">
            Video Duration (in seconds)
          </label>
          <input
            type="number"
            id="videoDuration"
            name="videoDuration"
            value={formData.media.video.duration}
            onChange={handleChange}
            min="0"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
        </select>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Blog'}
        </button>
      </div>
    </form>
  );
} 