import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { User, Calendar, MapPin, Link as LinkIcon, Mail } from 'lucide-react';
import API_CONFIG from '../config/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import Post from './Post';

const UserProfileView = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Token ${token}`;
      }

      // Fetch user profile
      const userResponse = await fetch(`${API_CONFIG.BASE_URL}/api/auth/users/${userId}/`, {
        headers,
      });

      if (!userResponse.ok) {
        throw new Error('User not found');
      }

      const userData = await userResponse.json();
      setUser(userData);

      // Fetch user's posts
      const postsResponse = await fetch(`${API_CONFIG.BASE_URL}/api/posts/user/${userId}/`, {
        headers,
      });

      if (postsResponse.ok) {
        const postsData = await postsResponse.json();
        setPosts(postsData.results || postsData);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePostClick = (postId) => {
    navigate(`/post/${postId}`);
  };

  const handleLike = async (postId) => {
    // Handle like functionality
    console.log('Like post:', postId);
  };

  const handleFollow = async (userId) => {
    // Handle follow functionality
    console.log('Follow user:', userId);
  };

  const handleComment = async (postId, comment) => {
    // Handle comment functionality
    console.log('Comment on post:', postId, comment);
  };

  const handleSave = async (postId) => {
    // Handle save functionality
    console.log('Save post:', postId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-red-600">Error: {error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* User Profile Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user?.avatar} alt={user?.username} />
                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-2xl">
                  {user?.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {user?.username}
                </h1>
                
                {user?.email && (
                  <p className="text-gray-600 mb-3">{user.email}</p>
                )}
                
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    <span>{posts.length} posts</span>
                  </div>
                  
                  {user?.date_joined && (
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>Joined {new Date(user.date_joined).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                
                {user?.bio && (
                  <p className="text-gray-700 mb-4">{user.bio}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User's Posts */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Posts by {user?.username}
          </h2>
          
          {posts.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                No posts yet.
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <Post
                key={post.id}
                post={post}
                onLike={handleLike}
                onFollow={handleFollow}
                onComment={handleComment}
                onSave={handleSave}
                onPostClick={() => handlePostClick(post.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileView;
