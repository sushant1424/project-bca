import React, { useState, useEffect } from 'react';
import { ArrowLeft, Heart, MessageCircle, Share2, User, Calendar, Eye, MoreHorizontal } from 'lucide-react';

const PostDetail = ({ postId, isOpen, onClose }) => {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Fetch post details
  useEffect(() => {
    if (postId && isOpen) {
      fetchPostDetails();
    }
  }, [postId, isOpen]);

  const fetchPostDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
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
      alert('Please sign in to like posts');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:8000/api/posts/${postId}/like/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
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

  const handleFollow = async () => {
    if (!user) {
      alert('Please sign in to follow users');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:8000/api/posts/users/${post.author.id}/follow/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Update the post's follow status
        setPost(prev => ({
          ...prev,
          is_following_author: !prev.is_following_author
        }));
      }
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please sign in to comment');
      return;
    }

    if (!newComment.trim()) return;

    try {
      setSubmittingComment(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:8000/api/posts/${postId}/comments/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newComment }),
      });

      if (response.ok) {
        const newCommentData = await response.json();
        setPost(prev => ({
          ...prev,
          comments: [...(prev.comments || []), newCommentData],
          comment_count: prev.comment_count + 1
        }));
        setNewComment('');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleRepost = async () => {
    if (!user) {
      alert('Please sign in to repost');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:8000/api/posts/${postId}/repost/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment: '' }),
      });

      if (response.ok) {
        alert('Post reposted successfully!');
      }
    } catch (error) {
      console.error('Error reposting:', error);
    }
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white z-50 overflow-auto">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-gray-600">Loading post...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-white z-50 overflow-auto">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                post.is_liked 
                  ? 'bg-red-100 text-red-600' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <Heart className={`w-4 h-4 ${post.is_liked ? 'fill-current' : ''}`} />
              <span>{post.like_count}</span>
            </button>
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{post.comment_count}</span>
            </button>
            <button
              onClick={handleRepost}
              className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
            >
              <Share2 className="w-4 h-4" />
              <span>Repost</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Post Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
          
          {post.excerpt && (
            <p className="text-xl text-gray-600 mb-6 italic">{post.excerpt}</p>
          )}

          {/* Author Info */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{post.author.username}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                  <span className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    {post.views} views
                  </span>
                </div>
              </div>
            </div>
            
            {user && user.id !== post.author.id && (
              <button
                onClick={handleFollow}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  post.is_following_author
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {post.is_following_author ? 'Following' : 'Follow'}
              </button>
            )}
          </div>

          {/* Category */}
          {post.category && (
            <div className="mb-6">
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                {post.category.name}
              </span>
            </div>
          )}
        </div>

        {/* Featured Image */}
        {post.image && (
          <div className="mb-8">
            <img 
              src={post.image} 
              alt="Featured" 
              className="w-full h-96 object-cover rounded-lg"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Post Content */}
        <div className="prose prose-lg max-w-none mb-12">
          <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
            {post.content}
          </div>
        </div>

        {/* Comments Section */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Comments ({post.comment_count})
            </h3>
            <button
              onClick={() => setShowComments(!showComments)}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              {showComments ? 'Hide' : 'Show'} Comments
            </button>
          </div>

          {showComments && (
            <div className="space-y-6">
              {/* Comment Form */}
              {user && (
                <form onSubmit={handleComment} className="bg-gray-50 p-4 rounded-lg">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                  <div className="flex justify-end mt-3">
                    <button
                      type="submit"
                      disabled={submittingComment || !newComment.trim()}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                      {submittingComment ? 'Posting...' : 'Post Comment'}
                    </button>
                  </div>
                </form>
              )}

              {/* Comments List */}
              <div className="space-y-4">
                {post.comments && post.comments.length > 0 ? (
                  post.comments.map((comment) => (
                    <div key={comment.id} className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-medium text-gray-900">{comment.author.username}</span>
                            <span className="text-sm text-gray-500">
                              {new Date(comment.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-800">{comment.content}</p>
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
    </div>
  );
};

export default PostDetail; 