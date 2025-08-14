import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLike } from '../contexts/LikeContext';
import Post from './Post';
import { 
  Loader2,
  ArrowLeft
} from 'lucide-react';

const RecommendationsPage = () => {
  const { user: authUser, token: authToken } = useAuth();
  const navigate = useNavigate();
  
  const [postRecommendations, setPostRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const { initializePostLikes } = useLike();

  // Handle back navigation
  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  // Check for user in both AuthContext and localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (authUser && authToken) {
      setUser(authUser);
      setToken(authToken);
    } else if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    } else {
      setUser(null);
      setToken(null);
    }
  }, [authUser, authToken]);

  // Listen for login events to update user state
  useEffect(() => {
    const handleUserLoggedIn = (event) => {
      setUser(event.detail.user);
      setToken(localStorage.getItem('token'));
    };

    window.addEventListener('userLoggedIn', handleUserLoggedIn);
    return () => window.removeEventListener('userLoggedIn', handleUserLoggedIn);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Use algorithmic recommendations endpoints
      const postResponse = await fetch('http://127.0.0.1:8000/api/posts/recommendations/posts/?limit=15', {
        headers: {
          'Authorization': token ? `Token ${token}` : undefined,
          'Content-Type': 'application/json',
        },
      });

      if (postResponse.ok) {
        const postData = await postResponse.json();
        setPostRecommendations(postData.slice(0, 15));
        // Initialize likes for the posts
        initializePostLikes(postData.slice(0, 15));
      } else {
        // Fallback to trending posts
        const fallbackResponse = await fetch('http://127.0.0.1:8000/api/posts/trending/?limit=15', {
          headers: {
            'Authorization': token ? `Token ${token}` : undefined,
            'Content-Type': 'application/json',
          },
        });
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          const posts = fallbackData.results || fallbackData;
          setPostRecommendations(posts.slice(0, 15));
          initializePostLikes(posts.slice(0, 15));
        }
      }
      
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setPostRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUser = async (userId) => {
    try {
      await handleFollow(userId);
      // Refresh recommendations after follow action
      setTimeout(fetchData, 1000);
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handlePostClick = (post) => {
    navigate(`/post/${post.id}`);
  };



  useEffect(() => {
    fetchData();
  }, [user, token]);

  // Refresh recommendations every 60 seconds
  useEffect(() => {
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [user, token]);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Discover Amazing Content</h2>
          <p className="text-gray-600 mb-6">
            Sign in to get personalized recommendations based on your interests.
          </p>
          <button 
            onClick={() => {
              // Dispatch event to open auth modal in parent component
              window.dispatchEvent(new CustomEvent('openAuthModal', { detail: { mode: 'login' } }));
            }} 
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors mx-auto"
          >
            Sign In to Get Started
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
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
        
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Recommended for You</h1>
          <p className="text-gray-600 dark:text-gray-400">Discover content tailored to your interests</p>
        </div>
      </div>

      {/* Post Recommendations */}
      {loading ? (
        <div className="space-y-6">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-700 h-32 rounded-lg mb-4"></div>
              <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded mb-2"></div>
              <div className="bg-gray-200 dark:bg-gray-700 h-3 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : postRecommendations.length > 0 ? (
        <div className="space-y-6">
          {postRecommendations.map((post) => (
            <Post
              key={post.id}
              post={post}
              onPostClick={handlePostClick}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Recommendations Yet</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Start liking and reading posts to get personalized recommendations!
          </p>
        </div>
      )}
    </div>
  );
};

export default RecommendationsPage;
