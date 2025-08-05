import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAnalytics } from './AnalyticsContext';

const LikeContext = createContext();

export const useLike = () => {
  const context = useContext(LikeContext);
  if (!context) {
    throw new Error('useLike must be used within a LikeProvider');
  }
  return context;
};

export const LikeProvider = ({ children }) => {
  const [postLikes, setPostLikes] = useState({});
  const [currentUserId, setCurrentUserId] = useState(null);
  const analytics = useAnalytics();

  // Clear state when user logs out
  useEffect(() => {
    const handleUserLogout = () => {
      setPostLikes({});
      setCurrentUserId(null);
    };

    window.addEventListener('userLogout', handleUserLogout);
    return () => window.removeEventListener('userLogout', handleUserLogout);
  }, []);

  // Update current user ID when it changes
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.id !== currentUserId) {
          // User changed, clear previous user's state
          setPostLikes({});
          setCurrentUserId(user.id);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        setPostLikes({});
        setCurrentUserId(null);
      }
    } else {
      // No user logged in
      if (currentUserId !== null) {
        setPostLikes({});
        setCurrentUserId(null);
      }
    }
  }, [currentUserId]);

  // Update like state for a specific post
  const updatePostLike = useCallback((postId, isLiked, likeCount) => {
    setPostLikes(prev => ({
      ...prev,
      [postId]: {
        is_liked: isLiked,
        like_count: likeCount
      }
    }));
    
    // Update analytics context
    if (analytics?.updateLike) {
      analytics.updateLike(postId, isLiked, likeCount);
    }
  }, [analytics]);

  // Get like state for a specific post
  const getPostLike = useCallback((postId, defaultLiked = false, defaultCount = 0) => {
    return postLikes[postId] || {
      is_liked: defaultLiked,
      like_count: defaultCount
    };
  }, [postLikes]);

  // Handle like/unlike action
  const handleLike = useCallback(async (postId, currentLiked, currentCount) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    // Optimistic update
    const newLiked = !currentLiked;
    const newCount = newLiked ? currentCount + 1 : currentCount - 1;
    updatePostLike(postId, newLiked, newCount);

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/posts/${postId}/like/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Update with actual server response
        updatePostLike(postId, data.liked, data.like_count);
        return data;
      } else {
        // Revert optimistic update on error
        updatePostLike(postId, currentLiked, currentCount);
        throw new Error('Failed to update like');
      }
    } catch (error) {
      // Revert optimistic update on error
      updatePostLike(postId, currentLiked, currentCount);
      throw error;
    }
  }, [updatePostLike]);

  // Initialize post likes from post data
  const initializePostLikes = useCallback((posts) => {
    const likesMap = {};
    posts.forEach(post => {
      likesMap[post.id] = {
        is_liked: post.is_liked || false,
        like_count: post.like_count || 0
      };
    });
    setPostLikes(prev => ({ ...prev, ...likesMap }));
    
    // Initialize analytics context with post data
    if (analytics?.initializePostStats) {
      analytics.initializePostStats(posts);
    }
  }, [analytics]);

  const value = {
    postLikes,
    updatePostLike,
    getPostLike,
    handleLike,
    initializePostLikes
  };

  return (
    <LikeContext.Provider value={value}>
      {children}
    </LikeContext.Provider>
  );
};
