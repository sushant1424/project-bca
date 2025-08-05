import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Bookmark, MoreHorizontal, User, UserPlus, UserMinus } from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLike } from '../contexts/LikeContext';
import { useFollow } from '../contexts/FollowContext';

const Post = ({ post, onLike, onFollow, onComment, onSave, onPostClick }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showError, showSuccess } = useToast();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { getPostLike, handleLike: globalHandleLike } = useLike();
  const { isFollowing: globalIsFollowing, handleFollow: globalHandleFollow } = useFollow();
  const currentLike = getPostLike(post.id, post.is_liked, post.like_count);
  const [isLiked, setIsLiked] = useState(currentLike.is_liked);
  const [likeCount, setLikeCount] = useState(currentLike.like_count);
  const [isLiking, setIsLiking] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [commentCount, setCommentCount] = useState(post.comment_count);
  const [isSaved, setIsSaved] = useState(post.is_saved || false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  
  // Get follow status from global context
  const isFollowing = globalIsFollowing(post.author?.id);

  // Sync saved state when post data changes from parent
  useEffect(() => {
    setIsSaved(post.is_saved || false);
  }, [post.is_saved]);



  // Update local state when global state changes
  useEffect(() => {
    const currentLike = getPostLike(post.id, post.is_liked, post.like_count);
    setIsLiked(currentLike.is_liked);
    setLikeCount(currentLike.like_count);
  }, [getPostLike, post.id, post.is_liked, post.like_count]);

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

  // Handle like button with global state management
  const handleLike = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      showError('Please Login First!', 'You need to be logged in to like posts.');
      return;
    }

    try {
      await globalHandleLike(post.id, isLiked, likeCount);
      // Local state will be updated via useEffect when global state changes
    } catch (error) {
      showError('Error', 'Failed to update like. Please try again.');
    }
  };

  // Handle save button
  const handleSave = async () => {
    // Check if user is logged in
    if (!user) {
      showError('Please Login First!', 'You need to be logged in to save posts.');
      return;
    }
    
    const wasSaved = isSaved;
    
    // Optimistic UI update for immediate feedback
    setIsSaved(!wasSaved);
    
    try {
      if (onSave) {
        await onSave(post.id);
        // The PostList component will handle updating the posts array and showing toast messages
        // The useEffect will sync the isSaved state when post.is_saved changes from parent
      }
    } catch (error) {
      // Revert optimistic update on error
      setIsSaved(wasSaved);
      console.error('Error saving post:', error);
    }
  };

  // Handle follow button using global context
  const handleFollow = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if user is logged in
    if (!user) {
      showError('Please Login First!', 'You need to be logged in to follow users.');
      return;
    }
    
    if (isFollowLoading) return;
    setIsFollowLoading(true);
    
    try {
      const result = await globalHandleFollow(post.author.id);
      showSuccess('Success', result.message);
    } catch (error) {
      console.error('Error following user:', error);
      showError('Error', 'Failed to update follow status. Please try again.');
    } finally {
      setIsFollowLoading(false);
    }
  };



  // Handle comment submission with immediate display
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user is logged in
    if (!user) {
      showError('Please Login First!', 'You need to be logged in to comment on posts.');
      return;
    }
    
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

  // Handle user click to open user profile
  const handleUserClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/user/${post.author.id}`);
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
    <article className="mb-8 pb-6 border-b-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 last:border-b-0 bg-white rounded-lg p-1">
      <div className="p-4">
        {/* Header with user info and follow button */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={post.author?.avatar} alt={post.author?.username} />
              <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                {post.author?.username?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleUserClick}
                className="font-medium text-gray-900 hover:text-gray-700 transition-colors text-sm tracking-wide"
                style={{fontFamily: 'medium-content-sans-serif-font, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif'}}
              >
                {post.author?.username || 'Unknown Author'}
              </button>
              {!isOwnPost() && user && (
                <button
                  onClick={handleFollow}
                  disabled={isFollowLoading}
                  className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                    isFollowing
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  } ${isFollowLoading ? 'opacity-50' : ''}`}
                >
                  {isFollowing ? (
                    <>
                      <UserMinus className="w-3 h-3" />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3 h-3" />
                      <span>Follow</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
          <div className="text-xs text-gray-500" style={{fontFamily: 'medium-content-sans-serif-font, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif'}}>
            {formatDate(post.created_at)}
          </div>
        </div>

        {/* Content with Medium-style layout */}
        <div className="cursor-pointer mb-6 flex items-start gap-6" onClick={() => onPostClick && onPostClick(post.id)}>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 hover:text-gray-700 transition-colors leading-tight" style={{fontFamily: 'medium-content-sans-serif-font, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif'}}>
              {post.title}
            </h2>
            <p className="text-gray-500 text-base line-clamp-2 leading-relaxed mb-4" style={{fontFamily: 'medium-content-sans-serif-font, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif'}}>
              {post.content?.length > 180 ? `${post.content.substring(0, 180)}...` : post.content}
            </p>
          </div>
          
          {/* Medium-sized image on right side (only if image exists) */}
          {post.image && (
            <div className="flex-shrink-0">
              <img 
                src={post.image} 
                alt={post.title}
                className="w-32 h-32 object-cover rounded-lg hover:opacity-95 transition-opacity"
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center space-x-1 text-sm transition-colors ${
                isLiked 
                  ? 'text-red-500' 
                  : 'text-gray-500 hover:text-red-500'
              } ${isLiking ? 'opacity-50' : ''}`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likeCount}</span>
            </button>
            
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-500 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{commentCount}</span>
            </button>
          </div>
          
          {user && (
            <button 
              onClick={handleSave}
              className={`transition-colors ${
                isSaved 
                  ? 'text-yellow-500 hover:text-yellow-600' 
                  : 'text-gray-400 hover:text-yellow-500'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          )}
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