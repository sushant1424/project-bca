import React, { useState, useEffect } from 'react';
import API_CONFIG from '../config/api';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Search, User, Menu, ArrowLeft } from 'lucide-react';
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
import UserProfilePopover from './UserProfilePopover';

const LibraryPage = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(8);
  const { toasts, showSuccess, removeToast } = useToast();

  // Handle back navigation
  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  useEffect(() => {
    fetchLibraryPosts();
  }, []);

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Fetch user's library posts from backend API
  const fetchLibraryPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();
      if (!token) {
        setError('Please login to view your library');
        setLoading(false);
        return;
      }

      // Call the backend API to get user's saved posts
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/posts/users/library/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const savedPosts = await response.json();
        console.log('Fetched saved posts from backend:', savedPosts);
        
        // Mark all posts as saved since they come from the library endpoint
        const postsWithSavedFlag = savedPosts.map(post => ({ ...post, is_saved: true }));
      
        // Fetch follow status for each unique author
        const uniqueAuthorIds = [...new Set(savedPosts.map(post => post.author?.id).filter(Boolean))];
        const followStatusMap = {};
        
        try {
          // Fetch current user's following list
          const followingResponse = await fetch(`${API_CONFIG.BASE_URL}/api/posts/users/following/`, {
            headers: {
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (followingResponse.ok) {
            const followingData = await followingResponse.json();
            const followingIds = followingData.map(user => user.id);
            
            // Create follow status map
            uniqueAuthorIds.forEach(authorId => {
              followStatusMap[authorId] = followingIds.includes(authorId);
            });
          }
        } catch (followError) {
          console.error('Error fetching follow status:', followError);
        }
        
        // Add follow status to posts
        const postsWithFollowStatus = savedPosts.map(post => ({
          ...post,
          is_saved: true,
          author: {
            ...post.author,
            is_following: followStatusMap[post.author?.id] || false
          }
        }));
        
        console.log(`Found ${savedPosts.length} saved posts from backend`);
        setPosts(postsWithFollowStatus);
      } else {
        console.error('Failed to fetch saved posts:', response.status);
        setError('Failed to load your library');
        setPosts([]);
      }
      
    } catch (error) {
      console.error('Error fetching library:', error);
      setError('Error loading library');
    } finally {
      setLoading(false);
    }
  };

  // Handle save/unsave functionality in library
  const handleSave = async (postId) => {
    try {
      const token = getAuthToken();
      if (!token) {
        showWarning('Sign In Required', 'Please sign in to save posts');
        return;
      }

      // Call backend API to save/unsave post
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/posts/${postId}/save/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const newSavedState = data.saved;
        
        if (newSavedState) {
          // Post was saved - shouldn't happen in library view but handle it
          showSuccess('Saved', data.message);
        } else {
          // Post was unsaved - remove from library view
          setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
          showSuccess('Removed', data.message);
        }
        
        // Refresh library to ensure consistency
        fetchLibraryPosts();
      } else {
        throw new Error('Failed to save post');
      }
      
    } catch (error) {
      console.error('Error saving post:', error);
      showWarning('Error', 'Failed to update post. Please try again.');
    }
  };

  // Handle other post interactions
  const handleLike = async (postId) => {
    // Placeholder for like functionality
    showWarning('Info', 'Like functionality coming soon!');
  };

  const handleFollow = async (userId) => {
    try {
      const token = getAuthToken();
      if (!token) {
        showWarning('Warning', 'Please login to follow users');
        return;
      }

      // Find the post with this author to get current follow status
      const postWithAuthor = posts.find(post => post.author?.id === userId);
      const isCurrentlyFollowing = postWithAuthor?.author?.is_following || false;

      const response = await fetch(`${API_CONFIG.BASE_URL}/api/posts/users/${userId}/follow/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const newFollowStatus = data.following;
        
        // Update posts to reflect new follow status
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.author?.id === userId 
              ? { ...post, author: { ...post.author, is_following: newFollowStatus } }
              : post
          )
        );

        showSuccess('Success', newFollowStatus ? 'User followed successfully!' : 'User unfollowed successfully!');
      } else {
        showWarning('Error', 'Failed to update follow status');
      }
    } catch (error) {
      console.error('Error following user:', error);
      showWarning('Error', 'Failed to update follow status');
    }
  };

  const handleComment = async (postId, commentText) => {
    // Placeholder for comment functionality
    showWarning('Info', 'Comment functionality coming soon!');
  };

  // Filter posts based on search term
  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.author.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get current user for profile display
  const [currentUser, setCurrentUser] = useState(null);
  
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div className="bg-white">
      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Page Header with Title and Search */}
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
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bookmark className="w-7 h-7 text-gray-900" />
              <h1 className="text-3xl font-bold text-gray-900">My Library</h1>
            </div>
            
            {/* Library Search Box */}
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search library..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-transparent rounded-lg"
              />
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-gray-900 mb-4"></div>
            <p className="text-gray-600 font-medium">Loading your saved posts...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Unable to load library</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">{error}</p>
            <button
              onClick={fetchLibraryPosts}
              className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        ) : currentPosts.length === 0 ? (
          <div className="text-center py-20">
            <Bookmark className="w-20 h-20 text-gray-200 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              {searchTerm ? 'No matching posts found' : 'Your library is empty'}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
              {searchTerm 
                ? 'Try adjusting your search terms or browse more posts to save.' 
                : 'Start saving posts you want to read later. They\'ll appear here for easy access.'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => navigate('/')}
                className="mt-6 bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                Explore Posts
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Posts Grid */}
            <div className="space-y-4">
              {currentPosts.map((post) => (
                <Post
                  key={post.id}
                  post={post}
                  onLike={handleLike}
                  onFollow={handleFollow}
                  onComment={handleComment}
                  onSave={handleSave}
                  onPostClick={(postId) => navigate(`/post/${postId}`)}
                />
              ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center pt-8">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    
                    {[...Array(totalPages)].map((_, index) => {
                      const pageNumber = index + 1;
                      const isCurrentPage = pageNumber === currentPage;
                      const showPage = 
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1);
                      
                      if (!showPage) {
                        if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                          return (
                            <PaginationItem key={pageNumber}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        }
                        return null;
                      }
                      
                      return (
                        <PaginationItem key={pageNumber}>
                          <PaginationLink
                            onClick={() => handlePageChange(pageNumber)}
                            isActive={isCurrentPage}
                            className="cursor-pointer"
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default LibraryPage;
