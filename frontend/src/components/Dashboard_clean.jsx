import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { 
  X, Home, FileText, BarChart3, Users, Settings, 
  TrendingUp, Eye, Heart, BookOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UnauthorizedAlert from './UnauthorizedAlert';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUnauthorized, setShowUnauthorized] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      setShowUnauthorized(true);
      return;
    }
    
    setUser(JSON.parse(userData));
    setLoading(false);
  }, []);

  const handleBackToHome = () => {
    navigate('/');
  };

  if (showUnauthorized) {
    return <UnauthorizedAlert />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4 w-48"></div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const sidebarItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'posts', label: 'My Posts', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'audience', label: 'Audience', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-2">
                Welcome back, {user?.first_name || user?.username}!
              </h2>
              <p className="opacity-90">Here's what's happening with your content today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <CardContent className="flex items-center justify-between p-0">
                  <div>
                    <p className="text-sm text-gray-600">Total Posts</p>
                    <p className="text-2xl font-bold">{user?.posts_count || 0}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-500" />
                </CardContent>
              </Card>
              <Card className="p-4">
                <CardContent className="flex items-center justify-between p-0">
                  <div>
                    <p className="text-sm text-gray-600">Followers</p>
                    <p className="text-2xl font-bold">{user?.followers_count || 0}</p>
                  </div>
                  <Users className="h-8 w-8 text-green-500" />
                </CardContent>
              </Card>
              <Card className="p-4">
                <CardContent className="flex items-center justify-between p-0">
                  <div>
                    <p className="text-sm text-gray-600">Following</p>
                    <p className="text-2xl font-bold">{user?.following_count || 0}</p>
                  </div>
                  <Heart className="h-8 w-8 text-red-500" />
                </CardContent>
              </Card>
              <Card className="p-4">
                <CardContent className="flex items-center justify-between p-0">
                  <div>
                    <p className="text-sm text-gray-600">This Month</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/write')}>
                <CardContent className="flex items-center gap-4 p-0">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Write New Post</h3>
                    <p className="text-sm text-gray-600">Share your thoughts with the world</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveSection('analytics')}>
                <CardContent className="flex items-center gap-4 p-0">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">View Analytics</h3>
                    <p className="text-sm text-gray-600">Track your content performance</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'posts':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">My Posts</h2>
              <Button onClick={() => navigate('/write')} className="bg-blue-600 hover:bg-blue-700">
                <FileText className="h-4 w-4 mr-2" />
                New Post
              </Button>
            </div>
            <Card className="p-8 text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
              <p className="text-gray-600 mb-4">Start creating content to see your posts here</p>
              <Button onClick={() => navigate('/write')} className="bg-blue-600 hover:bg-blue-700">
                Write Your First Post
              </Button>
            </Card>
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <CardContent className="p-0">
                  <div className="flex items-center gap-2 mb-4">
                    <Eye className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold">Total Views</h3>
                  </div>
                  <p className="text-3xl font-bold mb-2">0</p>
                  <p className="text-sm text-gray-600">No data available yet</p>
                </CardContent>
              </Card>
              <Card className="p-6">
                <CardContent className="p-0">
                  <div className="flex items-center gap-2 mb-4">
                    <Heart className="h-5 w-5 text-red-600" />
                    <h3 className="font-semibold">Total Likes</h3>
                  </div>
                  <p className="text-3xl font-bold mb-2">0</p>
                  <p className="text-sm text-gray-600">No data available yet</p>
                </CardContent>
              </Card>
            </div>
            <Card className="p-6">
              <CardContent className="p-0">
                <h3 className="font-semibold mb-4">Performance Overview</h3>
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Analytics will appear here once you start creating content</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'audience':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Audience</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <CardContent className="p-0">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold">Followers</h3>
                  </div>
                  <p className="text-3xl font-bold mb-2">{user?.followers_count || 0}</p>
                  <p className="text-sm text-gray-600">People following your content</p>
                </CardContent>
              </Card>
              <Card className="p-6">
                <CardContent className="p-0">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <h3 className="font-semibold">Growth</h3>
                  </div>
                  <p className="text-3xl font-bold mb-2">+0</p>
                  <p className="text-sm text-gray-600">New followers this month</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Dashboard Settings</h2>
            <Card className="p-6">
              <CardContent className="p-0">
                <h3 className="font-semibold mb-4">Account Actions</h3>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    onClick={() => navigate('/profile')}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    onClick={() => navigate('/library')}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    My Library
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    onClick={handleBackToHome}
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Back to Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Dashboard Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">Dashboard</h1>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBackToHome}
              className="p-2 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600">Welcome, {user?.first_name || user?.username}</p>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeSection === item.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard;
