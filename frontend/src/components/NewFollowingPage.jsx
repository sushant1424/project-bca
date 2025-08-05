import React, { useState, useEffect } from 'react';
import { Heart, Search, TrendingUp, BarChart3, Users, UserCheck, Loader2 } from 'lucide-react';
import Post from './Post';
import { ToastContainer } from './ToastNotification';
import useToast from '../hooks/useToast';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './ui/pagination';
import { Input } from './ui/input';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';

const FollowingPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(6); // 6 posts per page for better pagination demo
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [followingStats, setFollowingStats] = useState({
    totalFollowing: 0,
    totalPosts: 0,
    avgPostsPerUser: 0,
    mostActiveUser: null,
    weeklyActivity: 0
  });
  const { toasts, showSuccess, removeToast } = useToast();

  useEffect(() => {
    fetchFollowingPosts();
  }, []);

  const getAuthToken = () => localStorage.getItem('token');

  const fetchFollowingPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();
      
      if (!token) {
        setError('Please login to view your following feed');
        setLoading(false);
        return;
      }

      // Get followed users from localStorage
      const followedUsers = JSON.parse(localStorage.getItem('followedUsers') || '[]');
      
      if (followedUsers.length === 0) {
        setPosts([]);
        calculateStats([], followedUsers);
        setLoading(false);
        return;
      }

      // Try API first, then fallback
      try {
        const response = await fetch('http://127.0.0.1:8000/api/posts/following-feed/', {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const postsData = data.results || data;
          const postsWithFollowing = postsData.map(post => ({
            ...post,
            author: { ...post.author, is_following: true }
          }));
          
          setPosts(postsWithFollowing);
          calculateStats(postsWithFollowing, followedUsers);
          setLoading(false);
          return;
        }
      } catch (apiError) {
        console.log('API not available, using fallback');
      }

      // Fallback: Get all posts and filter
      let allPosts = [];
      for (let page = 1; page <= 3; page++) {
        try {
          const response = await fetch(`http://127.0.0.1:8000/api/posts/?page=${page}`, {
            headers: {
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            const pagePosts = data.results || [];
            allPosts = [...allPosts, ...pagePosts];
          }
        } catch (err) {
          break;
        }
      }
      
      const followingPosts = allPosts
        .filter(post => followedUsers.includes(post.author.id))
        .map(post => ({
          ...post,
          author: { ...post.author, is_following: true }
        }));
      
      setPosts(followingPosts);
      calculateStats(followingPosts, followedUsers);
      
    } catch (error) {
      console.error('Error fetching following posts:', error);
      setError('Failed to load following feed');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (posts, followedUsers) => {
    const userCounts = {};
    posts.forEach(post => {
      const userId = post.author.id;
      userCounts[userId] = (userCounts[userId] || 0) + 1;
    });

    const mostActiveUserId = Object.keys(userCounts).reduce((a, b) => 
      userCounts[a] > userCounts[b] ? a : b, Object.keys(userCounts)[0]
    );

    const mostActiveUser = posts.find(post => 
      post.author.id.toString() === mostActiveUserId
    )?.author;

    // Calculate weekly activity (posts from last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weeklyPosts = posts.filter(post => 
      new Date(post.created_at) > oneWeekAgo
    ).length;

    setFollowingStats({
      totalFollowing: followedUsers.length,
      totalPosts: posts.length,
      avgPostsPerUser: posts.length > 0 ? (posts.length / Object.keys(userCounts).length).toFixed(1) : 0,
      mostActiveUser: mostActiveUser ? {
        ...mostActiveUser,
        postCount: userCounts[mostActiveUserId] || 0
      } : null,
      weeklyActivity: weeklyPosts
    });
  };

  // Filter posts based on search term
  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.author.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const currentPosts = filteredPosts.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSavePost = (postId, isSaved) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId ? { ...post, is_saved: isSaved } : post
      )
    );
    
    if (isSaved) {
      showSuccess('Post saved to library');
    } else {
      showSuccess('Post removed from library');
    }
  };

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => handlePageChange(i)}
              isActive={currentPage === i}
              className="cursor-pointer"
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      // Always show first page
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            onClick={() => handlePageChange(1)}
            isActive={currentPage === 1}
            className="cursor-pointer"
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      // Show ellipsis if current page is far from start
      if (currentPage > 3) {
        items.push(<PaginationEllipsis key="start-ellipsis" />);
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => handlePageChange(i)}
              isActive={currentPage === i}
              className="cursor-pointer"
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      // Show ellipsis if current page is far from end
      if (currentPage < totalPages - 2) {
        items.push(<PaginationEllipsis key="end-ellipsis" />);
      }

      // Always show last page
      if (totalPages > 1) {
        items.push(
          <PaginationItem key={totalPages}>
            <PaginationLink
              onClick={() => handlePageChange(totalPages)}
              isActive={currentPage === totalPages}
              className="cursor-pointer"
            >
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        );
      }
    }

    return items;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Loading your following feed...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Following Feed</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchFollowingPosts}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Heart className="h-8 w-8 text-red-500" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Following Feed</h1>
              <p className="text-gray-600 mt-1">
                {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'} from people you follow
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search posts by title, content, or author..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page when searching
              }}
              className="pl-10 py-3 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-lg"
            />
          </div>

          {/* Analytics Toggle Button */}
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="mb-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center gap-2 shadow-lg"
          >
            <BarChart3 className="h-5 w-5" />
            {showAnalytics ? 'Hide Analytics' : 'Show Following Analytics'}
          </button>

          {/* Analytics Panel */}
          {showAnalytics && (
            <div className="mb-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-blue-600" />
                Following Analytics
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 shadow-sm border">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-gray-700">Following</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{followingStats.totalFollowing}</p>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm border">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="h-5 w-5 text-red-600" />
                    <span className="font-medium text-gray-700">Total Posts</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{followingStats.totalPosts}</p>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm border">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-gray-700">Avg Posts/User</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{followingStats.avgPostsPerUser}</p>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm border">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <span className="font-medium text-gray-700">This Week</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{followingStats.weeklyActivity} posts</p>
                </div>

                {followingStats.mostActiveUser && (
                  <div className="bg-white rounded-lg p-4 shadow-sm border md:col-span-2">
                    <div className="flex items-center gap-2 mb-2">
                      <UserCheck className="h-5 w-5 text-orange-600" />
                      <span className="font-medium text-gray-700">Most Active</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={followingStats.mostActiveUser.profile_picture} />
                        <AvatarFallback>
                          {followingStats.mostActiveUser.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-gray-900">{followingStats.mostActiveUser.username}</p>
                        <p className="text-sm text-gray-600">{followingStats.mostActiveUser.postCount} posts</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Posts */}
        {currentPosts.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No posts found' : 'No posts in your following feed'}
            </h3>
            <p className="text-gray-600">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Follow some users to see their posts here'
              }
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-6 mb-8">
              {currentPosts.map((post) => (
                <div key={post.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                  <Post
                    post={post}
                    onSave={handleSavePost}
                  />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        className={`cursor-pointer ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      />
                    </PaginationItem>
                    
                    {renderPaginationItems()}
                    
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        className={`cursor-pointer ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}

        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    </div>
  );
};

export default FollowingPage;
