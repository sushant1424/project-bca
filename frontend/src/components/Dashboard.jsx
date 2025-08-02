import React, { useState, useEffect } from 'react';
import { Home, FileText, Plus, Search, Filter, Eye, Edit, Trash2, Users, TrendingUp, Calendar } from 'lucide-react';
import WritePage from './WritePage';

const Dashboard = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    followers: 0,
    posts: 0,
    drafts: 0,
    views: 0
  });
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState('all'); // all, published, draft
  const [searchTerm, setSearchTerm] = useState('');
  const [showWritePage, setShowWritePage] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      fetchUserStats();
      fetchUserPosts();
    }
  }, []);

  // Fetch user statistics
  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/api/posts/users/stats/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
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
      const response = await fetch('http://127.0.0.1:8000/api/posts/users/posts/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console.error('Error fetching user posts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter posts based on status and search term
  const filteredPosts = posts.filter(post => {
    const matchesFilter = filter === 'all' || 
                         (filter === 'published' && post.is_published) ||
                         (filter === 'draft' && !post.is_published);
    
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // Handle post creation
  const handlePostCreated = (newPost) => {
    fetchUserPosts();
    fetchUserStats();
  };

  // Handle post deletion
  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://127.0.0.1:8000/api/posts/${postId}/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          fetchUserPosts();
          fetchUserStats();
        }
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  // If user is not logged in, show login message
  if (!user) {
    return (
      <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${isOpen ? 'block' : 'hidden'}`}>
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Login Required</h3>
            <p className="text-gray-600 mb-6">You need to be logged in to access the dashboard.</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <span className="text-gray-500">Welcome back, {user.username}!</span>
          </div>
          <button
            onClick={onClose}
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
              Posts
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
                
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <TrendingUp className="w-8 h-8 text-purple-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Views</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.views}</p>
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
                        <span className="text-sm text-gray-500">{post.views} views</span>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <Eye className="w-4 h-4 text-gray-500" />
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
                  onClick={() => setShowWritePage(true)}
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
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                              <Eye className="w-4 h-4 text-gray-500" />
                            </button>
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                              <Edit className="w-4 h-4 text-gray-500" />
                            </button>
                            <button 
                              onClick={() => handleDeletePost(post.id)}
                              className="p-2 hover:bg-red-100 rounded-lg transition-colors"
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
        </div>
      </div>

      {/* Write Page */}
      <WritePage
        isOpen={showWritePage}
        onClose={() => setShowWritePage(false)}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
};

export default Dashboard; 