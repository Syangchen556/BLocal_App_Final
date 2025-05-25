import { useState } from 'react';
import { FaHeart, FaRegHeart, FaComment, FaShare, FaTimes, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useSession } from 'next-auth/react';

export default function PostInteractions({ post, onLike, onComment }) {
  const { data: session } = useSession();
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [comment, setComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);

  const handleLike = () => {
    if (!session) {
      alert('Please log in to like posts');
      return;
    }
    setIsLiked(!isLiked);
    onLike?.();
  };

  const handleComment = (e) => {
    e.preventDefault();
    if (!session) {
      alert('Please log in to comment');
      return;
    }
    if (comment.trim()) {
      onComment?.({
        text: comment,
        userId: session.user.id,
        userName: session.user.name,
        userImage: session.user.image,
        date: new Date().toISOString()
      });
      setComment('');
      setShowCommentBox(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        });
      } else {
        // Fallback to copying URL
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Get visible comments based on show all state
  const visibleComments = showAllComments ? post.comments : post.comments.slice(0, 3);
  const hasMoreComments = post.comments.length > 3;

  return (
    <div className="border-t border-gray-100 pt-4 mt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          {/* Like Button */}
          <button
            onClick={handleLike}
            className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors"
          >
            {isLiked ? (
              <FaHeart className="text-red-500" />
            ) : (
              <FaRegHeart />
            )}
            <span className="text-sm">{isLiked ? 'Liked' : 'Like'}</span>
          </button>

          {/* Comment Button */}
          <button
            onClick={() => setShowCommentBox(!showCommentBox)}
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors"
          >
            <FaComment />
            <span className="text-sm">Comment ({post.comments.length})</span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="flex items-center space-x-2 text-gray-600 hover:text-green-500 transition-colors"
          >
            <FaShare />
            <span className="text-sm">Share</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {post.comments.length > 0 && (
        <div className="mt-4 space-y-3">
          <div className="space-y-3">
            {visibleComments.map((comment) => (
              <div key={comment.id} className="text-sm bg-gray-50 p-3 rounded-md">
                <div className="flex items-center space-x-2 mb-2">
                  {comment.userImage && (
                    <img
                      src={comment.userImage}
                      alt={comment.userName}
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between text-gray-500 text-xs">
                      <span className="font-medium text-gray-700">{comment.userName}</span>
                      <span>{new Date(comment.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-700">{comment.text}</p>
              </div>
            ))}
          </div>
          
          {/* Show More/Less Button */}
          {hasMoreComments && (
            <button
              onClick={() => setShowAllComments(!showAllComments)}
              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900"
            >
              {showAllComments ? (
                <>
                  <FaChevronUp className="text-xs" />
                  <span>Show Less</span>
                </>
              ) : (
                <>
                  <FaChevronDown className="text-xs" />
                  <span>Show {post.comments.length - 3} More Comments</span>
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Comment Box */}
      {showCommentBox && (
        <div className="mt-4">
          <form onSubmit={handleComment} className="space-y-2">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={session ? "Write a comment..." : "Please log in to comment"}
              disabled={!session}
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              rows={3}
            />
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowCommentBox(false)}
                className="px-3 py-1 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!session || !comment.trim()}
                className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Post Comment
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
} 