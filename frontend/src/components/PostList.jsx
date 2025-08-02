import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Post from './Post';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { ToastContainer } from './ToastNotification';
import useToast from '../hooks/useToast';

const PostList = ({ selectedCategory, refreshTrigger, searchQuery, searchResults, isSearching }) => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const { toasts, showWarning, showSuccess, removeToast } = useToast();

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Fetch posts from API
  const fetchPosts = async (page = 1) => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Only add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Token ${token}`;
      }
      
      // Build URL with pagination and category filter
      let url = `http://127.0.0.1:8000/api/posts/?page=${page}`;
      if (selectedCategory) {
        url = `http://127.0.0.1:8000/api/posts/categories/${selectedCategory}/?page=${page}`;
      }
      
      const response = await fetch(url, {
        headers: headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Unauthorized - user not logged in, show sample posts
          console.log('User not authenticated, showing sample posts');
          const samplePosts = [
            {
              id: 1,
              title: "Welcome to Wrytera",
              content: "This is a sample post. Sign in to see real posts and interact with the community.",
              excerpt: "This is a sample post. Sign in to see real posts and interact with the community.",
              author: {
                id: 1,
                username: "Wrytera",
                avatar: null
              },
              created_at: new Date().toISOString(),
              views: 42,
              like_count: 5,
              comment_count: 2,
              is_liked: false,
              is_following_author: false,
              image: null
            },
            {
              id: 2,
              title: "Getting Started with Writing",
              content: "Learn how to create amazing content on our platform. Sign up to start your writing journey!",
              excerpt: "Learn how to create amazing content on our platform. Sign up to start your writing journey!",
              author: {
                id: 2,
                username: "Editor",
                avatar: null
              },
              created_at: new Date(Date.now() - 86400000).toISOString(),
              views: 128,
              like_count: 12,
              comment_count: 8,
              is_liked: false,
              is_following_author: false,
              image: null
            }
          ];
          setPosts(samplePosts);
          setHasNextPage(false);
          setHasPrevPage(false);
          setTotalPages(1);
          return;
        } else {
          throw new Error(`HTTP ${response.status}: Failed to fetch posts`);
        }
      }

      const data = await response.json();
      
      // Handle pagination data and ensure posts is always an array
      if (data && data.results && Array.isArray(data.results)) {
        setPosts(data.results);
        setHasNextPage(!!data.next);
        setHasPrevPage(!!data.previous);
        setTotalPages(Math.ceil(data.count / 10)); // Assuming 10 posts per page
      } else if (data && Array.isArray(data)) {
        setPosts(data);
        setHasNextPage(false);
        setHasPrevPage(false);
        setTotalPages(1);
      } else {
        // Fallback to empty array if data format is unexpected
        console.warn('Unexpected data format:', data);
        setPosts([]);
        setHasNextPage(false);
        setHasPrevPage(false);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle post like/unlike
  const handleLike = async (postId) => {
    try {
      const token = getAuthToken();
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
        // Update the post in the list
        setPosts(prevPosts => 
          prevPosts.map(post => {
            if (post.id === postId) {
              const isLiked = !post.is_liked;
              return {
                ...post,
                is_liked: isLiked,
                like_count: isLiked ? post.like_count + 1 : post.like_count - 1
              };
            }
            return post;
          })
        );
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  // Handle follow/unfollow user
  const handleFollow = async (userId) => {
    try {
      const token = getAuthToken();
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
        // Update posts to reflect follow status
        setPosts(prevPosts => 
          prevPosts.map(post => {
            if (post.author.id === userId) {
              return {
                ...post,
                is_following_author: !post.is_following_author
              };
            }
            return post;
          })
        );
      }
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  // Handle comment on post
  const handleComment = async (postId, commentText) => {
    try {
      const token = getAuthToken();
      if (!token) {
        showWarning('Sign In Required', 'Please sign in to comment');
        return;
      }

      if (!commentText || !commentText.trim()) {
        showWarning('Invalid Comment', 'Please enter a comment before submitting');
        return;
      }

      console.log('Posting comment:', { postId, commentText, token: token ? 'present' : 'missing' });

      const response = await fetch(`http://127.0.0.1:8000/api/posts/${postId}/comments/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: commentText.trim() }),
      });

      if (response.ok) {
        const newComment = await response.json();
        
        // Update the post with new comment
        setPosts(prevPosts => 
          prevPosts.map(post => {
            if (post.id === postId) {
              return {
                ...post,
                comments: [...(post.comments || []), newComment],
                comment_count: (post.comment_count || 0) + 1
              };
            }
            return post;
          })
        );
        showSuccess('Success', 'Comment posted successfully!');
      } else {
        console.error('Comment API Error:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url
        });
        
        let errorData = {};
        try {
          errorData = await response.json();
          console.error('Error response data:', errorData);
        } catch (e) {
          console.error('Failed to parse error response:', e);
        }
        
        const errorMessage = errorData.message || errorData.detail || errorData.error || `Server error (${response.status}): Failed to post comment`;
        showWarning('Error', errorMessage);
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      showWarning('Network Error', 'Unable to post comment. Please check your connection and try again.');
      throw error;
    }
  };

  // Handle save to library
  const handleSave = async (postId) => {
    try {
      const token = getAuthToken();
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
      } else {
        let errorMessage = 'Failed to save post. Please try again.';
        try {
          const errorData = await response.json();
          console.log('Save error response:', errorData);
          if (response.status === 400 && errorData.message && errorData.message.includes('already saved')) {
            showWarning('Already Saved', 'This post is already in your library');
            return;
          }
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          console.error('Failed to parse error response:', e);
        }
        showWarning('Error', errorMessage);
      }
    } catch (error) {
      console.error('Error saving post:', error);
      showWarning('Error', 'Failed to save post. Please try again.');
    }
  };

  // Load posts on component mount, when category changes, or when refresh trigger changes
  useEffect(() => {
    setCurrentPage(1);
    fetchPosts(1);
  }, [selectedCategory, refreshTrigger]);

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchPosts(page);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-500">Loading posts...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchPosts}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Empty state
  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts yet</h3>
        <p className="text-gray-500 mb-4">Follow some users to see their posts here!</p>
      </div>
    );
  }

  // Determine which posts to display
  const displayPosts = searchQuery && searchQuery.trim() ? searchResults : posts;
  const showPagination = !searchQuery || !searchQuery.trim();
  const isDisplayingSearchResults = searchQuery && searchQuery.trim();

  return (
    <div>
      {/* Search Status */}
      {isDisplayingSearchResults && (
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                  <span className="text-sm text-gray-600">Searching for "{searchQuery}"...</span>
                </>
              ) : (
                <span className="text-sm text-gray-600">
                  Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
                </span>
              )}
            </div>
            {!isSearching && searchResults.length === 0 && (
              <span className="text-sm text-gray-500">No posts found. Try different keywords.</span>
            )}
          </div>
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-4">
        {displayPosts.map((post) => (
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

      {/* Pagination - only show when not searching */}
      {showPagination && (hasNextPage || hasPrevPage) && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-white">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!hasPrevPage}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </button>
          </div>

          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            {totalPages > 5 && (
              <span className="px-2 py-2 text-sm text-gray-500">...</span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!hasNextPage}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      )}
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
};

export default PostList; 