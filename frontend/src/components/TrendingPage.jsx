import React, { useState, useEffect } from 'react';
import { TrendingUp, Clock, Eye, Heart, MessageCircle, User, Sparkles, BarChart3, Flame, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLike } from '../contexts/LikeContext';
import { useFollow } from '../contexts/FollowContext';
import API_CONFIG from '../config/api';

const TrendingPage = () => {
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showError, showSuccess } = useToast();
  const { getPostLike, handleLike: globalHandleLike } = useLike();
  const { isFollowing: globalIsFollowing, handleFollow: globalHandleFollow } = useFollow();

  // Handle back navigation
  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  useEffect(() => {
    fetchTrendingPosts();
    
    // Auto-refresh every 2 minutes for real-time updates
    const interval = setInterval(() => {
      fetchTrendingPosts();
    }, 2 * 60 * 1000); // 2 minutes
    
    return () => clearInterval(interval);
  }, []);

  const fetchTrendingPosts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Token ${token}`;
      }

      const response = await fetch(`http://127.0.0.1:8000${API_CONFIG.ENDPOINTS.TRENDING_POSTS}`, {
        headers: headers,
      });

      if (response.ok) {
        const data = await response.json();
        setTrendingPosts(data.results || []);
        setLastUpdated(new Date());
      } else {
        setError('Failed to fetch trending posts');
      }
    } catch (error) {
      console.error('Error fetching trending posts:', error);
      setError('Error loading trending posts');
    } finally {
      setLoading(false);
    }
  };

  const handlePostClick = (postId) => {
    navigate(`/post/${postId}`);
  };

  const handleLike = async (postId, currentIsLiked, currentLikeCount) => {
    if (!user) {
      showError('Please Login First!', 'You need to be logged in to like posts.');
      return;
    }

    try {
      await globalHandleLike(postId, currentIsLiked, currentLikeCount);
    } catch (error) {
      showError('Error', 'Failed to update like. Please try again.');
    }
  };

  const handleFollow = async (userId) => {
    if (!user) {
      showError('Please Login First!', 'You need to be logged in to follow users.');
      return;
    }

    try {
      await globalHandleFollow(userId);
    } catch (error) {
      showError('Error', 'Failed to update follow status. Please try again.');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <span className="ml-3 text-gray-600">Loading trending posts...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="text-red-600 text-lg">{error}</div>
            <button 
              onClick={fetchTrendingPosts}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          {/* Back Button */}
          <div className="mb-6">
            <button 
              onClick={handleBack}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors group p-2 rounded-full hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-orange-500 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">Trending Now</h1>
            </div>
          </div>
          <p className="text-gray-600">
            Discover what's popular and engaging on Wrytera right now
          </p>
        </div>

        {/* Trending Posts List */}
        {trendingPosts.length === 0 ? (
          <div className="text-center py-12">
            <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No trending posts yet</h3>
            <p className="text-gray-500">Check back soon for popular content</p>
          </div>
        ) : (
          <div className="space-y-4">
            {trendingPosts.map((post, index) => {
              const currentLike = getPostLike(post.id, post.is_liked, post.like_count);
              const isFollowing = globalIsFollowing(post.author?.id);
              const isOwnPost = user && user.id === post.author?.id;
              
              return (
                <Card key={post.id} className="hover:shadow-md transition-shadow duration-200 bg-white">
                  <CardContent className="p-4">
                    {/* Header with trending rank and author info */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {/* Trending Rank Badge */}
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                          #{index + 1}
                        </div>
                        
                        {/* Author Info */}
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={post.author?.avatar} alt={post.author?.username} />
                          <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                            {post.author?.username?.[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/profile/${post.author?.username}`);
                            }}
                            className="font-medium text-gray-900 hover:text-gray-700 transition-colors text-sm"
                            style={{fontFamily: 'medium-content-sans-serif-font, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif'}}
                          >
                            {post.author?.username || 'Unknown Author'}
                          </button>
                          
                          {/* Follow Button */}
                          {!isOwnPost && user && (
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFollow(post.author?.id);
                              }}
                              variant={isFollowing ? "outline" : "default"}
                              size="sm"
                              className="text-xs h-6 px-2"
                            >
                              {isFollowing ? 'Following' : 'Follow'}
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {/* Time and trending badge */}
                      <div className="flex items-center space-x-2">
                        <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-xs font-medium">
                          🔥 Trending
                        </span>
                        <div className="text-xs text-gray-500">
                          {formatTimeAgo(post.created_at)}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div 
                      className="cursor-pointer mb-4 flex items-start gap-6" 
                      onClick={() => handlePostClick(post.id)}
                    >
                      <div className="flex-1">
                        <h2 className="text-xl font-bold text-gray-900 mb-2 hover:text-gray-700 transition-colors leading-tight" 
                            style={{fontFamily: 'medium-content-sans-serif-font, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif'}}>
                          {post.title}
                        </h2>
                        {post.excerpt && (
                          <p className="text-gray-500 text-base line-clamp-2 leading-relaxed" 
                             style={{fontFamily: 'medium-content-sans-serif-font, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif'}}>
                            {post.excerpt}
                          </p>
                        )}
                      </div>
                      
                      {/* Image if exists */}
                      {post.image && (
                        <div className="flex-shrink-0">
                          <img 
                            src={post.image} 
                            alt={post.title}
                            className="w-24 h-24 object-cover rounded-lg hover:opacity-95 transition-opacity"
                          />
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLike(post.id, currentLike.is_liked, currentLike.like_count);
                          }}
                          className={`flex items-center space-x-1 text-sm transition-colors ${
                            currentLike.is_liked 
                              ? 'text-red-500' 
                              : 'text-gray-500 hover:text-red-500'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${currentLike.is_liked ? 'fill-current' : ''}`} />
                          <span>{currentLike.like_count}</span>
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePostClick(post.id);
                          }}
                          className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-500 transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>{post.comment_count}</span>
                        </button>
                        
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Eye className="w-4 h-4" />
                          <span>{post.views}</span>
                        </div>
                        
                        {post.category && (
                          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                            {post.category.name}
                          </span>
                        )}
                      </div>
                      
                      {/* Trending indicator */}
                      <div className="text-xs text-orange-600 font-medium flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Trending
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}


      </div>
    </div>
  );
};

export default TrendingPage;
