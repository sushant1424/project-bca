import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Clock, User, Sparkles, TrendingUp } from 'lucide-react';

const FollowingFeed = ({ user }) => {
  const navigate = useNavigate();
  const [followingPosts, setFollowingPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchFollowingPosts();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchFollowingPosts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://127.0.0.1:8000/api/posts/following-feed/', {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFollowingPosts(data.slice(0, 5)); // Show only latest 5 posts
      } else {
        setError('Failed to load following posts');
      }
    } catch (error) {
      console.error('Error fetching following posts:', error);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInHours = Math.floor((now - postDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return `${Math.floor(diffInDays / 7)}w ago`;
  };

  const truncateText = (text, maxLength = 60) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const handlePostClick = (postId) => {
    navigate(`/post/${postId}`);
  };

  if (!user) {
    return (
      <div className="space-y-3">
        <div className="flex items-center space-x-2 px-3 py-2">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Discover
          </h3>
        </div>
        <div className="px-3 py-4 text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mx-auto mb-3 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-purple-500" />
          </div>
          <p className="text-sm text-gray-600 mb-2">Sign in to see posts from people you follow</p>
          <p className="text-xs text-gray-500">Discover amazing content from creators</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center space-x-2 px-3 py-2">
          <Heart className="w-4 h-4 text-red-500" />
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Following Feed
          </h3>
        </div>
        <div className="px-3 py-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse mb-3">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3">
        <div className="flex items-center space-x-2 px-3 py-2">
          <Heart className="w-4 h-4 text-red-500" />
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Following Feed
          </h3>
        </div>
        <div className="px-3 py-2 text-center">
          <p className="text-sm text-red-500">{error}</p>
          <button 
            onClick={fetchFollowingPosts}
            className="text-xs text-purple-600 hover:text-purple-700 mt-1"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (followingPosts.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center space-x-2 px-3 py-2">
          <Heart className="w-4 h-4 text-red-500" />
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Following Feed
          </h3>
        </div>
        <div className="px-3 py-4 text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-pink-100 rounded-full mx-auto mb-3 flex items-center justify-center">
            <Heart className="w-6 h-6 text-red-500" />
          </div>
          <p className="text-sm text-gray-600 mb-2">No posts from people you follow yet</p>
          <p className="text-xs text-gray-500">Follow some creators to see their latest posts here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center space-x-2">
          <Heart className="w-4 h-4 text-red-500" />
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Following Feed
          </h3>
        </div>
        <span className="text-xs text-gray-400">{followingPosts.length}</span>
      </div>

      {/* Posts Feed */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {followingPosts.map((post) => (
          <div
            key={post.id}
            onClick={() => handlePostClick(post.id)}
            className="px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors duration-200 group"
          >
            {/* Author Info */}
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-6 h-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                {post.author.profile_image ? (
                  <img 
                    src={post.author.profile_image} 
                    alt={post.author.username} 
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-purple-600 text-xs font-medium">
                    {post.author.username.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1">
                  <span className="text-xs font-medium text-gray-700 truncate">
                    {post.author.username}
                  </span>
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    {formatTimeAgo(post.created_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Post Content */}
            <div className="mb-2">
              <h4 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2 group-hover:text-purple-600 transition-colors">
                {truncateText(post.title, 50)}
              </h4>
              {post.excerpt && (
                <p className="text-xs text-gray-600 line-clamp-2">
                  {truncateText(post.excerpt, 80)}
                </p>
              )}
            </div>

            {/* Post Stats */}
            <div className="flex items-center space-x-3 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Heart className="w-3 h-3" />
                <span>{post.like_count || 0}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageCircle className="w-3 h-3" />
                <span>{post.comment_count || 0}</span>
              </div>
              {post.category && (
                <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">
                  {post.category.name}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* View All Link */}
      {followingPosts.length > 0 && (
        <div className="px-3 py-2 border-t border-gray-100">
          <button
            onClick={() => navigate('/following')}
            className="text-xs text-purple-600 hover:text-purple-700 font-medium w-full text-left"
          >
            View all posts from following →
          </button>
        </div>
      )}
    </div>
  );
};

export default FollowingFeed;
