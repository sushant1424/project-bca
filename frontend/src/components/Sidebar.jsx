import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, PenTool, BookOpen, Users, Bell, TrendingUp, ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';
import LogoutModal from './LogoutModal';
import { useToast } from '../context/ToastContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import SidebarToggle from './SidebarToggle';

const Sidebar = ({ isCollapsed, onToggle, onToggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [followingList, setFollowingList] = useState([]);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loading, setLoading] = useState(true);
  // Use ToastContext for notifications
  const { showWarning } = useToast();

  // Check if user is logged in and fetch following list
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      fetchFollowingList();
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch following list from API
  const fetchFollowingList = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://127.0.0.1:8000/api/posts/users/following/', {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFollowingList(data);
      }
    } catch (error) {
      console.error('Error fetching following list:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle logout confirmation
  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setShowLogoutModal(false);
    window.location.reload();
  };

  // Handle library click
  const handleLibraryClick = () => {
    navigate('/library');
  };

  // Handle favorites click
  const handleFavoritesClick = () => {
    navigate('/favorites');
  };



  // Handle write click - let ProtectedRoute handle authentication
  const handleWriteClick = () => {
    if (onWriteClick) onWriteClick();
  };

  // Handle dashboard click - let ProtectedRoute handle authentication
  const handleDashboardClick = () => {
    if (onDashboardClick) onDashboardClick();
  };

  // Handle library click with authentication check
  const handleLibraryClickAuth = () => {
    if (!user) {
      showWarning('Please sign in to access your library', 'You need to be logged in to access this page.');
      return;
    }
    // Close mobile sidebar when navigating
    if (onToggleSidebar) {
      onToggleSidebar();
    }
    handleLibraryClick();
  };

  // Handle favorites click with authentication check
  const handleFavoritesClickAuth = () => {
    if (!user) {
      showWarning('Please sign in to access your favorites', 'You need to be logged in to access this page.');
      return;
    }
    handleFavoritesClick();
  };

  // Show sidebar toggle on specific pages
  const showToggle = ['/following', '/library', '/notifications', '/trending'].includes(location.pathname) || location.pathname.startsWith('/post/');

  return (
    <div className={`bg-white border-r border-gray-200 h-screen flex flex-col transition-all duration-300 sticky top-0 relative ${
      isCollapsed ? 'w-0 overflow-hidden' : 'w-64'
    }`}>
      {/* Sidebar Toggle Button */}
      {showToggle && (
        <SidebarToggle 
          isCollapsed={isCollapsed} 
          onToggle={onToggle}
        />
      )}
        {/* Navigation */}
        <div className="flex-1 p-4 overflow-y-auto">
        <nav className="space-y-1">
          {/* Primary Navigation Links */}
          <div className="space-y-1">
            <Link to="/" onClick={() => onToggleSidebar && onToggleSidebar()} className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-purple-600 rounded-lg transition-colors duration-200">
              <Home className="w-5 h-5 mr-3" />
              <span className="font-medium">Home</span>
            </Link>
            {user ? (
              <Link to="/write" onClick={() => onToggleSidebar && onToggleSidebar()} className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-purple-600 rounded-lg transition-colors duration-200">
                <PenTool className="w-5 h-5 mr-3" />
                <span className="font-medium">Write</span>
              </Link>
            ) : (
              <button onClick={() => {
                showWarning('Please sign in to start writing', 'You need to be logged in to access this page.');
              }} className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-purple-600 rounded-lg transition-colors duration-200 w-full text-left">
                <PenTool className="w-5 h-5 mr-3" />
                <span className="font-medium">Write</span>
              </button>
            )}
            {user ? (
              <Link to="/dashboard" onClick={() => onToggleSidebar && onToggleSidebar()} className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-purple-600 rounded-lg transition-colors duration-200">
                <BarChart3 className="w-5 h-5 mr-3" />
                <span className="font-medium">Dashboard</span>
              </Link>
            ) : (
              <button onClick={() => {
                showWarning('Please sign in to access your dashboard', 'You need to be logged in to access this page.');
              }} className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-purple-600 rounded-lg transition-colors duration-200 w-full text-left">
                <BarChart3 className="w-5 h-5 mr-3" />
                <span className="font-medium">Dashboard</span>
              </button>
            )}
          </div>

          {/* User-specific sections - only show if user is logged in */}
          {user && (
            <>
              {/* Divider */}
              <div className="border-t border-gray-200 my-4"></div>

              {/* Following - Simple link */}
              <Link to="/following" onClick={() => onToggleSidebar && onToggleSidebar()} className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-blue-600 rounded-lg transition-colors duration-200">
                <Users className="w-5 h-5 mr-3" />
                <span className="font-medium">Following</span>
              </Link>

              {/* My Library - Simple and clean */}
              <button 
                onClick={handleLibraryClickAuth}
                className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-blue-600 rounded-lg transition-colors duration-200 w-full text-left"
              >
                <BookOpen className="w-5 h-5 mr-3" />
                <span className="font-medium">My Library</span>
              </button>

              {/* Notifications */}
              <Link to="/notifications" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-blue-600 rounded-lg transition-colors duration-200 relative">
                <Bell className="w-5 h-5 mr-3" />
                <span className="font-medium">Notifications</span>
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">3</span>
              </Link>
            </>
          )}

          {/* Divider before Trending (always show) */}
          <div className="border-t border-gray-200 my-4"></div>

          {/* Trending Posts */}
          <Link to="/trending" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-blue-600 rounded-lg transition-colors duration-200">
            <TrendingUp className="w-5 h-5 mr-3" />
            <span className="font-medium">Trending</span>
          </Link>

        </nav>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutModal 
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
      />
    </div>
  );
};

export default Sidebar; 