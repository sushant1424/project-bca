import React, { useState, useEffect } from 'react';
import Post from './Post';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

const PostList = ({ selectedCategory, refreshTrigger, onPostClick }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
        headers['Authorization'] = `Bearer ${token}`;
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
          // Unauthorized - user not logged in, but we can still show posts
          console.log('User not authenticated, showing public posts');
        } else {
          throw new Error(`HTTP ${response.status}: Failed to fetch posts`);
        }
      }

      const data = await response.json();
      
      // Handle pagination data
      if (data.results) {
        setPosts(data.results);
        setHasNextPage(!!data.next);
        setHasPrevPage(!!data.previous);
        setTotalPages(Math.ceil(data.count / 10)); // Assuming 10 posts per page
      } else {
        setPosts(data);
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
        alert('Please sign in to like posts');
        return;
      }

      const response = await fetch(`http://127.0.0.1:8000/api/posts/${postId}/like/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
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
        alert('Please sign in to follow users');
        return;
      }

      const response = await fetch(`http://127.0.0.1:8000/api/posts/users/${userId}/follow/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
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
        alert('Please sign in to comment');
        return;
      }

      const response = await fetch(`http://127.0.0.1:8000/api/posts/${postId}/comments/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: commentText }),
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
                comment_count: post.comment_count + 1
              };
            }
            return post;
          })
        );
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      throw error;
    }
  };

  // Handle repost
  const handleRepost = async (postId) => {
    try {
      const token = getAuthToken();
      if (!token) {
        alert('Please sign in to repost');
        return;
      }

      const response = await fetch(`http://127.0.0.1:8000/api/posts/${postId}/repost/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment: '' }), // Optional comment
      });

      if (response.ok) {
        alert('Post reposted successfully!');
      }
    } catch (error) {
      console.error('Error reposting:', error);
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

  return (
    <div>
      <div className="divide-y divide-gray-200">
        {posts.map((post) => (
          <Post
            key={post.id}
            post={post}
            onLike={handleLike}
            onFollow={handleFollow}
            onComment={handleComment}
            onRepost={handleRepost}
            onPostClick={onPostClick}
          />
        ))}
      </div>

      {/* Pagination */}
      {(hasNextPage || hasPrevPage) && (
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
    </div>
  );
};

export default PostList; 