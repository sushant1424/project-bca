import React, { useState, useEffect } from 'react';
import { User, UserPlus, UserCheck } from 'lucide-react';
import API_CONFIG from '../config/api';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { useAuth } from '../context/AuthContext';
import { useFollow } from '../contexts/FollowContext';

const UserRecommendationsSidebar = () => {
  const [recommendedUsers, setRecommendedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { handleFollow, isFollowing, followingUsers } = useFollow();

  useEffect(() => {
    fetchRecommendedUsers();
  }, [user, followingUsers]);

  // Refresh recommendations every 45 seconds
  useEffect(() => {
    const interval = setInterval(fetchRecommendedUsers, 45000);
    return () => clearInterval(interval);
  }, [user, followingUsers]);

  const fetchRecommendedUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Use algorithmic user recommendations endpoint
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/posts/recommendations/users/?limit=5`, {
        headers: {
          'Authorization': token ? `Token ${token}` : undefined,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Algorithmic recommendations are already filtered
        setRecommendedUsers(data.slice(0, 5));
      } else {
        // Fallback: fetch all users and filter
        const allUsersResponse = await fetch(`${API_CONFIG.BASE_URL}/api/posts/users/`, {
          headers: {
            'Authorization': token ? `Token ${token}` : undefined,
            'Content-Type': 'application/json'
          }
        });
        
        if (allUsersResponse.ok) {
          const allUsers = await allUsersResponse.json();
          const users = allUsers.results || allUsers;
          
          // Filter out current user and already followed users
          const filteredUsers = users.filter(recommendedUser => {
            if (!user) return true; // Show all if not logged in
            return recommendedUser.id !== user.id && !isFollowing(recommendedUser.id);
          });
          
          setRecommendedUsers(filteredUsers.slice(0, 5));
        }
      }
    } catch (error) {
      console.error('Error fetching recommended users:', error);
      setRecommendedUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUser = async (userId) => {
    try {
      await handleFollow(userId);
      // Refresh recommendations after follow action
      setTimeout(fetchRecommendedUsers, 1000);
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  if (!user) return null;

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Recommended Writers</h3>
      
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mt-1"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {recommendedUsers.map(recommendedUser => (
            <div key={recommendedUser.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage 
                    src={recommendedUser.avatar || recommendedUser.profile_image || recommendedUser.profile_image_url} 
                    alt={recommendedUser.username} 
                  />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold text-sm">
                    {recommendedUser.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{recommendedUser.username}</p>
                  <p className="text-xs text-gray-500">{recommendedUser.posts_count} posts</p>
                </div>
              </div>
                            <Button
                  size="sm"
                  variant={isFollowing(recommendedUser.id) ? "outline" : "default"}
                  onClick={() => handleFollowUser(recommendedUser.id)}
                  className="text-xs px-3 py-1"
                >
                  {isFollowing(recommendedUser.id) ? 'Following' : 'Follow'}
                </Button>
            </div>
          ))}
          
          {recommendedUsers.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-4">
              No recommendations available
            </p>
          )}
        </div>
      )}
    </Card>
  );
};

export default UserRecommendationsSidebar;
