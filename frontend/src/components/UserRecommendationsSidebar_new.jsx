import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { User, UserPlus, UserCheck } from 'lucide-react';
import API_CONFIG from '../config/api';

const UserRecommendationsSidebar = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  
  const [userRecommendations, setUserRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUserRecommendations = async () => {
    if (!user || !token) return;
    
    try {
      setLoading(true);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/posts/?page_size=15`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const users = [];
        const seenUsers = new Set();
        
        if (data.results) {
          data.results.forEach(post => {
            if (post.author && post.author.id !== user.id && !seenUsers.has(post.author.id)) {
              seenUsers.add(post.author.id);
              users.push({
                id: post.author.id,
                username: post.author.username,
                first_name: post.author.first_name,
                last_name: post.author.last_name
              });
            }
          });
        }
        
        setUserRecommendations(users.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching user recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRecommendations();
  }, [user, token]);

  if (!user) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <Users className="w-5 h-5 text-blue-500" />
          <span>People to Follow</span>
        </h3>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="bg-gray-200 h-3 rounded mb-1"></div>
                  <div className="bg-gray-200 h-2 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : userRecommendations.length > 0 ? (
        <div className="space-y-3">
          {userRecommendations.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md transition-colors">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-xs">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 text-xs">{user.username}</h4>
                  <p className="text-gray-600 text-xs">
                    {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : 'Active writer'}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="text-xs px-2 py-1 h-6"
                onClick={() => navigate(`/profile/${user.username}`)}
              >
                View
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4">
          <Users className="w-6 h-6 text-gray-300 mx-auto mb-2" />
          <p className="text-xs text-gray-600">
            No user recommendations yet. Start following users!
          </p>
        </div>
      )}
    </div>
  );
};

export default UserRecommendationsSidebar;
