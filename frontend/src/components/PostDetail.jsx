import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, Share2, User, Calendar, Bookmark, X } from 'lucide-react';
import { authenticatedFetch, buildApiUrl } from '../config/api';
import API_CONFIG from '../config/api';
import { ToastContainer } from './ToastNotification';
import useToast from '../hooks/useToast';

const PostDetail = () => {
  const { id: postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const { toasts, showWarning, showSuccess, showError, removeToast } = useToast();

  // Check if user is logged in
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Fetch post details
  useEffect(() => {
    if (postId) {
      fetchPostDetails();
    }
  }, [postId]);

  const fetchPostDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Token ${token}`;
      }

      const response = await fetch(`http://127.0.0.1:8000/api/posts/${postId}/`, {
        headers: headers,
      });

      if (response.ok) {
        const data = await response.json();
        setPost(data);
      } else {
        setError('Failed to load post');
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      setError('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      showAlert({
        type: 'warning',
        title: 'Sign In Required',
        message: 'Please sign in to like posts'
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:8000/api/posts/${postId}/like/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Update the post's like status
        setPost(prev => ({
          ...prev,
          is_liked: !prev.is_liked,
          like_count: prev.is_liked ? prev.like_count - 1 : prev.like_count + 1
        }));
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  // Check if this is the current user's own post
  const isOwnPost = () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      return currentUser && currentUser.id && post.author && currentUser.id === post.author.id;
    } catch (error) {
      console.error('Error checking if own post:', error);
      return false;
    }
  };

  // Format post content with rich typography
  const formatPostContent = (content) => {
    if (!content) return '';
    
    let formatted = content
      // Convert double line breaks to paragraphs
      .replace(/\n\n/g, '</p><p class="mb-6">')
      // Convert single line breaks to <br>
      .replace(/\n/g, '<br>')
      // Bold text: **text** or __text__
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>')
      .replace(/__(.*?)__/g, '<strong class="font-bold text-gray-900">$1</strong>')
      // Italic text: *text* or _text_
      .replace(/\*(.*?)\*/g, '<em class="italic text-gray-700">$1</em>')
      .replace(/_(.*?)_/g, '<em class="italic text-gray-700">$1</em>')
      // Headers: # Header
      .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold text-gray-900 mt-8 mb-4">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold text-gray-900 mt-10 mb-6">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold text-gray-900 mt-12 mb-8">$1</h1>')
      // Quotes: > text
      .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-blue-500 pl-6 py-2 my-6 bg-blue-50 text-gray-700 italic">$1</blockquote>')
      // Lists: - item or * item
      .replace(/^[\-\*] (.*$)/gm, '<li class="mb-2 text-gray-800">$1</li>')
      // Code blocks: ```code```
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 rounded-lg p-4 my-6 overflow-x-auto"><code class="text-sm text-gray-800">$1</code></pre>')
      // Inline code: `code`
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono">$1</code>')
      // Links: [text](url)
      .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-700 underline" target="_blank" rel="noopener noreferrer">$1</a>')
      // Horizontal rule: ---
      .replace(/^---$/gm, '<hr class="border-t-2 border-gray-200 my-8">')
      // Numbers for lists: 1. item
      .replace(/^\d+\. (.*$)/gm, '<li class="mb-2 text-gray-800 list-decimal">$1</li>');
    
    // Wrap in paragraph tags if not already wrapped
    if (!formatted.startsWith('<')) {
      formatted = '<p class="mb-6">' + formatted + '</p>';
    } else {
      formatted = '<p class="mb-6">' + formatted;
    }
    
    // Wrap list items in ul/ol tags
    formatted = formatted.replace(/(<li class="mb-2 text-gray-800">.*?<\/li>)/gs, '<ul class="list-disc pl-6 my-6 space-y-2">$1</ul>');
    formatted = formatted.replace(/(<li class="mb-2 text-gray-800 list-decimal">.*?<\/li>)/gs, '<ol class="list-decimal pl-6 my-6 space-y-2">$1</ol>');
    
    return formatted;
  };

  const handleFollow = async () => {
    if (!user) {
      showWarning('Sign In Required', 'Please sign in to follow users');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const wasFollowing = post.is_following_author;
      
      const response = await fetch(`http://127.0.0.1:8000/api/posts/users/${post.author.id}/follow/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Update the post's follow status
        setPost(prev => ({
          ...prev,
          is_following_author: data.is_following
        }));
        
        // Show appropriate toast message
        if (data.is_following) {
          showSuccess('Success', `You are now following ${post.author.username}!`);
        } else {
          showSuccess('Success', `You unfollowed ${post.author.username}`);
        }
      } else {
        showError('Error', 'Failed to update follow status');
      }
    } catch (error) {
      console.error('Error following user:', error);
      showError('Network Error', 'Unable to follow user. Please try again.');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) {
      showWarning('Sign In Required', 'Please sign in to comment');
      return;
    }

    if (!newComment.trim()) return;

    try {
      setSubmittingComment(true);
      const token = localStorage.getItem('token');
      
      console.log('Submitting comment:', { postId, content: newComment, token: token ? 'present' : 'missing' });
      
      const response = await fetch(`http://127.0.0.1:8000/api/posts/${postId}/comments/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newComment.trim() }),
      });

      console.log('Comment response status:', response.status);
      
      if (response.ok) {
        const newCommentData = await response.json();
        console.log('New comment data:', newCommentData);
        
        // Ensure we have the required fields
        const commentToAdd = {
          id: newCommentData.id || Date.now(),
          content: newCommentData.content || newComment.trim(),
          author: newCommentData.author || user,
          created_at: newCommentData.created_at || new Date().toISOString(),
          ...newCommentData
        };
        
        setPost(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            comments: [...(prev.comments || []), commentToAdd],
            comment_count: (prev.comment_count || 0) + 1
          };
        });
        
        setNewComment('');
        showSuccess('Success', 'Comment posted successfully!');
      } else {
        let errorMessage = 'Failed to post comment. Please try again.';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.detail || errorMessage;
        } catch (e) {
          console.error('Failed to parse error response:', e);
        }
        
        console.error('Comment submission failed:', response.status, errorMessage);
        showError('Error', errorMessage);
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      showError('Network Error', `Unable to post comment: ${error.message}. Please check your connection and try again.`);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      showWarning('Sign In Required', 'Please sign in to save posts');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:8000/api/posts/${postId}/save/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPost(prev => ({ ...prev, is_saved: data.is_saved }));
        showSuccess('Success', data.is_saved ? 'Post saved to library!' : 'Post removed from library!');
      }
    } catch (error) {
      console.error('Error saving post:', error);
      showError('Error', 'Failed to save post');
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt || post.title,
          url: url,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(url);
        showSuccess('Success', 'Link copied to clipboard!');
      } catch (error) {
        showError('Error', 'Failed to copy link');
      }
    }
  };



// Handle back navigation
const handleBack = () => {
  navigate('/');
};

if (loading) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      <span className="ml-3 text-gray-600">Loading post...</span>
    </div>
  );
}

if (error) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={handleBack}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}

if (!post) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600 mb-4">Post not found</p>
        <button 
          onClick={handleBack}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}

  return (
    <div className="min-h-screen bg-white">
      {/* Close Button - Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <button 
          onClick={handleBack}
          className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Main Content Container */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Category Tag */}
        {post.category && (
          <div className="mb-6">
            <span 
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium uppercase tracking-wide"
              style={{ 
                backgroundColor: `${post.category.color}20`, 
                color: post.category.color 
              }}
            >
              {post.category.name}
            </span>
          </div>
        )}

        {/* Post Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
          {post.title}
        </h1>

        {/* Author Info & Meta */}
        <div className="flex items-center mb-8">
          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
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
          <div>
            <div className="flex items-center space-x-2 text-base">
              <span className="font-semibold text-gray-900">{post.author.username}</span>
              {!isOwnPost() && user && (
                <>
                  <span className="text-gray-400">•</span>
                  <button
                    onClick={handleFollow}
                    className={`font-medium transition-colors ${
                      post.is_following_author 
                        ? 'text-green-600 hover:text-green-700' 
                        : 'text-blue-600 hover:text-blue-700'
                    }`}
                  >
                    {post.is_following_author ? 'Following' : 'Follow'}
                  </button>
                </>
              )}
            </div>
            <div className="text-gray-500 text-sm mt-1">
              {new Date(post.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        </div>

        {/* Post Content */}
        <div className="prose prose-lg prose-gray max-w-none mb-12">
          <div 
            className="text-gray-800 leading-relaxed text-lg space-y-6"
            dangerouslySetInnerHTML={{ 
              __html: formatPostContent(post.content)
            }}
          />
        </div>

        {/* Action Bar - Bottom */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between">
            {/* Left side - Like count and reactions */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-1">
                  {/* Sample avatars for likes */}
                  <div className="w-6 h-6 bg-gray-300 rounded-full border-2 border-white"></div>
                  <div className="w-6 h-6 bg-blue-300 rounded-full border-2 border-white"></div>
                  <div className="w-6 h-6 bg-green-300 rounded-full border-2 border-white"></div>
                </div>
                <span className="text-sm text-gray-600">{post.like_count} Likes • {post.comment_count} Comments</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
            {/* Like Button */}
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                post.is_liked 
                  ? 'text-red-600 hover:text-red-700' 
                  : 'text-gray-600 hover:text-red-600'
              }`}
            >
              <Heart className={`w-5 h-5 ${post.is_liked ? 'fill-current' : ''}`} />
              <span className="font-medium">{post.like_count}</span>
            </button>
            {/* Comment Button */}
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors text-gray-600 hover:text-blue-600"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="font-medium">{post.comment_count}</span>
            </button>

            {/* Save Button */}
            <button
              onClick={handleSave}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                post.is_saved 
                  ? 'text-yellow-600 hover:text-yellow-700' 
                  : 'text-gray-600 hover:text-yellow-600'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${post.is_saved ? 'fill-current' : ''}`} />
              <span className="font-medium">{post.is_saved ? 'Saved' : 'Save'}</span>
            </button>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors text-gray-600 hover:text-green-600"
            >
              <Share2 className="w-5 h-5" />
              <span className="font-medium">Share</span>
            </button>
          </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-12 border-t border-gray-200 pt-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Comments ({post.comment_count})
            </h3>

            {/* Comment Form */}
            {user && (
              <form onSubmit={handleComment} className="mb-8">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-base"
                />
                <div className="flex justify-end mt-3">
                  <button
                    type="submit"
                    disabled={submittingComment || !newComment.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
                  >
                    {submittingComment ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </form>
            )}

            {/* Comments List */}
            <div className="space-y-6">
              {post.comments && post.comments.length > 0 ? (
                post.comments.map((comment) => (
                  <div key={comment.id} className="border-b border-gray-100 pb-6">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-semibold text-gray-900">{comment.author.username}</span>
                          <span className="text-sm text-gray-500">
                            {new Date(comment.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <p className="text-gray-800 leading-relaxed">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">No comments yet. Be the first to comment!</p>
              )}
            </div>
          </div>
        )}
      </div>

      </div>
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
};

export default PostDetail;