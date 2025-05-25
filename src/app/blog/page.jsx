'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FaSearch, FaPlus } from 'react-icons/fa';
import CreatePost from '@/components/blog/CreatePost';
import PostInteractions from '@/components/blog/PostInteractions';

export default function Blog() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [blogPosts, setBlogPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch posts on component mount
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts');
      if (!response.ok) throw new Error('Failed to fetch posts');
      const data = await response.json();
      setBlogPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePost = async (postData) => {
    if (!session) {
      alert('Please log in to create a post');
      return;
    }
    
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) throw new Error('Failed to create post');
      
      const newPost = await response.json();
      setBlogPosts([newPost, ...blogPosts]);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    }
  };

  const handleComment = async (postId, commentData) => {
    if (!session) return;
    
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: commentData.text }),
      });

      if (!response.ok) throw new Error('Failed to add comment');
      
      const newComment = await response.json();
      setBlogPosts(posts =>
        posts.map(post =>
          post.id === postId
            ? {
                ...post,
                comments: [newComment, ...post.comments],
              }
            : post
        )
      );
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    }
  };

  const handleLike = async (postId) => {
    if (!session) return;
    
    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to like post');
      
      setBlogPosts(posts =>
        posts.map(post =>
          post.id === postId
            ? { ...post, likes: [...post.likes, { userId: session.user.id }] }
            : post
        )
      );
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const filteredPosts = blogPosts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog</h1>
          <p className="text-lg text-gray-600">
            Latest news, guides, and insights about fresh produce
          </p>
        </div>

        {/* Search and Create Post */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 space-y-4 md:space-y-0">
          <div className="relative w-full md:w-96">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search blog posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          {session?.user && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-green-500 text-white px-6 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-600 transition-colors"
            >
              <FaPlus />
              <span>Create Post</span>
            </button>
          )}
        </div>

        {/* Blog Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
            >
              <div className="h-48 bg-gray-200">
                <img
                  src={post.imageUrl || '/images/default-blog.jpg'}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {post.title}
                </h2>
                <p className="text-gray-600 mb-4">{post.excerpt}</p>
                <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-2">
                    {post.author.image && (
                      <img
                        src={post.author.image}
                        alt={post.author.name}
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                    <span>{post.author.name}</span>
                  </div>
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>

                {/* Post Interactions */}
                <PostInteractions
                  post={post}
                  onLike={() => handleLike(post.id)}
                  onComment={(commentData) => handleComment(post.id, commentData)}
                />
              </div>
            </div>
          ))}
        </div>

        {/* No Results Message */}
        {filteredPosts.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            {searchQuery
              ? "No blog posts found matching your search."
              : "No blog posts yet. Be the first to create one!"}
          </div>
        )}

        {/* Create Post Modal */}
        {showCreateModal && (
          <CreatePost
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreatePost}
          />
        )}
      </div>
    </div>
  );
} 