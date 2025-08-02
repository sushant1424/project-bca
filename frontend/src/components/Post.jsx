import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, User } from 'lucide-react';

const Post = ({ post, onLike, onFollow, onComment, onRepost, onPostClick }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    try {
      await onComment(post.id, commentText);
      setCommentText('');
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle post click to open detail view
  const handlePostClick = (e) => {
    // Don't trigger post click if clicking on action buttons or forms
    if (e.target.closest('button') || e.target.closest('form')) {
      return;
    }
    if (onPostClick) {
      onPostClick(post.id);
    }
  };

  return (
    <article 
      className="bg-white border-b border-gray-200 p-8 hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={handlePostClick}
    >
      {/* Post Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {/* Author Avatar */}
          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
            {post.author.avatar ? (
              <img 
                src={post.author.avatar} 
                alt={post.author.username}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <User className="w-6 h-6 text-gray-600" />
            )}
          </div>
          
          {/* Author Info */}
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900 hover:underline cursor-pointer">
                {post.author.username}
              </h3>
              {!post.is_following_author && (
                <button
                  onClick={() => onFollow(post.author.id)}
                  className="text-sm bg-gray-900 text-white px-3 py-1 rounded-full hover:bg-gray-800 transition-colors"
                >
                  Follow
                </button>
              )}
            </div>
            <p className="text-sm text-gray-500">{formatDate(post.created_at)}</p>
          </div>
        </div>
        
        {/* More Options */}
        <button className="text-gray-400 hover:text-gray-600 p-1">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-2 hover:underline cursor-pointer">
          {post.title}
        </h2>
        
        {/* Post Excerpt */}
        <p className="text-gray-700 leading-relaxed mb-3">
          {post.excerpt || post.content.substring(0, 200)}
          {post.content.length > 200 && !post.excerpt && '...'}
        </p>
        
        {/* Featured Image */}
        {post.image && (
          <div className="mb-4">
            <img 
              src={post.image} 
              alt={post.title}
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
        )}
      </div>

      {/* Post Stats */}
      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <div className="flex items-center space-x-4">
          <span>{post.views} views</span>
          <span>{post.like_count} likes</span>
          <span>{post.comment_count} comments</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-4">
        <div className="flex items-center space-x-6">
          {/* Like Button */}
          <button
            onClick={() => onLike(post.id)}
            className={`flex items-center space-x-2 text-sm font-medium transition-colors ${
              post.is_liked 
                ? 'text-red-500 hover:text-red-600' 
                : 'text-gray-500 hover:text-red-500'
            }`}
          >
            <Heart className={`w-5 h-5 ${post.is_liked ? 'fill-current' : ''}`} />
            <span>Like</span>
          </button>

          {/* Comment Button */}
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 text-sm font-medium text-gray-500 hover:text-blue-500 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Comment</span>
          </button>

          {/* Repost Button */}
          <button
            onClick={() => onRepost(post.id)}
            className="flex items-center space-x-2 text-sm font-medium text-gray-500 hover:text-green-500 transition-colors"
          >
            <Share2 className="w-5 h-5" />
            <span>Repost</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 border-t border-gray-100 pt-4">
          {/* Comment Form */}
          <form onSubmit={handleCommentSubmit} className="mb-4">
            <div className="flex space-x-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex-1">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="2"
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || !commentText.trim()}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-4">
            {post.comments && post.comments.length > 0 ? (
              post.comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900">{comment.author.username}</span>
                        <span className="text-xs text-gray-500">{formatDate(comment.created_at)}</span>
                      </div>
                      <p className="text-gray-700 text-sm">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">No comments yet. Be the first to comment!</p>
            )}
          </div>
        </div>
      )}
    </article>
  );
};

export default Post; 