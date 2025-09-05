import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API_CONFIG from '../config/api';

const FollowContext = createContext();

export const useFollow = () => {
  const context = useContext(FollowContext);
  if (!context) {
    throw new Error('useFollow must be used within a FollowProvider');
  }
  return context;
};

export const FollowProvider = ({ children }) => {
  const [followingUsers, setFollowingUsers] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Get auth token
  const getAuthToken = () => localStorage.getItem('token');

  // Fetch following list from backend
  const fetchFollowingList = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        setFollowingUsers(new Set());
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/api/posts/users/following/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const followingData = await response.json();
        const followingIds = followingData.map(user => user.id);
        setFollowingUsers(new Set(followingIds));
      } else {
        setFollowingUsers(new Set());
      }
    } catch (error) {
      console.error('Error fetching following list:', error);
      setFollowingUsers(new Set());
    } finally {
      setLoading(false);
    }
  };

  // Clear state when user logs out
  useEffect(() => {
    const handleUserLogout = () => {
      setFollowingUsers(new Set());
      setCurrentUserId(null);
      setLoading(false);
    };

    window.addEventListener('userLogout', handleUserLogout);
    return () => window.removeEventListener('userLogout', handleUserLogout);
  }, []);

  // Monitor user changes and clear state if user switches
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.id !== currentUserId) {
          // User changed, clear previous user's follow state
          setFollowingUsers(new Set());
          setCurrentUserId(user.id);
          setLoading(true);
          fetchFollowingList();
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        setFollowingUsers(new Set());
        setCurrentUserId(null);
        setLoading(false);
      }
    } else {
      // No user logged in
      if (currentUserId !== null) {
        setFollowingUsers(new Set());
        setCurrentUserId(null);
        setLoading(false);
      }
    }
  }, [currentUserId]);

  // Initialize following list on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUserId(user.id);
        fetchFollowingList();
      } catch (error) {
        console.error('Error parsing user data:', error);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  // Check if user is being followed
  const isFollowing = (userId) => {
    return followingUsers.has(userId);
  };

  // Handle follow/unfollow action
  const handleFollow = async (userId) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const wasFollowing = followingUsers.has(userId);
      
      // Optimistic update
      const newFollowingUsers = new Set(followingUsers);
      if (wasFollowing) {
        newFollowingUsers.delete(userId);
      } else {
        newFollowingUsers.add(userId);
      }
      setFollowingUsers(newFollowingUsers);

      // Call backend API
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/posts/users/${userId}/follow/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Update based on server response
        const serverFollowingUsers = new Set(followingUsers);
        if (data.following) {
          serverFollowingUsers.add(userId);
        } else {
          serverFollowingUsers.delete(userId);
        }
        setFollowingUsers(serverFollowingUsers);
        
        return {
          success: true,
          following: data.following,
          message: data.following ? 'User followed successfully!' : 'User unfollowed successfully!'
        };
      } else {
        // Revert optimistic update on error
        setFollowingUsers(followingUsers);
        throw new Error('Failed to update follow status');
      }
    } catch (error) {
      // Revert optimistic update on error
      setFollowingUsers(followingUsers);
      throw error;
    }
  };

  // Refresh following list (useful after login/logout)
  const refreshFollowingList = () => {
    fetchFollowingList();
  };

  const value = {
    followingUsers,
    loading,
    isFollowing,
    handleFollow,
    refreshFollowingList
  };

  return (
    <FollowContext.Provider value={value}>
      {children}
    </FollowContext.Provider>
  );
};
