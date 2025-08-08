import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Post from './Post';
import { useLike } from '../contexts/LikeContext';
import { useToast } from '../context/ToastContext';
import { Loader2 } from 'lucide-react';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './ui/pagination';

const PostList = ({ selectedCategory, refreshTrigger, searchQuery, searchResults, isSearching }) => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showSuccess, showError, showWarning } = useToast();
  const { initializePostLikes, handleLike: globalHandleLike } = useLike();
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

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
        if (response.status === 401 || response.status === 404) {
          // Show demo posts when API is not available or user not authenticated
          const demoPosts = [
            {
              id: 1,
              title: "Welcome to Wrytera",
              content: "This is a demo post. Start exploring our platform by creating your own content!",
              excerpt: "This is a demo post. Start exploring our platform by creating your own content!",
              author: {
                id: 1,
                username: "Demo User",
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
          
          // Use backend is_saved field directly
          const postsWithSavedStatus = demoPosts.map(post => ({
            ...post,
            is_saved: post.is_saved || false,
            author: {
              ...post.author,
              is_following: false
            }
          }));
          
          setPosts(postsWithSavedStatus);
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
      let postsData = [];
      if (data && data.results && Array.isArray(data.results)) {
        postsData = data.results;
        setHasNextPage(!!data.next);
        setHasPrevPage(!!data.previous);
        setTotalPages(Math.ceil(data.count / 10)); // Assuming 10 posts per page
      } else if (data && Array.isArray(data)) {
        postsData = data;
        // Initialize like context with post data
        initializePostLikes(postsData);
        setLoading(false);
        setHasPrevPage(false);
        setTotalPages(1);
      } else {
        // Fallback to empty array if data format is unexpected
        console.warn('Unexpected data format:', data);
        postsData = [];
        setHasNextPage(false);
        setHasPrevPage(false);
        setTotalPages(1);
      }
      
      // Initialize user-specific saved state from localStorage
      const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
      const userSavedKey = currentUser ? `savedPosts_${currentUser.id}` : 'savedPosts_guest';
      const savedPosts = JSON.parse(localStorage.getItem(userSavedKey) || '[]');
      
      // Fetch real follow status from backend API
      const authToken = getAuthToken();
      const uniqueAuthorIds = [...new Set(postsData.map(post => post.author?.id).filter(Boolean))];
      const followStatusMap = {};
      
      if (authToken && uniqueAuthorIds.length > 0) {
        try {
          // Fetch current user's following list
          const followingResponse = await fetch('http://127.0.0.1:8000/api/posts/users/following/', {
            headers: {
              'Authorization': `Token ${authToken}`,
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
      }
      
      const postsWithLocalState = postsData.map(post => ({
        ...post,
        is_saved: savedPosts.includes(post.id) || post.is_saved || false,
        author: {
          ...post.author,
          is_following: followStatusMap[post.author?.id] || post.author.is_following || false
        }
      }));
      
      setPosts(postsWithLocalState);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts. Please try again.');
    } finally {
      setLoading(false);
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

      // Find current follow status
      const currentPost = posts.find(post => post.author.id === userId);
      const isCurrentlyFollowing = currentPost?.author?.is_following || false;
      
      // Call backend API to follow/unfollow user
      const response = await fetch(`http://127.0.0.1:8000/api/posts/users/${userId}/follow/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to update follow status');
      }

      const data = await response.json();
      const newFollowingState = data.following;
      
      // Update posts to reflect follow status change
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.author.id === userId 
            ? { ...post, author: { ...post.author, is_following: newFollowingState } }
            : post
        )
      );
      
      // Follow functionality handled entirely by backend API
      if (newFollowingState) {
        showSuccess('Following', `You are now following this user!`);
      } else {
        showSuccess('Unfollowed', `You have unfollowed this user.`);
      }
    } catch (error) {
      console.error('Error following user:', error);
      showWarning('Error', 'Failed to update follow status. Please try again.');
    }
  };

  // Handle post like/unlike using global context
  const handleLike = async (postId) => {
    try {
      const token = getAuthToken();
      if (!token) {
        showWarning('Sign In Required', 'Please sign in to like posts');
        return;
      }

      // Find the current post to get its like state
      const currentPost = posts.find(post => post.id === postId);
      if (!currentPost) return;

      // Use global like handler
      const result = await globalHandleLike(postId, currentPost.is_liked, currentPost.like_count);
      showSuccess('Success', result.liked ? 'Post liked!' : 'Post unliked!');
    } catch (error) {
      console.error('Error liking post:', error);
      showError('Error', 'Failed to update like status');
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

  // Handle save/unsave to library
  const handleSave = async (postId) => {
    try {
      const token = getAuthToken();
      if (!token) {
        showWarning('Sign In Required', 'Please sign in to save posts');
        return;
      }

      // Call backend API to save/unsave post
      const response = await fetch(`http://127.0.0.1:8000/api/posts/${postId}/save/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const newSavedState = data.saved;
        
        // Update user-specific localStorage for saved posts
        const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
        if (currentUser) {
          const userSavedKey = `savedPosts_${currentUser.id}`;
          const savedPosts = JSON.parse(localStorage.getItem(userSavedKey) || '[]');
          
          if (newSavedState) {
            if (!savedPosts.includes(postId)) {
              savedPosts.push(postId);
            }
          } else {
            const index = savedPosts.indexOf(postId);
            if (index > -1) {
              savedPosts.splice(index, 1);
            }
          }
          
          localStorage.setItem(userSavedKey, JSON.stringify(savedPosts));
        }
        
        // Update the post's saved state in the posts array
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === postId 
              ? { ...post, is_saved: newSavedState }
              : post
          )
        );
        
        // Show success message
        showSuccess(
          newSavedState ? 'Saved' : 'Removed', 
          data.message
        );
      } else {
        throw new Error('Failed to save post');
      }
      
    } catch (error) {
      console.error('Error saving post:', error);
      showWarning('Error', 'Failed to update post. Please try again.');
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
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        <div className="mt-8 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={!hasPrevPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => handlePageChange(pageNum)}
                      isActive={currentPage === pageNum}
                      className="cursor-pointer"
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              {totalPages > 5 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={!hasNextPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
      

    </div>
  );
};

export default PostList; 