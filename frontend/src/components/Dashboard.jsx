import React, { useState, useEffect } from 'react';
import API_CONFIG from '../config/api';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { 
  X, Home, FileText, BarChart3, Users, Settings, 
  TrendingUp, Eye, Heart, BookOpen, Search, Calendar, Clock,
  Edit, Trash2, MoreVertical
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UnauthorizedAlert from './UnauthorizedAlert';
import { useLike } from '../contexts/LikeContext';
import { useAnalytics } from '../contexts/AnalyticsContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

// MyPostsSection Component
const MyPostsSection = ({ navigate, user }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all'); // all, published, draft
  const [showActions, setShowActions] = useState(null); // Track which post's actions are shown
  const [deleteConfirm, setDeleteConfirm] = useState(null); // Track which post to delete
  const postsPerPage = 6;
  const { initializePostLikes, getPostLike } = useLike();
  const { getPostStats } = useAnalytics();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchUserPosts();
  }, [currentPage, searchTerm, statusFilter]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showActions && !event.target.closest('.action-dropdown')) {
        setShowActions(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showActions]);

  const fetchUserPosts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      // Use the dedicated endpoint for current user's posts
      const apiUrl = `${API_CONFIG.BASE_URL}/api/posts/users/posts/`;
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        let userPosts = data || [];
        
        // Apply search filter
        if (searchTerm) {
          userPosts = userPosts.filter(post => 
            post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (post.excerpt && post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()))
          );
        }
        
        // Apply status filter
        if (statusFilter !== 'all') {
          userPosts = userPosts.filter(post => {
            if (statusFilter === 'published') {
              return post.is_published === true;
            } else if (statusFilter === 'draft') {
              return post.is_published === false;
            }
            return true;
          });
        }
        
        setPosts(userPosts);
        // Initialize like context with post data
        initializePostLikes(userPosts);
        // Calculate total pages based on filtered results  
        setTotalPages(Math.ceil(userPosts.length / postsPerPage));
      } else {
        console.error('Failed to fetch user posts:', response.status);
      }
    } catch (error) {
      console.error('Error fetching user posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };
  
  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleEditPost = (e, postId) => {
    e.stopPropagation(); // Prevent card click
    navigate(`/write?edit=${postId}`);
  };

  const handleDeletePost = async (e, postId) => {
    e.stopPropagation(); // Prevent card click
    console.log('Delete button clicked for post ID:', postId);
    console.log('Post ID type:', typeof postId);
    if (!postId) {
      console.error('Post ID is undefined or null!');
      showError('Error', 'Unable to delete post - invalid post ID');
      return;
    }
    setDeleteConfirm(postId);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        showError('Authentication Error', 'Please log in to delete posts.');
        setDeleteConfirm(null);
        return;
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/api/posts/${deleteConfirm}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Remove the deleted post from the local state
        setPosts(posts.filter(post => post.id !== deleteConfirm));
        setDeleteConfirm(null);
        
        // Show success toast
        showSuccess('Post Deleted', 'Your post has been successfully deleted.');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to delete post:', response.status, errorData);
        
        if (response.status === 403) {
          showError('Permission Denied', 'You do not have permission to delete this post.');
        } else if (response.status === 404) {
          showError('Post Not Found', 'The post you are trying to delete no longer exists.');
        } else {
          showError('Delete Failed', 'Failed to delete post. Please try again.');
        }
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      showError('Network Error', 'Unable to delete post. Please check your connection and try again.');
      setDeleteConfirm(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
    setShowActions(null);
  };

  const toggleActions = (e, postId) => {
    e.stopPropagation(); // Prevent card click
    setShowActions(showActions === postId ? null : postId);
  };
  
  const getPostStatusBadge = (post) => {
    const isPublished = post.status === 'published' || post.is_published === true || (!post.status && !post.is_draft);
    return isPublished ? (
      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Published</span>
    ) : (
      <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Draft</span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">My Posts</h2>
          <Button onClick={() => navigate('/write')} className="bg-blue-600 hover:bg-blue-700">
            <FileText className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </div>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (posts.length === 0 && !searchTerm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">My Posts</h2>
          <Button onClick={() => navigate('/write')} className="bg-blue-600 hover:bg-blue-700">
            <FileText className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </div>
        <Card className="p-8 text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
          <p className="text-gray-600 mb-4">Start creating content to see your posts here</p>
          <Button onClick={() => navigate('/write')} className="bg-blue-600 hover:bg-blue-700">
            Write Your First Post
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Posts ({posts.length})</h2>
        <Button onClick={() => navigate('/write')} className="bg-blue-600 hover:bg-blue-700">
          <FileText className="h-4 w-4 mr-2" />
          New Post
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search your posts..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleStatusFilter('all')}
          >
            All Posts
          </Button>
          <Button
            variant={statusFilter === 'published' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleStatusFilter('published')}
          >
            Published
          </Button>
          <Button
            variant={statusFilter === 'draft' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleStatusFilter('draft')}
          >
            Drafts
          </Button>
        </div>
      </div>

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <Card className="p-8 text-center">
          <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No posts found</h3>
          <p className="text-gray-600">Try adjusting your search terms</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Card key={post.id} className="hover:shadow-lg transition-shadow relative group">
              <CardContent className="p-4">
                {/* Action buttons - positioned absolutely */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => toggleActions(e, post.id)}
                      className="h-8 w-8 p-0 hover:bg-gray-100"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                    
                    {/* Dropdown menu */}
                    {showActions === post.id && (
                      <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px] action-dropdown">
                        <button
                          onClick={(e) => handleEditPost(e, post.id)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </button>
                        <button
                          onClick={(e) => handleDeletePost(e, post.id)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Post content - clickable for viewing */}
                <div 
                  className="cursor-pointer"
                  onClick={() => navigate(`/post/${post.id}`)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg line-clamp-2 flex-1 pr-8">{post.title}</h3>
                    {getPostStatusBadge(post)}
                  </div>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">{post.excerpt || post.content?.substring(0, 100) + '...'}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(post.created_at)}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {getPostStats(post.id, post).like_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {getPostStats(post.id, post).views}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-red-500 mr-2" />
              Delete Post
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600">
              Are you sure you want to delete this post? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex space-x-3 mt-6">
            <Button
              variant="outline"
              onClick={cancelDelete}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Post</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={cancelDelete}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// HomeSection Component
const HomeSection = ({ navigate, user, setActiveSection }) => {
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userStats, refreshAnalytics, postStats } = useAnalytics();
  const { likeStates, initializePostLikes } = useLike();

  useEffect(() => {
    fetchDashboardData();
  }, []);

      // Refresh recent posts when analytics or likes change
  useEffect(() => {
    if (recentPosts.length > 0 && likeStates && postStats) {
      // Update recent posts with latest data from contexts
      const updatedPosts = recentPosts.map(post => ({
        ...post,
        like_count: likeStates[post.id]?.likeCount ?? post.like_count,
        // Use view_count from backend (accurate) or fallback to views field
        views: post.view_count ?? post.views ?? 0
      }));
      setRecentPosts(updatedPosts);
    }
  }, [likeStates, postStats, recentPosts.length]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Fetch all posts and filter by current user
      const postsResponse = await fetch(`${API_CONFIG.BASE_URL}/api/posts/?page_size=100`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (postsResponse.ok) {
        const postsData = await postsResponse.json();
        // Filter posts by current user
        const userPosts = (postsData.results || []).filter(post => {
          const postAuthorId = post.author?.id || post.author;
          const postAuthorUsername = post.author?.username || post.username;
          
          return postAuthorId === user?.id || 
                 postAuthorUsername === user?.username ||
                 post.user === user?.id ||
                 post.user?.id === user?.id;
        });
        
        // Set recent posts (first 3) and initialize like states
        const recentPostsData = userPosts.slice(0, 3);
        setRecentPosts(recentPostsData);
        initializePostLikes(recentPostsData);
      }

      // Get following count from backend API
      let followingCount = 0;
      try {
        const followingResponse = await fetch(`${API_CONFIG.BASE_URL}/api/posts/users/following/`, {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (followingResponse.ok) {
          const followingData = await followingResponse.json();
          followingCount = followingData.length;
        }
      } catch (error) {
        console.error('Error fetching following count:', error);
      }
      
      // Try to get followers count from API or use user data
      let followersCount = user?.followers_count || 0;
      
      try {
        // Attempt to get more accurate follower data if API supports it
        const profileResponse = await fetch(`${API_CONFIG.BASE_URL}/api/auth/user/`, {
          headers: { 'Authorization': `Token ${token}` }
        });
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          followersCount = profileData.followers_count || followersCount;
        }
      } catch (error) {
        console.log('Could not fetch updated follower count:', error);
      }

      refreshAnalytics();
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dashboard Overview</h2>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4 hover:shadow-md transition-shadow">
          <CardContent className="flex items-center justify-between p-0">
            <div>
              <p className="text-sm text-gray-600">Total Posts</p>
              <p className="text-2xl font-bold">{userStats.totalPosts}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-500" />
          </CardContent>
        </Card>
        <Card className="p-4 hover:shadow-md transition-shadow">
          <CardContent className="flex items-center justify-between p-0">
            <div>
              <p className="text-sm text-gray-600">Total Likes</p>
              <p className="text-2xl font-bold">{userStats.totalLikes}</p>
            </div>
            <Heart className="h-8 w-8 text-red-500" />
          </CardContent>
        </Card>
        <Card className="p-4 hover:shadow-md transition-shadow">
          <CardContent className="flex items-center justify-between p-0">
            <div>
              <p className="text-sm text-gray-600">Total Views</p>
              <p className="text-2xl font-bold">{userStats.totalViews}</p>
            </div>
            <Eye className="h-8 w-8 text-indigo-500" />
          </CardContent>
        </Card>
        <Card className="p-4 hover:shadow-md transition-shadow">
          <CardContent className="flex items-center justify-between p-0">
            <div>
              <p className="text-sm text-gray-600">Followers</p>
              <p className="text-2xl font-bold">{userStats.followers || 0}</p>
            </div>
            <Users className="h-8 w-8 text-green-500" />
          </CardContent>
        </Card>
        <Card className="p-4 hover:shadow-md transition-shadow">
          <CardContent className="flex items-center justify-between p-0">
            <div>
              <p className="text-sm text-gray-600">Following</p>
              <p className="text-2xl font-bold">{userStats.following || 0}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-500" />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/write')}>
          <CardContent className="flex items-center gap-4 p-0">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold">Write New Post</h3>
              <p className="text-sm text-gray-600">Create and publish content</p>
            </div>
          </CardContent>
        </Card>
        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveSection('posts')}>
          <CardContent className="flex items-center gap-4 p-0">
            <div className="p-3 bg-green-100 rounded-lg">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold">Manage Posts</h3>
              <p className="text-sm text-gray-600">View and edit your content</p>
            </div>
          </CardContent>
        </Card>
        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveSection('analytics')}>
          <CardContent className="flex items-center gap-4 p-0">
            <div className="p-3 bg-purple-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold">View Analytics</h3>
              <p className="text-sm text-gray-600">Track performance metrics</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Posts */}
      {recentPosts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Posts</h3>
            <Button variant="outline" size="sm" onClick={() => setActiveSection('posts')}>
              View All
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/post/${post.id}`)}>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2 line-clamp-2">{post.title}</h4>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{post.excerpt || post.content?.substring(0, 80) + '...'}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{formatDate(post.created_at)}</span>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {(likeStates && likeStates[post.id]?.likeCount) ?? post.like_count ?? 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {(postStats && postStats[post.id]?.views) ?? post.views ?? 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// AnalyticsSection Component
const AnalyticsSection = ({ user }) => {
  const { userStats, postStats } = useAnalytics();
  const [topPosts, setTopPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopPosts();
  }, [userStats.totalPosts]);

  const fetchTopPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Fetch user's posts for top posts calculation
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/posts/users/posts/`, {
        headers: { 'Authorization': `Token ${token}` }
      });

      if (response.ok) {
        const posts = await response.json();
        
        // Get top 5 posts by likes
        const sortedPosts = posts
          .sort((a, b) => (b.like_count || 0) - (a.like_count || 0))
          .slice(0, 5);

        setTopPosts(sortedPosts);
      }
    } catch (error) {
      console.error('Error fetching top posts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Analytics</h2>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <CardContent className="p-0">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold">Total Views</h3>
            </div>
            <p className="text-3xl font-bold mb-2">{userStats.totalViews.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Across all posts</p>
          </CardContent>
        </Card>
        <Card className="p-6">
          <CardContent className="p-0">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="h-5 w-5 text-red-600" />
              <h3 className="font-semibold">Total Likes</h3>
            </div>
            <p className="text-3xl font-bold mb-2">{userStats.totalLikes.toLocaleString()}</p>
            <p className="text-sm text-gray-600">From {userStats.totalPosts} posts</p>
          </CardContent>
        </Card>
        <Card className="p-6">
          <CardContent className="p-0">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold">Published Posts</h3>
            </div>
            <p className="text-3xl font-bold mb-2">{userStats.totalPosts}</p>
            <p className="text-sm text-gray-600">Total content created</p>
          </CardContent>
        </Card>
        <Card className="p-6">
          <CardContent className="p-0">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold">Avg Likes/Post</h3>
            </div>
            <p className="text-3xl font-bold mb-2">{userStats.avgLikes}</p>
            <p className="text-sm text-gray-600">Engagement rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Posts */}
      {topPosts.length > 0 && (
        <Card className="p-6">
          <CardContent className="p-0">
            <h3 className="font-semibold mb-4">Top Performing Posts</h3>
            <div className="space-y-4">
              {topPosts.map((post, index) => (
                <div key={post.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                      #{index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium line-clamp-1">{post.title}</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Heart className="h-4 w-4 text-red-500" />
                      {post.like_count || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4 text-blue-500" />
                      {post.views || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {userStats.totalPosts === 0 && (
        <Card className="p-8 text-center">
          <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Analytics Data</h3>
          <p className="text-gray-600 mb-4">Start creating posts to see your analytics here</p>
        </Card>
      )}
    </div>
  );
};

// AudienceSection Component
const AudienceSection = ({ user }) => {
  const { userStats } = useAnalytics();
  const [followerGrowth, setFollowerGrowth] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFollowerGrowth();
  }, [userStats.followers]);

  const fetchFollowerGrowth = async () => {
    try {
      // For now, we'll show current followers as growth
      // In a real app, you'd track historical follower data
      const currentFollowers = userStats.followers || 0;
      setFollowerGrowth(currentFollowers);
    } catch (error) {
      console.error('Error calculating follower growth:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Audience</h2>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Audience</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <CardContent className="p-0">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold">Followers</h3>
            </div>
            <p className="text-3xl font-bold mb-2">{userStats.followers || 0}</p>
            <p className="text-sm text-gray-600">People following your content</p>
          </CardContent>
        </Card>
        <Card className="p-6">
          <CardContent className="p-0">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold">Growth</h3>
            </div>
            <p className="text-3xl font-bold mb-2">+{followerGrowth}</p>
            <p className="text-sm text-gray-600">New followers this month</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user, token, loading: authLoading, isAuthenticated } = useAuth();
  const [showUnauthorized, setShowUnauthorized] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated()) {
        setShowUnauthorized(true);
        return;
      }
      
      // Check if user has changed
      if (currentUserId && currentUserId !== user?.id) {
        // User changed, clear previous user's dashboard state
        setActiveSection('home');
      }
      
      setCurrentUserId(user?.id);
      setShowUnauthorized(false);
    }
  }, [user, token, authLoading, currentUserId, isAuthenticated]);

  // Clear state when user logs out
  useEffect(() => {
    const handleUserLogout = () => {
      setCurrentUserId(null);
      setActiveSection('home');
      setShowUnauthorized(true);
    };

    window.addEventListener('userLogout', handleUserLogout);
    return () => window.removeEventListener('userLogout', handleUserLogout);
  }, []);

  const handleBackToHome = () => {
    navigate('/');
  };

  if (showUnauthorized) {
    return <UnauthorizedAlert />;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4 w-48"></div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const sidebarItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'posts', label: 'My Posts', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'audience', label: 'Audience', icon: Users }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return <HomeSection navigate={navigate} user={user} setActiveSection={setActiveSection} />;

      case 'posts':
        return <MyPostsSection navigate={navigate} user={user} />;

      case 'analytics':
        return <AnalyticsSection user={user} />;

      case 'audience':
        return <AudienceSection user={user} />;



      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Dashboard Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">Dashboard</h1>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBackToHome}
              className="p-2 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600">Welcome, {user?.first_name || user?.username}</p>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeSection === item.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard;
