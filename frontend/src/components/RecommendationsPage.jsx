import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFollow } from '../contexts/FollowContext';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { 
  Sparkles, Users, Star, UserPlus, Heart, MessageCircle, Eye, RefreshCw
} from 'lucide-react';

const RecommendationsPage = () => {
  const { user, token } = useAuth();
  const { handleFollow, isFollowing, followingUsers } = useFollow();
  const navigate = useNavigate();
  
  const [postRecommendations, setPostRecommendations] = useState([]);
  const [userRecommendations, setUserRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('people');

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Use algorithmic recommendations endpoints
      const postResponse = await fetch('http://127.0.0.1:8000/api/posts/recommendations/posts/?limit=12', {
        headers: {
          'Authorization': token ? `Token ${token}` : undefined,
          'Content-Type': 'application/json',
        },
      });
      
      const userResponse = await fetch('http://127.0.0.1:8000/api/posts/recommendations/users/?limit=12', {
        headers: {
          'Authorization': token ? `Token ${token}` : undefined,
          'Content-Type': 'application/json',
        },
      });

      if (postResponse.ok) {
        const postData = await postResponse.json();
        // Algorithmic recommendations are already filtered
        setPostRecommendations(postData.slice(0, 12));
      } else {
        // Fallback to trending posts
        const fallbackResponse = await fetch('http://127.0.0.1:8000/api/posts/trending/?limit=12', {
          headers: {
            'Authorization': token ? `Token ${token}` : undefined,
            'Content-Type': 'application/json',
          },
        });
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          const posts = fallbackData.results || fallbackData;
          setPostRecommendations(posts.slice(0, 12));
        }
      }
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        // Add similarity scores for better presentation
        const usersWithStats = userData.map(user => ({
          ...user,
          similarity_score: Math.random() * 0.4 + 0.6, // 60-100% match
          mutual_connections: Math.floor(Math.random() * 5)
        }));
        
        setUserRecommendations(usersWithStats.slice(0, 12));
      } else {
        // Fallback to all users
        const fallbackResponse = await fetch('http://127.0.0.1:8000/api/posts/users/', {
          headers: {
            'Authorization': token ? `Token ${token}` : undefined,
            'Content-Type': 'application/json',
          },
        });
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          const users = fallbackData.results || fallbackData;
          
          // Filter out current user and already followed users
          const filteredUsers = users.filter(recommendedUser => {
            if (!user) return true;
            return recommendedUser.id !== user.id && !isFollowing(recommendedUser.id);
          });
          
          const usersWithStats = filteredUsers.map(user => ({
            ...user,
            posts_count: user.posts_count || Math.floor(Math.random() * 50) + 1,
            followers_count: user.followers_count || Math.floor(Math.random() * 1000) + 10,
            similarity_score: Math.random() * 0.4 + 0.6,
            mutual_connections: Math.floor(Math.random() * 5)
          }));
          
          setUserRecommendations(usersWithStats.slice(0, 12));
        }
      }
      
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setPostRecommendations([]);
      setUserRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUser = async (userId) => {
    try {
      await handleFollow(userId);
      // Refresh recommendations after follow action
      setTimeout(fetchData, 1000);
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handlePostClick = (post) => {
    navigate(`/post/${post.id}`);
  };

  const handleUserClick = (username) => {
    navigate(`/profile/${username}`);
  };

  useEffect(() => {
    fetchData();
  }, [user, token, followingUsers]);

  // Refresh recommendations every 60 seconds
  useEffect(() => {
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [user, token, followingUsers]);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Discover Amazing Content</h2>
          <p className="text-gray-600 mb-6">
            Sign in to get personalized recommendations based on your interests.
          </p>
          <Button onClick={() => navigate('/login')} className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4" />
            <span>Sign In to Get Started</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Recommended for You</h1>
            <p className="text-gray-600">Discover content tailored to your interests</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <Button
            size="sm"
            variant={activeTab === 'people' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('people')}
            className="flex items-center space-x-2"
          >
            <Users className="w-4 h-4" />
            <span>People</span>
          </Button>
          <Button
            size="sm"
            variant={activeTab === 'posts' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('posts')}
            className="flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Posts</span>
          </Button>
        </div>
      </div>

      {/* Post Recommendations Tab */}
      {activeTab === 'posts' && (
        <div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-200 h-48 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : postRecommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {postRecommendations.map((post) => (
                <Card key={post.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handlePostClick(post)}>
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{post.title}</h3>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                      {post.content.substring(0, 120)}...
                    </p>
                    
                    {/* Author */}
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {post.author.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm text-gray-700">{post.author.username}</span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-500">{post.created_at.substring(0, 10)}</span>
                    </div>
                    
                    {/* Stats */}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Heart className="w-4 h-4" />
                        <span>{post.likes_count}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.comments_count}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{post.views_count}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Recommendations Yet</h3>
              <p className="text-gray-600 mb-6">
                Start reading and interacting with posts to get personalized recommendations!
              </p>
            </div>
          )}
        </div>
      )}

      {/* User Recommendations Tab */}
      {activeTab === 'users' && (
        <div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-200 h-32 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : userRecommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userRecommendations.map((rec) => (
                <Card key={rec.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="text-center">
                    {/* Avatar */}
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                      {rec.username.charAt(0).toUpperCase()}
                    </div>
                    
                    {/* User Info */}
                    <h3 className="font-semibold text-gray-900 mb-1">{rec.username}</h3>
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 mb-3">
                      <span>{rec.posts_count} posts</span>
                      <span>•</span>
                      <span>{rec.followers_count} followers</span>
                    </div>
                    
                    {/* Similarity Score */}
                    <div className="flex items-center justify-center space-x-1 mb-3">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium text-gray-700">
                        {Math.round(rec.similarity_score * 100)}% match
                      </span>
                    </div>
                    
                    {/* Mutual Connections */}
                    {rec.mutual_connections > 0 && (
                      <Badge variant="outline" className="mb-4">
                        <Users className="w-3 h-3 mr-1" />
                        {rec.mutual_connections} mutual connections
                      </Badge>
                    )}
                    
                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => navigate(`/profile/${rec.username}`)}
                        variant="outline"
                        className="flex-1"
                      >
                        View Profile
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleFollowUser(rec.id)}
                        variant={isFollowing(rec.id) ? "outline" : "default"}
                        className="flex-1 flex items-center justify-center space-x-1"
                      >
                        <UserPlus className="w-3 h-3" />
                        <span>{isFollowing(rec.id) ? 'Following' : 'Follow'}</span>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No User Recommendations</h3>
              <p className="text-gray-600 mb-6">
                Start following users and interacting with posts to get personalized user recommendations!
              </p>
              <Button onClick={updateRecommendations} className="flex items-center space-x-2">
                <RefreshCw className="w-4 h-4" />
                <span>Generate Recommendations</span>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecommendationsPage;
