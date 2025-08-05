import React, { useState, useEffect } from 'react';
import { ArrowLeft, Globe, Users, FileText, Calendar } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { ToastContainer } from './ToastNotification';
import useToast from '../hooks/useToast';
import { useNavigate } from 'react-router-dom';

const SubstackProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({ posts: 0, followers: 0, following: 0 });
  const [loading, setLoading] = useState(true);
  const { toasts, showSuccess, showError, removeToast } = useToast();

  useEffect(() => {
    fetchUserData();
    fetchUserPosts();
  }, []);

  const fetchUserData = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setStats({
        posts: userData.posts_count || 0,
        followers: userData.followers_count || 0,
        following: userData.following_count || 0
      });
    }
    setLoading(false);
  };

  const fetchUserPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://127.0.0.1:8000/api/posts/users/posts/', {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-medium text-gray-900 mb-4">Please log in to view your profile</h2>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </div>

      {/* Profile Section - Substack Style */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Profile Header */}
        <div className="text-center mb-12">
          <Avatar className="w-24 h-24 mx-auto mb-6">
            <AvatarImage src={user.avatar} alt={user.username} />
            <AvatarFallback className="bg-gray-100 text-gray-600 text-2xl font-medium">
              {user.username?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            {user.first_name && user.last_name 
              ? `${user.first_name} ${user.last_name}` 
              : user.username}
          </h1>
          
          <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto leading-relaxed">
            {user.bio || "Writer, thinker, and creator sharing thoughts on life, technology, and everything in between."}
          </p>

          {/* Stats - Substack Style */}
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-600 mb-8">
            <div className="flex items-center space-x-1">
              <FileText className="w-4 h-4" />
              <span className="font-medium">{posts.length}</span>
              <span>posts</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span className="font-medium">{stats.followers}</span>
              <span>subscribers</span>
            </div>
            {user.website && (
              <div className="flex items-center space-x-1">
                <Globe className="w-4 h-4" />
                <a 
                  href={user.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Website
                </a>
              </div>
            )}
          </div>

          <Button 
            onClick={() => navigate('/write')}
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-2 rounded-full"
          >
            Write a post
          </Button>
        </div>

        {/* Posts Section - Substack Style */}
        <div className="border-t border-gray-100 pt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Recent posts</h2>
          
          {posts.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-600 mb-6">Start writing to share your thoughts with the world.</p>
              <Button 
                onClick={() => navigate('/write')}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                Write your first post
              </Button>
            </div>
          ) : (
            <div className="space-y-12">
              {posts.map((post) => (
                <article 
                  key={post.id} 
                  className="cursor-pointer group"
                  onClick={() => navigate(`/post/${post.id}`)}
                >
                  <div className="border-b border-gray-100 pb-12">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors leading-tight">
                      {post.title}
                    </h3>
                    
                    <p className="text-gray-700 text-lg leading-relaxed mb-4 line-clamp-3">
                      {post.content.substring(0, 200)}...
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(post.created_at)}</span>
                        </div>
                        <span>•</span>
                        <span>{post.views || 0} views</span>
                        <span>•</span>
                        <span>{post.like_count} likes</span>
                        <span>•</span>
                        <span>{post.comment_count} comments</span>
                      </div>
                      
                      {!post.is_published && (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                          Draft
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
};

export default SubstackProfilePage;
