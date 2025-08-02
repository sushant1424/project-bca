import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, FileText, Plus, Search, Filter, Eye, Edit, Trash2, Users, TrendingUp, Calendar, BarChart3, Heart, MessageCircle, Settings } from 'lucide-react';
import { authenticatedFetch, buildApiUrl } from '../config/api';
import API_CONFIG from '../config/api';
import DeleteConfirmModal from './DeleteConfirmModal';
import ProfileSettings from './ProfileSettings';
import { ToastContainer } from './ToastNotification';
import useToast from '../hooks/useToast';

const Dashboard = () => {
  const navigate = useNavigate();
  const { toasts, showWarning, showSuccess, showError, removeToast } = useToast();
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('dashboardActiveTab') || 'home';
  });
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    followers: 0,
    posts: 0,
    drafts: 0
  });
  const [posts, setPosts] = useState([]);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [filter, setFilter] = useState(() => {
    return localStorage.getItem('dashboardFilter') || 'all';
  });
  const [searchTerm, setSearchTerm] = useState(() => {
    return localStorage.getItem('dashboardSearchTerm') || '';
  });
  const [editingPost, setEditingPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trendingLoading, setTrendingLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, postId: null, postTitle: '' });

  // Filter and search posts
  const filteredPosts = posts.filter(post => {
    const matchesSearch = searchTerm === '' || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || 
      (filter === 'published' && post.is_published) ||
      (filter === 'drafts' && !post.is_published);
    
    return matchesSearch && matchesFilter;
  });

  // Persist dashboard state
  useEffect(() => {
    localStorage.setItem('dashboardActiveTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('dashboardFilter', filter);
  }, [filter]);

  useEffect(() => {
    localStorage.setItem('dashboardSearchTerm', searchTerm);
  }, [searchTerm]);

  // Fetch trending posts
  const fetchTrendingPosts = async () => {
    try {
      setTrendingLoading(true);
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.TRENDING_POSTS));
      
      if (response.ok) {
        const data = await response.json();
        setTrendingPosts(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching trending posts:', error);
    } finally {
      setTrendingLoading(false);
    }
  };

  // Check if user is logged in
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      fetchUserStats();
      fetchUserPosts();
    }
    // Fetch trending posts for all users
    fetchTrendingPosts();
  }, []);

  // Fetch user statistics
  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token available for stats');
        return;
      }
      
      const response = await authenticatedFetch(API_CONFIG.ENDPOINTS.USER_STATS);
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else if (response.status === 401) {
        console.log('Token expired or invalid, user needs to re-login');
        // Clear invalid token
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  // Fetch user posts
  const fetchUserPosts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token available for user posts');
        setPosts([]);
        return;
      }
      
      const response = await authenticatedFetch(API_CONFIG.ENDPOINTS.USER_POSTS);
      
      if (response.ok) {
        const data = await response.json();
        setPosts(Array.isArray(data) ? data : []);
      } else if (response.status === 401) {
        console.log('Token expired or invalid for user posts');
        // Clear invalid token
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setPosts([]);
      }
    } catch (error) {
      console.error('Error fetching user posts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle post creation
  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
    setStats(prev => ({ ...prev, posts: prev.posts + 1 }));
  };

  // Handle edit post
  const handleEditPost = (post) => {
    // Store the post data for editing and navigate to WritePage
    localStorage.setItem('editingPost', JSON.stringify(post));
    showSuccess('Edit Mode', 'Post loaded for editing');
    navigate('/write');
  };

  // Handle view post
  const handleViewPost = (postId) => {
    // Open post in a new window/tab or navigate to post detail
    window.open(`/post/${postId}`, '_blank');
  };

  // Handle post updated
  const handlePostUpdated = (updatedPost) => {
    setPosts(prev => prev.map(post => 
      post.id === updatedPost.id ? updatedPost : post
    ));
    setEditingPost(null);
  };

  // Handle delete post confirmation
  const handleDeletePost = (post) => {
    setDeleteModal({
      isOpen: true,
      postId: post.id,
      postTitle: post.title
    });
  };

  // Confirm and execute post deletion
  const confirmDeletePost = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await authenticatedFetch(API_CONFIG.ENDPOINTS.POST_DETAIL(deleteModal.postId), {
        method: 'DELETE'
      });
      
      if (response.ok) {
        fetchUserPosts();
        fetchUserStats();
        showSuccess('Success', 'Post deleted successfully!');
      } else {
        showError('Error', 'Failed to delete post. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      showError('Network Error', 'Unable to delete post. Please check your connection.');
    }
  };

  // If user is not logged in, show login message
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-4 sm:p-6 lg:p-8 max-w-md w-full mx-2 sm:mx-4">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Login Required</h3>
            <p className="text-gray-600 mb-6">You need to be logged in to access the dashboard.</p>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <span className="text-gray-500">Welcome back, {user.username}!</span>
          </div>
          <button
            onClick={() => window.history.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="text-2xl">&times;</span>
          </button>
        </div>
      </div>

      <div className="flex h-full">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white border-r border-gray-200">
          <nav className="p-4 space-y-2">
            <button
              onClick={() => setActiveTab('home')}
              className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'home' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Home className="w-5 h-5 mr-3" />
              Home
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'posts' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FileText className="w-5 h-5 mr-3" />
              My Posts
            </button>
            <button
              onClick={() => setActiveTab('trending')}
              className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'trending' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <TrendingUp className="w-5 h-5 mr-3" />
              Trending
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'analytics' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="w-5 h-5 mr-3" />
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('engagement')}
              className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'engagement' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Heart className="w-5 h-5 mr-3" />
              Engagement
            </button>
            <button
              onClick={() => setActiveTab('profile-settings')}
              className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'profile-settings' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Settings className="w-5 h-5 mr-3" />
              Profile Settings
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {activeTab === 'home' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Dashboard Overview</h2>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <Users className="w-8 h-8 text-blue-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Followers</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.followers}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <FileText className="w-8 h-8 text-green-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Posts</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.posts}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <Edit className="w-8 h-8 text-yellow-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Drafts</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.drafts}</p>
                    </div>
                  </div>
                </div>
                

              </div>

              {/* Recent Posts */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Posts</h3>
                </div>
                <div className="p-6">
                  {posts.slice(0, 5).map((post) => (
                    <div key={post.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{post.title}</h4>
                        <p className="text-sm text-gray-500">
                          {post.is_published ? 'Published' : 'Draft'} • {new Date(post.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => navigate(`/post/${post.id}`)}
                          className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'posts' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Posts</h2>
                <button
                  onClick={() => navigate('/write')}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Post
                </button>
              </div>

              {/* Filters and Search */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
                  {/* Search */}
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search posts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Filter */}
                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="all">All Posts</option>
                      <option value="published">Published</option>
                      <option value="draft">Drafts</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Posts List */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {loading ? (
                  <div className="p-6 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-2 text-gray-500">Loading posts...</p>
                  </div>
                ) : filteredPosts.length === 0 ? (
                  <div className="p-6 text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm || filter !== 'all' 
                        ? 'Try adjusting your search or filters' 
                        : 'Create your first post to get started'
                      }
                    </p>
                    {!searchTerm && filter === 'all' && (
                      <button
                        onClick={() => setShowWritePage(true)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Create Post
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredPosts.map((post) => (
                      <div key={post.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-medium text-gray-900">{post.title}</h3>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                post.is_published 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {post.is_published ? 'Published' : 'Draft'}
                              </span>
                            </div>
                            <p className="text-gray-600 mb-2 line-clamp-2">{post.excerpt || post.content.substring(0, 150)}...</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>{new Date(post.created_at).toLocaleDateString()}</span>
                              <span>{post.views} views</span>
                              <span>{post.like_count} likes</span>
                              <span>{post.comment_count} comments</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <button 
                              onClick={() => handleViewPost(post.id)}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              title="View post"
                            >
                              <Eye className="w-4 h-4 text-gray-500" />
                            </button>
                            <button 
                              onClick={() => handleEditPost(post)}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Edit post"
                            >
                              <Edit className="w-4 h-4 text-gray-500" />
                            </button>
                            <button 
                              onClick={() => handleDeletePost(post)}
                              className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                              title="Delete post"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'trending' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Trending Posts</h2>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Most Liked Posts (Last 7 Days)</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {trendingLoading ? (
                    <div className="p-6 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                      <p className="text-gray-500">Loading trending posts...</p>
                    </div>
                  ) : trendingPosts.length === 0 ? (
                    <div className="p-6 text-center">
                      <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No trending posts</h3>
                      <p className="text-gray-500">No posts have gained traction in the last 7 days</p>
                    </div>
                  ) : (
                    trendingPosts.map((post, index) => (
                      <div key={post.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                                index === 0 ? 'bg-yellow-100 text-yellow-800' :
                                index === 1 ? 'bg-gray-100 text-gray-800' :
                                index === 2 ? 'bg-orange-100 text-orange-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                #{index + 1}
                              </span>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-medium text-gray-900">{post.title}</h3>
                              <p className="text-gray-600 mb-2 line-clamp-2">{post.content.substring(0, 150)}...</p>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span>By {post.author.username}</span>
                                <span>{new Date(post.created_at).toLocaleDateString()}</span>
                                <span className="flex items-center">
                                  <Heart className="w-4 h-4 mr-1" />
                                  {post.like_count} likes
                                </span>
                                <span className="flex items-center">
                                  <MessageCircle className="w-4 h-4 mr-1" />
                                  {post.comment_count} comments
                                </span>

                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Analytics</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Post Performance */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Post Performance</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">

                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Published Posts</span>
                        <span className="text-lg font-bold text-green-600">{stats.posts - stats.drafts}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Draft Posts</span>
                        <span className="text-lg font-bold text-yellow-600">{stats.drafts}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Total Engagement</span>
                        <span className="text-lg font-bold text-purple-600">
                          {posts.reduce((total, post) => total + post.like_count + post.comment_count, 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top Performing Posts */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Top Performing Posts</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {posts
                        .sort((a, b) => (b.like_count + b.comment_count) - (a.like_count + a.comment_count))
                        .slice(0, 5)
                        .map((post, index) => (
                          <div key={post.id} className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 truncate">{post.title}</h4>
                              <p className="text-sm text-gray-500">
                                {post.like_count + post.comment_count} total engagement
                              </p>
                            </div>
                            <span className="text-sm font-medium text-purple-600">#{index + 1}</span>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'engagement' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Engagement Overview</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <Heart className="w-8 h-8 text-red-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Likes</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {posts.reduce((total, post) => total + post.like_count, 0)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <MessageCircle className="w-8 h-8 text-blue-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Comments</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {posts.reduce((total, post) => total + post.comment_count, 0)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <Users className="w-8 h-8 text-green-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Followers</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.followers}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Engagement */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Most Engaging Posts</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {posts
                    .filter(post => post.like_count > 0 || post.comment_count > 0)
                    .sort((a, b) => (b.like_count + b.comment_count) - (a.like_count + a.comment_count))
                    .slice(0, 10)
                    .map((post) => (
                      <div key={post.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{post.title}</h4>
                            <p className="text-sm text-gray-500 mb-2">
                              {post.is_published ? 'Published' : 'Draft'} • {new Date(post.created_at).toLocaleDateString()}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center">
                                <Heart className="w-4 h-4 mr-1" />
                                {post.like_count} likes
                              </span>
                              <span className="flex items-center">
                                <MessageCircle className="w-4 h-4 mr-1" />
                                {post.comment_count} comments
                              </span>
                              <span>{post.views} views</span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {post.like_count + post.comment_count} total
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  }
                  {posts.filter(post => post.like_count > 0 || post.comment_count > 0).length === 0 && (
                    <div className="p-6 text-center">
                      <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No engagement yet</h3>
                      <p className="text-gray-500">Your posts haven't received likes or comments yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile-settings' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Settings</h2>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <ProfileSettings />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>





      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, postId: null, postTitle: '' })}
        onConfirm={confirmDeletePost}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone and will permanently remove the post and all its comments."
        itemName={deleteModal.postTitle}
      />
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
};

export default Dashboard;