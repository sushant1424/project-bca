import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ArrowLeft, Users, Sparkles } from 'lucide-react';
import Post from './Post';
import { ToastContainer } from './ToastNotification';
import useToast from '../hooks/useToast';

const FollowingPage = () => {
  const navigate = useNavigate();
  const { toasts, showWarning, showSuccess, showError, removeToast } = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (userData && token) {
      setUser(JSON.parse(userData));
      fetchFollowingPosts();
    } else {
      showError('Access Denied', 'Please sign in to view your following feed');
      setTimeout(() => navigate('/'), 2000);
    }
  }, []);

  const fetchFollowingPosts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://127.0.0.1:8000/api/posts/following-feed/', {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      } else {
        setError('Failed to load following posts');
      }
    } catch (error) {
      console.error('Error fetching following posts:', error);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Post interaction handlers (similar to PostList)
  const handleLike = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showWarning('Sign In Required', 'Please sign in to like posts');
        return;
      }

      const response = await fetch(`http://127.0.0.1:8000/api/posts/${postId}/like/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(posts.map(post => 
          post.id === postId 
            ? { ...post, is_liked: data.liked, like_count: data.like_count }
            : post
        ));
        showSuccess('Success', data.liked ? 'Post liked!' : 'Post unliked!');
      }
    } catch (error) {
      showError('Error', 'Failed to update like status');
    }
  };

  const handleFollow = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showWarning('Sign In Required', 'Please sign in to follow users');
        return;
      }

      const response = await fetch(`http://127.0.0.1:8000/api/posts/users/${userId}/follow/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(posts.map(post => 
          post.author.id === userId 
            ? { ...post, author: { ...post.author, is_following: data.following } }
            : post
        ));
        showSuccess('Success', data.following ? 'User followed!' : 'User unfollowed!');
      }
    } catch (error) {
      showError('Error', 'Failed to update follow status');
    }
  };

  const handleComment = async (postId, commentData) => {
    // Comment handling logic similar to PostList
    showSuccess('Success', 'Comment posted successfully!');
  };

  const handleSave = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showWarning('Sign In Required', 'Please sign in to save posts');
        return;
      }

      const response = await fetch(`http://127.0.0.1:8000/api/posts/library/save/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ post_id: postId }),
      });

      if (response.ok) {
        showSuccess('Success', 'Post saved to your library!');
      }
    } catch (error) {
      showError('Error', 'Failed to save post');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center space-x-4 mb-8">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center space-x-2">
              <Heart className="w-6 h-6 text-red-500" />
              <h1 className="text-2xl font-bold text-gray-900">Following Feed</h1>
            </div>
          </div>
          
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center space-x-4 mb-8">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center space-x-2">
              <Heart className="w-6 h-6 text-red-500" />
              <h1 className="text-2xl font-bold text-gray-900">Following Feed</h1>
            </div>
          </div>
          
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Heart className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Feed</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchFollowingPosts}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
        <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center space-x-4 mb-8">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center space-x-2">
              <Heart className="w-6 h-6 text-red-500" />
              <h1 className="text-2xl font-bold text-gray-900">Following Feed</h1>
            </div>
          </div>
          
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-pink-100 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Users className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">No Posts Yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              You haven't followed anyone yet, or the people you follow haven't posted recently.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/')}
                className="block mx-auto px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Discover New Creators
              </button>
              <p className="text-sm text-gray-500">
                Browse the home feed to find interesting people to follow
              </p>
            </div>
          </div>
        </div>
        <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center space-x-2">
              <Heart className="w-6 h-6 text-red-500" />
              <h1 className="text-2xl font-bold text-gray-900">Following Feed</h1>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Sparkles className="w-4 h-4" />
            <span>{posts.length} posts from people you follow</span>
          </div>
        </div>

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <Post
                post={post}
                onLike={handleLike}
                onFollow={handleFollow}
                onComment={handleComment}
                onSave={handleSave}
                onPostClick={(postId) => navigate(`/post/${postId}`)}
              />
            </div>
          ))}
        </div>

        {/* Load More Button (for future pagination) */}
        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            You've seen all recent posts from people you follow
          </p>
        </div>
      </div>
      
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
};

export default FollowingPage;
