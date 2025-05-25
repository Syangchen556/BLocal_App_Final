'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FaPlus, FaImage } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function CreateBlog() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    coverImage: '',
    tags: []
  });

  if (!session || !['admin', 'seller', 'buyer'].includes(session.user.role.toLowerCase())) {
    router.push('/login');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch('/api/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to create blog');

      toast.success('Blog post created successfully!');
      router.push('/blog');
    } catch (error) {
      console.error('Error creating blog:', error);
      toast.error('Failed to create blog post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload image');

      const data = await response.json();
      setFormData(prev => ({ ...prev, coverImage: data.url }));
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center space-x-2 mb-6">
          <FaPlus className="text-green-500 text-2xl" />
          <h1 className="text-2xl font-bold text-gray-900">Create New Blog Post</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Content *
            </label>
            <textarea
              id="content"
              rows="10"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Cover Image
            </label>
            <div className="mt-1 flex items-center space-x-4">
              <label className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500">
                <span className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md">
                  <FaImage />
                  <span>Upload Image</span>
                </span>
                <input
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>
              {formData.coverImage && (
                <span className="text-sm text-gray-500">Image uploaded</span>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
              Tags (comma separated)
            </label>
            <input
              type="text"
              id="tags"
              value={formData.tags.join(', ')}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
              }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              placeholder="e.g. farming, organic, vegetables"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`
                flex items-center space-x-2 px-6 py-2 border border-transparent rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500
                ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <FaPlus className={isSubmitting ? 'animate-spin' : ''} />
              <span>Create Post</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 