import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFollow } from '../contexts/FollowContext';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Sparkles, TrendingUp, RefreshCw, ChevronRight } from 'lucide-react';

const RecommendationsSection = () => {
  const { user, token } = useAuth();
  const { followingUsers } = useFollow();
  const navigate = useNavigate();
  
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      
      // Use algorithmic recommendations endpoint
      const response = await fetch('http://127.0.0.1:8000/api/posts/recommendations/posts/?limit=4', {
        headers: {
          'Authorization': token ? `Token ${token}` : undefined,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Fallback to trending posts if recommendations fail
        const fallbackResponse = await fetch('http://127.0.0.1:8000/api/posts/trending/?limit=4', {
          headers: {
            'Authorization': token ? `Token ${token}` : undefined,
            'Content-Type': 'application/json',
          },
        });
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          const posts = fallbackData.results || fallbackData;
          
          // Filter out posts from users we're already following
          const filteredPosts = posts.filter(post => {
            if (!user) return true; // Show all if not logged in
            return !followingUsers.has(post.author?.id);
          });
          
          setRecommendations(filteredPosts.slice(0, 4));
        }
        return;
      }

      const data = await response.json();
      // Algorithmic recommendations are already filtered
      setRecommendations(data.slice(0, 4));
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [user, token, followingUsers]);

  // Refresh recommendations every 30 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(fetchRecommendations, 30000);
    return () => clearInterval(interval);
  }, [user, token, followingUsers]);

  const handleViewAll = () => {
    navigate('/recommendations');
  };

  if (!user) return null; // Don't show recommendations to non-logged-in users

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-orange-500" />
          <span>Recommended for You</span>
        </h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/recommendations')}
          className="text-orange-600 hover:text-orange-700 text-xs"
        >
          View All
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-20">
          <RefreshCw className="h-5 w-5 animate-spin text-orange-500" />
        </div>
      ) : recommendations.length > 0 ? (
        <div className="space-y-3">
          {recommendations.slice(0, 3).map((post) => (
            <div key={post.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow bg-white">
              <h4 className="font-medium text-gray-900 mb-1 line-clamp-1 cursor-pointer hover:text-orange-500"
                  onClick={() => navigate(`/post/${post.id}`)}>
                {post.title}
              </h4>
              <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                {post.excerpt || post.content?.substring(0, 100) + '...' || 'No excerpt available'}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                  {post.author?.username || post.author_name || 'Unknown'}
                </span>
                <span className="text-gray-400">
                  {post.created_at ? new Date(post.created_at).toLocaleDateString() : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500">
          <p className="text-sm">No recommendations available.</p>
        </div>
      )}
    </div>
  );
};

export default RecommendationsSection;
