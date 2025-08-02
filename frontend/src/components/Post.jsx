import React, { useState } from 'react';
import { Heart, MessageCircle, Bookmark, MoreHorizontal, User } from 'lucide-react';

const Post = ({ post, onLike, onFollow, onComment, onSave, onPostClick }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [isLiking, setIsLiking] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [commentCount, setCommentCount] = useState(post.comment_count);
  const [isSaved, setIsSaved] = useState(post.is_saved || false);
  const [isSaving, setIsSaving] = useState(false);

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

  // Handle like button with immediate UI feedback
  const handleLike = async () => {
    if (isLiking) return; // Prevent double-clicking
    
    const wasLiked = isLiked;
    const previousCount = likeCount;
    
    // Optimistic UI update
    setIsLiked(!wasLiked);
    setLikeCount(wasLiked ? previousCount - 1 : previousCount + 1);
    setIsLiking(true);
    
    try {
      await onLike(post.id);
    } catch (error) {
      // Revert on error
      setIsLiked(wasLiked);
      setLikeCount(previousCount);
      console.error('Error liking post:', error);
    } finally {
      setIsLiking(false);
    }
  };

  // Handle save button with immediate UI feedback
  const handleSave = async () => {
    if (isSaving) return; // Prevent double-clicking
    
    const wasSaved = isSaved;
    
    // Optimistic UI update
    setIsSaved(!wasSaved);
    setIsSaving(true);
    
    try {
      await onSave(post.id);
    } catch (error) {
      // Revert on error
      setIsSaved(wasSaved);
      console.error('Error saving post:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle comment submission with immediate display
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const tempComment = {
      id: `temp-${Date.now()}`,
      content: commentText,
      author: {
        username: JSON.parse(localStorage.getItem('user') || '{}').username || 'You'
      },
      created_at: new Date().toISOString(),
      like_count: 0,
      is_liked: false,
      isTemporary: true
    };

    // Optimistic UI update
    setComments(prev => [...prev, tempComment]);
    setCommentCount(prev => prev + 1);
    setCommentText('');
    setIsSubmitting(true);

    try {
      const newComment = await onComment(post.id, commentText);
      // Replace temporary comment with real one
      setComments(prev => prev.map(comment => 
        comment.id === tempComment.id ? newComment : comment
      ));
    } catch (error) {
      // Remove temporary comment on error
      setComments(prev => prev.filter(comment => comment.id !== tempComment.id));
      setCommentCount(prev => prev - 1);
      setCommentText(commentText); // Restore comment text
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

  // Check if current user is the author of the post
  const isOwnPost = () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      return currentUser && currentUser.id && post.author && currentUser.id === post.author.id;
    } catch (error) {
      console.error('Error checking if own post:', error);
      return false;
    }
  };

  return (
    <article 
      className="bg-white p-4 sm:p-6 lg:p-8 hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={handlePostClick}
    >
      {/* Post Header */}
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
          {/* Author Avatar */}
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
            {post.author.avatar ? (
              <img 
                src={post.author.avatar} 
                alt={post.author.username}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
            )}
          </div>
          
          {/* Author Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1 sm:space-x-2 flex-wrap">
              <h3 className="font-semibold text-gray-900 hover:underline cursor-pointer text-sm sm:text-base truncate">
                {post.author.username}
              </h3>
              {/* Show follow button only if: not own post, not already following, and user is logged in */}
              {!isOwnPost() && !post.is_following_author && localStorage.getItem('user') && (
                <button
                  onClick={() => onFollow(post.author.id)}
                  className="text-xs sm:text-sm bg-gray-900 text-white px-2 py-1 sm:px-3 rounded-full hover:bg-gray-800 transition-colors flex-shrink-0"
                >
                  Follow
                </button>
              )}
              {/* Show following badge if already following */}
              {!isOwnPost() && post.is_following_author && (
                <span className="text-xs sm:text-sm bg-green-100 text-green-800 px-2 py-1 sm:px-3 rounded-full flex-shrink-0">
                  Following
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-gray-500">{formatDate(post.created_at)}</p>
          </div>
        </div>
        
        {/* More Options */}
        <button className="text-gray-400 hover:text-gray-600 p-1">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Post Content */}
      <div className="mb-3 sm:mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 hover:underline cursor-pointer line-clamp-2">
          {post.title}
        </h2>
        
        {/* Post Excerpt */}
        <p className="text-gray-700 leading-relaxed mb-3 text-sm sm:text-base">
          {post.excerpt || post.content.substring(0, 150)}
          {post.content.length > 150 && !post.excerpt && '...'}
        </p>
        
        {/* Featured Image */}
        {post.image && (
          <div className="mb-3 sm:mb-4">
            <img 
              src={post.image} 
              alt={post.title}
              className="w-full h-48 sm:h-64 object-cover rounded-lg"
            />
          </div>
        )}
      </div>

      {/* Post Stats */}
      <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
        <div className="flex items-center space-x-2 sm:space-x-4">

          <span className="truncate">{likeCount} likes</span>
          <span className="truncate">{commentCount} comments</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-3 sm:pt-4">
        <div className="flex items-center space-x-3 sm:space-x-6">
          {/* Like Button */}
          <button
            onClick={handleLike}
            disabled={isLiking}
            className={`flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm font-medium transition-all duration-200 ${
              isLiked 
                ? 'text-red-500 hover:text-red-600' 
                : 'text-gray-500 hover:text-red-500'
            } ${isLiking ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105'}`}
          >
            <Heart className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-200 ${
              isLiked ? 'fill-current text-red-500' : ''
            } ${isLiking ? 'animate-pulse' : ''}`} />
            <span className="hidden sm:inline">{isLiked ? 'Liked' : 'Like'}</span>
          </button>

          {/* Comment Button */}
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm font-medium text-gray-500 hover:text-blue-500 transition-colors"
          >
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Comment</span>
          </button>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm font-medium transition-all duration-200 ${
              isSaved 
                ? 'text-yellow-600 hover:text-yellow-700' 
                : 'text-gray-500 hover:text-blue-500'
            } ${isSaving ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105'}`}
          >
            <Bookmark className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-200 ${
              isSaved ? 'fill-current text-yellow-600' : ''
            } ${isSaving ? 'animate-pulse' : ''}`} />
            <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
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
          <div className="space-y-3">
            {comments && comments.length > 0 ? (
              comments.filter(comment => comment && comment.id).map((comment) => (
                <div key={comment.id} className={`flex space-x-3 ${comment?.isTemporary ? 'opacity-70' : ''}`}>
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900">{comment.author?.username || 'Anonymous'}</span>
                        <span className="text-xs text-gray-500">{formatDate(comment.created_at)}</span>
                        {comment?.isTemporary && (
                          <span className="text-xs text-blue-500 animate-pulse">Posting...</span>
                        )}
                      </div>
                      <p className="text-gray-700 text-sm">{comment.content || ''}</p>
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