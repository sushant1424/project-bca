import React, { useState, useEffect } from 'react';
import { Heart, Search, TrendingUp, BarChart3, Users, UserCheck, Loader2, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(6); // 6 posts per page for better pagination demo
  const [followedUsersScrollPosition, setFollowedUsersScrollPosition] = useState(0);
  const [followedUsers, setFollowedUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const { toasts, showSuccess, removeToast } = useToast();

  // Handle back navigation
  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  // Handle post click to navigate to post detail
  const handlePostClick = (postId) => {
    navigate(`/post/${postId}`);
  };

  useEffect(() => {
    fetchFollowingPosts();
    loadFollowedUsers();
  }, []);

  const loadFollowedUsers = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      // Call the backend API to get the current user's following list
      const response = await fetch('http://127.0.0.1:8000/api/posts/users/following/', {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const followingData = await response.json();
        console.log('Fetched following users from backend:', followingData);
        setFollowedUsers(followingData);
      } else {
        console.error('Failed to fetch following users:', response.status);
        setFollowedUsers([]);
      }
    } catch (error) {
      console.error('Error loading followed users:', error);
    }
  };

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

      // Call backend API to get following feed posts
      try {
        const response = await fetch('http://127.0.0.1:8000/api/posts/following-feed/', {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Following feed API response:', data);
          const postsData = Array.isArray(data) ? data : (data.results || []);
          
          const postsWithFollowing = postsData.map(post => ({
            ...post,
            author: { ...post.author, is_following: true }
          }));
          
          setPosts(postsWithFollowing);
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
      
    } catch (error) {
      console.error('Error fetching following posts:', error);
      setError('Failed to load following feed');
    } finally {
      setLoading(false);
    }
  };



  // Filter posts based on search term and selected user
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesUser = selectedUser ? post.author.id === selectedUser.id : true;
    
    return matchesSearch && matchesUser;
  });

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
          {/* Back Button */}
          <div className="mb-6">
            <button 
              onClick={handleBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back</span>
            </button>
          </div>
          
          <div className="flex items-center gap-3 mb-6">
            <Users className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Following Feed</h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-gray-600">
                  {selectedUser 
                    ? `${filteredPosts.length} ${filteredPosts.length === 1 ? 'post' : 'posts'} from ${selectedUser.username}`
                    : `${filteredPosts.length} ${filteredPosts.length === 1 ? 'post' : 'posts'} from people you follow`
                  }
                </p>
                {selectedUser && (
                  <button
                    onClick={() => {
                      setSelectedUser(null);
                      setCurrentPage(1);
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium ml-2 underline"
                  >
                    Show all
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Followed Users */}
          <div className="mb-8 relative">
            <div className="flex items-center">
              {followedUsers.length > 6 && (
                <button
                  onClick={() => {
                    const container = document.getElementById('followed-users-container');
                    container.scrollLeft -= 200;
                  }}
                  className="absolute left-0 z-10 bg-white shadow-md rounded-full p-2 hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 text-gray-600" />
                </button>
              )}
              
              <div 
                id="followed-users-container"
                className="flex items-center gap-4 overflow-x-auto scrollbar-hide pb-2 mx-8"
                style={{ scrollBehavior: 'smooth' }}
              >
                {followedUsers.map((user) => (
                  <div 
                    key={user.id} 
                    className="flex flex-col items-center min-w-0 flex-shrink-0 cursor-pointer"
                    onClick={() => {
                      if (selectedUser?.id === user.id) {
                        setSelectedUser(null); // Deselect if clicking the same user
                      } else {
                        setSelectedUser(user); // Select the user
                      }
                      setCurrentPage(1); // Reset to first page
                    }}
                  >
                    <Avatar className={`h-16 w-16 border-2 transition-colors ${
                      selectedUser?.id === user.id 
                        ? 'border-blue-500 ring-2 ring-blue-200' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <AvatarImage src={user.profile_picture} alt={user.username} />
                      <AvatarFallback className="text-lg font-medium">
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <p className={`text-sm mt-2 text-center max-w-[80px] truncate ${
                      selectedUser?.id === user.id ? 'text-blue-600 font-medium' : 'text-gray-700'
                    }`}
                       style={{fontFamily: 'medium-content-sans-serif-font, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif'}}>
                      {user.username}
                    </p>
                  </div>
                ))}
              </div>
              
              {followedUsers.length > 6 && (
                <button
                  onClick={() => {
                    const container = document.getElementById('followed-users-container');
                    container.scrollLeft += 200;
                  }}
                  className="absolute right-0 z-10 bg-white shadow-md rounded-full p-2 hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                </button>
              )}
            </div>
          </div>


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
                <Post
                  key={post.id}
                  post={post}
                  onSave={handleSavePost}
                  onPostClick={handlePostClick}
                />
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
