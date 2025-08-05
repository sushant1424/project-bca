import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AnalyticsContext = createContext();

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

export const AnalyticsProvider = ({ children }) => {
  const [postStats, setPostStats] = useState({});
  const [userStats, setUserStats] = useState({
    totalPosts: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    avgLikes: 0,
    avgComments: 0,
    avgViews: 0,
    followers: 0,
    following: 0
  });

  // Update individual post stats
  const updatePostStats = useCallback((postId, stats) => {
    setPostStats(prev => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        ...stats
      }
    }));
  }, []);

  // Get stats for a specific post
  const getPostStats = useCallback((postId, defaultStats = {}) => {
    return postStats[postId] || {
      views: defaultStats.views || 0,
      like_count: defaultStats.like_count || 0,
      comment_count: defaultStats.comment_count || 0,
      is_liked: defaultStats.is_liked || false,
      ...defaultStats
    };
  }, [postStats]);

  // Calculate aggregated user stats
  const calculateUserStats = useCallback((posts) => {
    const totalPosts = posts.length;
    const totalViews = posts.reduce((sum, post) => sum + (post.views || 0), 0);
    const totalLikes = posts.reduce((sum, post) => sum + (post.like_count || 0), 0);
    const totalComments = posts.reduce((sum, post) => sum + (post.comment_count || 0), 0);
    
    const avgLikes = totalPosts > 0 ? Math.round(totalLikes / totalPosts * 10) / 10 : 0;
    const avgComments = totalPosts > 0 ? Math.round(totalComments / totalPosts * 10) / 10 : 0;
    const avgViews = totalPosts > 0 ? Math.round(totalViews / totalPosts * 10) / 10 : 0;

    setUserStats(prev => ({
      ...prev,
      totalPosts,
      totalViews,
      totalLikes,
      totalComments,
      avgLikes,
      avgComments,
      avgViews
    }));
  }, []);

  // Initialize post stats from post data
  const initializePostStats = useCallback((posts) => {
    const statsMap = {};
    posts.forEach(post => {
      statsMap[post.id] = {
        // Use accurate view_count from backend, fallback to views field, default to 0
        views: post.view_count ?? post.views ?? 0,
        like_count: post.like_count || 0,
        comment_count: post.comment_count || 0,
        is_liked: post.is_liked || false,
        is_saved: post.is_saved || false
      };
    });
    setPostStats(prev => ({ ...prev, ...statsMap }));
    
    // Calculate user stats
    calculateUserStats(Object.values(statsMap));
  }, [calculateUserStats]);

  // Update user stats (followers, following, etc.)
  const updateUserStats = useCallback((stats) => {
    setUserStats(prev => ({
      ...prev,
      ...stats
    }));
  }, []);

  // Handle view increment
  const incrementViews = useCallback(async (postId) => {
    // Optimistic update
    const currentStats = getPostStats(postId);
    updatePostStats(postId, {
      ...currentStats,
      views: currentStats.views + 1
    });

    // Update user stats
    setUserStats(prev => ({
      ...prev,
      totalViews: prev.totalViews + 1,
      avgViews: prev.totalPosts > 0 ? Math.round((prev.totalViews + 1) / prev.totalPosts * 10) / 10 : 0
    }));

    // Note: The backend already handles view increment when fetching post details
    // This is just for optimistic UI updates
  }, [getPostStats, updatePostStats]);

  // Handle like updates (integrates with LikeContext)
  const updateLike = useCallback((postId, isLiked, likeCount) => {
    const currentStats = getPostStats(postId);
    const oldLikeCount = currentStats.like_count;
    
    updatePostStats(postId, {
      ...currentStats,
      is_liked: isLiked,
      like_count: likeCount
    });

    // Update user stats
    const likeDiff = likeCount - oldLikeCount;
    setUserStats(prev => {
      const newTotalLikes = prev.totalLikes + likeDiff;
      return {
        ...prev,
        totalLikes: newTotalLikes,
        avgLikes: prev.totalPosts > 0 ? Math.round(newTotalLikes / prev.totalPosts * 10) / 10 : 0
      };
    });
  }, [getPostStats, updatePostStats]);

  // Handle comment updates
  const updateComments = useCallback((postId, commentCount) => {
    const currentStats = getPostStats(postId);
    const oldCommentCount = currentStats.comment_count;
    
    updatePostStats(postId, {
      ...currentStats,
      comment_count: commentCount
    });

    // Update user stats
    const commentDiff = commentCount - oldCommentCount;
    setUserStats(prev => {
      const newTotalComments = prev.totalComments + commentDiff;
      return {
        ...prev,
        totalComments: newTotalComments,
        avgComments: prev.totalPosts > 0 ? Math.round(newTotalComments / prev.totalPosts * 10) / 10 : 0
      };
    });
  }, [getPostStats, updatePostStats]);

  // Fetch fresh analytics data
  const refreshAnalytics = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Fetch following count from backend API
      let followingCount = 0;
      try {
        const followingResponse = await fetch('http://127.0.0.1:8000/api/posts/users/following/', {
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

      // Fetch user stats
      const statsResponse = await fetch('http://127.0.0.1:8000/api/posts/users/stats/', {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        updateUserStats({
          followers: statsData.followers || 0,
          following: followingCount, // Use actual following count from API
        });
      } else {
        // If stats API fails, still update following count
        updateUserStats({
          following: followingCount,
        });
      }

      // Fetch user posts for detailed stats
      const postsResponse = await fetch('http://127.0.0.1:8000/api/posts/users/posts/', {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (postsResponse.ok) {
        const postsData = await postsResponse.json();
        initializePostStats(postsData);
      }
    } catch (error) {
      console.error('Error refreshing analytics:', error);
    }
  }, [initializePostStats, updateUserStats]);

  const value = {
    postStats,
    userStats,
    updatePostStats,
    getPostStats,
    initializePostStats,
    updateUserStats,
    incrementViews,
    updateLike,
    updateComments,
    refreshAnalytics,
    calculateUserStats
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};
