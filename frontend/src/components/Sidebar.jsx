import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, PenTool, BookOpen, Heart, LogOut, BarChart3, Bell } from 'lucide-react';
import LogoutModal from './LogoutModal';
import Toast from './Toast';
import FollowingFeed from './FollowingFeed';

const Sidebar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [followingList, setFollowingList] = useState([]);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loading, setLoading] = useState(true);
  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

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



  // Handle write click with authentication check
  const handleWriteClick = () => {
    if (!user) {
      setToast({
        show: true,
        message: 'Please sign in to start writing',
        type: 'warning'
      });
      return;
    }
    if (onWriteClick) onWriteClick();
  };

  // Handle dashboard click with authentication check
  const handleDashboardClick = () => {
    if (!user) {
      setToast({
        show: true,
        message: 'Please sign in to access your dashboard',
        type: 'warning'
      });
      return;
    }
    if (onDashboardClick) onDashboardClick();
  };

  // Handle library click with authentication check
  const handleLibraryClickAuth = () => {
    if (!user) {
      setToast({
        show: true,
        message: 'Please sign in to access your library',
        type: 'warning'
      });
      return;
    }
    handleLibraryClick();
  };

  // Handle favorites click with authentication check
  const handleFavoritesClickAuth = () => {
    if (!user) {
      setToast({
        show: true,
        message: 'Please sign in to access your favorites',
        type: 'warning'
      });
      return;
    }
    handleFavoritesClick();
  };

  // Close toast notification
  const closeToast = () => {
    setToast({ show: false, message: '', type: 'info' });
  };
  return (
    <div className="hidden lg:flex flex-col w-56 bg-white border-r border-gray-200 h-screen sticky top-0">
      {/* Main Navigation Section */}
      <div className="flex-1 p-4 overflow-y-auto">
        <nav className="space-y-1">
          {/* Primary Navigation Links */}
          <div className="space-y-1">
            <Link to="/" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-purple-600 rounded-lg transition-colors duration-200">
              <Home className="w-5 h-5 mr-3" />
              <span className="font-medium">Home</span>
            </Link>
            <Link to="/write" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-purple-600 rounded-lg transition-colors duration-200">
              <PenTool className="w-5 h-5 mr-3" />
              <span className="font-medium">Write</span>
            </Link>
            <Link to="/dashboard" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-purple-600 rounded-lg transition-colors duration-200">
              <BarChart3 className="w-5 h-5 mr-3" />
              <span className="font-medium">Dashboard</span>
            </Link>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-4"></div>

          {/* Following Feed - Creative feed showing posts from followed users */}
          <FollowingFeed user={user} />

          {/* Divider */}
          <div className="border-t border-gray-200 my-4"></div>

          {/* Reading List - Show for all users with different content */}
          <div className="space-y-1">
            <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {user ? 'Reading' : 'Popular'}
            </h3>
            {user ? (
              // Logged in user - show library and favorites
              <>
                <button 
                  onClick={handleLibraryClickAuth}
                  className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-purple-600 rounded-lg transition-colors duration-200 w-full text-left"
                >
                  <BookOpen className="w-5 h-5 mr-3" />
                  <span className="font-medium">My Library</span>
                </button>
                <button 
                  onClick={handleFavoritesClickAuth}
                  className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-purple-600 rounded-lg transition-colors duration-200 w-full text-left"
                >
                  <Heart className="w-5 h-5 mr-3" />
                  <span className="font-medium">Favorites</span>
                </button>
              </>
            ) : (
              // Logged out user - show popular content suggestions
              <>
                <div className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-purple-600 rounded-lg transition-colors duration-200 cursor-pointer">
                  <BookOpen className="w-5 h-5 mr-3" />
                  <span className="font-medium">Trending Posts</span>
                </div>
                <div className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-purple-600 rounded-lg transition-colors duration-200 cursor-pointer">
                  <Heart className="w-5 h-5 mr-3" />
                  <span className="font-medium">Most Liked</span>
                </div>
              </>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-4"></div>

          {/* Notifications Section */}
          {user && (
            <div className="space-y-1">
              <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Activity
              </h3>
              <button className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-purple-600 rounded-lg transition-colors duration-200 w-full text-left relative">
                <Bell className="w-5 h-5 mr-3" />
                <span className="font-medium">Notifications</span>
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">3</span>
              </button>
              <button 
                onClick={handleLogoutClick}
                className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-red-600 rounded-lg transition-colors duration-200 w-full text-left"
              >
                <LogOut className="w-5 h-5 mr-3" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          )}
        </nav>
      </div>



      {/* Logout Confirmation Modal */}
      <LogoutModal 
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
      />



      {/* Toast Notification */}
      <Toast 
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={closeToast}
      />
    </div>
  );
};

export default Sidebar; 