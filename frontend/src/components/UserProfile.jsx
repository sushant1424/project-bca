import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Calendar, MapPin, Link as LinkIcon, Mail, MessageCircle, UserPlus, UserCheck, Edit } from 'lucide-react';
import API_CONFIG from '../config/api';
import { useAuth } from '../context/AuthContext';
import { useFollow } from '../contexts/FollowContext';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { 
  User, 
  MapPin, 
  Calendar, 
  Globe, 
  Twitter, 
  Linkedin,
  Mail,
  Users,
  FileText,
  Heart,
  MessageCircle,
  Eye,
  Settings,
  Camera,
  ArrowLeft
} from 'lucide-react';

const UserProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { followUser, unfollowUser, isFollowing } = useFollow();
  
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [followLoading, setFollowLoading] = useState(false);

  // Check if viewing own profile
  const isOwnProfile = !username || (currentUser && currentUser.username === username);

  useEffect(() => {
    if (isOwnProfile && currentUser) {
      // If viewing own profile, use current user data
      setUser({
        ...currentUser,
        followers_count: currentUser.followers_count || 0,
        following_count: currentUser.following_count || 0,
        posts_count: currentUser.posts_count || 0
      });
      setLoading(false);
    } else if (username) {
      // Fetch user data by username
      fetchUserProfile();
    }
  }, [username, currentUser, isOwnProfile]);

  useEffect(() => {
    if (user) {
      fetchUserPosts();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/posts/users/${username}/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setError('User not found');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      setPostsLoading(true);
      const token = localStorage.getItem('token');
      const userId = user.id;
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/posts/user/${userId}/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserPosts(data.results || data);
      } else {
        console.error('Failed to fetch user posts');
      }
    } catch (error) {
      console.error('Error fetching user posts:', error);
    } finally {
      setPostsLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUser || !user) return;
    
    try {
      setFollowLoading(true);
      if (isFollowing(user.id)) {
        await unfollowUser(user.id);
      } else {
        await followUser(user.id);
      }
    } catch (error) {
      console.error('Error handling follow:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handlePostClick = (postId) => {
    navigate(`/post/${postId}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const stripHtmlTags = (html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => navigate('/')} variant="outline">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-white">
      {/* Back Button */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Profile Section - Centered and Compact */}
      <div className="bg-white">
        <div className="flex justify-center">
          <div className="bg-gray-50 max-w-2xl w-full mx-4 rounded-lg border border-gray-200 p-8 mt-6">
            <div className="flex items-start justify-between">
              {/* Left side - User info */}
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  {user.get_full_name || user.first_name + ' ' + user.last_name || user.username}
                </h2>
                <p className="text-gray-600 mb-2">@{user.username}</p>
                
                {user.bio && (
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {user.bio}
                  </p>
                )}
                
                {/* Social Links */}
                {(user.website || user.twitter || user.linkedin) && (
                  <div className="flex items-center space-x-4 mb-4">
                    {user.website && (
                      <a
                        href={user.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-sm text-gray-600 hover:text-gray-900"
                      >
                        <Globe className="h-4 w-4 mr-1" />
                        website
                      </a>
                    )}
                    {user.twitter && (
                      <a
                        href={user.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-sm text-gray-600 hover:text-gray-900"
                      >
                        <Twitter className="h-4 w-4 mr-1" />
                        twitter
                      </a>
                    )}
                    {user.linkedin && (
                      <a
                        href={user.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-sm text-gray-600 hover:text-gray-900"
                      >
                        <Linkedin className="h-4 w-4 mr-1" />
                        linkedin
                      </a>
                    )}
                  </div>
                )}
                

                
                {/* Action Button */}
                {isOwnProfile ? (
                  <Button
                    variant="outline"
                    onClick={() => navigate('/profile/settings')}
                    className="px-6 py-2 text-sm"
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <Button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={`px-8 py-2 text-sm font-medium ${
                      isFollowing(user.id)
                        ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        : 'bg-orange-500 text-white hover:bg-orange-600'
                    }`}
                  >
                    {followLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    ) : isFollowing(user.id) ? (
                      'Following'
                    ) : (
                      'Follow'
                    )}
                  </Button>
                )}
              </div>
              
              {/* Right side - Profile picture */}
              <div className="ml-8">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100">
                  {user.avatar || user.profile_image_url ? (
                    <img
                      src={user.avatar || user.profile_image_url}
                      alt={user.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-600">
                      <span className="text-2xl font-medium">
                        {user.username?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="max-w-2xl mx-auto px-6 mt-8">
        <div className="bg-white">
          <div className="flex items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Posts ({userPosts.length})
            </h2>
          </div>

          {postsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading posts...</p>
            </div>
          ) : userPosts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-600">
                {isOwnProfile ? "You haven't published any posts yet." : `${user.username} hasn't published any posts yet.`}
              </p>
              {isOwnProfile && (
                <Button
                  onClick={() => navigate('/write')}
                  className="mt-4"
                >
                  Write your first post
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {userPosts.map((post) => (
                <Card
                  key={post.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handlePostClick(post.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-orange-600 transition-colors">
                          {post.title}
                        </h3>
                        
                        {post.excerpt && (
                          <p className="text-gray-600 mb-3 line-clamp-2">
                            {stripHtmlTags(post.excerpt)}
                          </p>
                        )}

                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{formatDate(post.created_at)}</span>
                          
                          {post.category && (
                            <Badge variant="secondary" className="text-xs">
                              {post.category.name}
                            </Badge>
                          )}
                          
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center">
                              <Heart className="h-4 w-4 mr-1" />
                              {post.like_count || 0}
                            </div>
                            <div className="flex items-center">
                              <MessageCircle className="h-4 w-4 mr-1" />
                              {post.comment_count || 0}
                            </div>
                            <div className="flex items-center">
                              <Eye className="h-4 w-4 mr-1" />
                              {post.view_count || 0}
                            </div>
                          </div>
                        </div>
                      </div>

                      {post.image && (
                        <div className="ml-6 flex-shrink-0">
                          <img
                            src={post.image}
                            alt={post.title}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
