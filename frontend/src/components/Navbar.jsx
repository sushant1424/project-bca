import React, { useState, useEffect } from 'react';
import { Menu, X, Search, User, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthModal from './AuthModal';
import LogoutModal from './LogoutModal';
import UserProfilePopover from './UserProfilePopover';
import NotificationDropdown from './NotificationDropdown';
import { Button } from './ui/button';

const Navbar = ({ onSearch, onToggleSidebar, sidebarCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State for mobile menu toggle
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // State for auth modal
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  
  // State for logout modal
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  // State for user data
  const [user, setUser] = useState(null);
  
  // State for search
  const [searchQuery, setSearchQuery] = useState('');

  // Check if user is logged in on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Listen for login events to update navbar without page reload
    const handleUserLoggedIn = (event) => {
      setUser(event.detail.user);
    };

    // Listen for auth modal open events from child components
    const handleOpenAuthModal = (event) => {
      setAuthMode(event.detail.mode || 'login');
      setShowAuthModal(true);
    };

    window.addEventListener('userLoggedIn', handleUserLoggedIn);
    window.addEventListener('openAuthModal', handleOpenAuthModal);

    return () => {
      window.removeEventListener('userLoggedIn', handleUserLoggedIn);
      window.removeEventListener('openAuthModal', handleOpenAuthModal);
    };
  }, []);

  // Hide navbar on dashboard and write page (after all hooks are declared)
  if (location.pathname === '/dashboard' || location.pathname === '/write') {
    return null;
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Handle auth button clicks
  const handleAuthClick = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  // Handle logout button click - show confirmation modal
  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  // Handle confirmed logout
  const handleConfirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setShowLogoutModal(false);
    window.location.reload();
  };

  // Handle modal close
  const handleModalClose = () => {
    setShowAuthModal(false);
    // Check if user logged in after modal closes
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  };

  // Handle mode change for login/signup redirection
  const handleModeChange = (newMode) => {
    setAuthMode(newMode);
  };

  // Handle search input change with debouncing
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Debounce search to avoid too many calls
    clearTimeout(window.navbarSearchTimeout);
    window.navbarSearchTimeout = setTimeout(() => {
      if (onSearch) {
        onSearch(query);
      }
    }, 300);
  };

  // Handle search submit (Enter key)
  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (onSearch) {
        onSearch(searchQuery);
      }
      // Navigate to home page if not already there
      if (window.location.pathname !== '/') {
        navigate('/');
      }
    }
  };

  return (
    <>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-0">
          <div className="flex justify-between items-center h-16">
            {/* Logo - Left side */}
            <div className="flex items-center flex-shrink-0">
              {/* Logo */}
              <button 
                onClick={() => navigate('/')}
                className="flex items-center text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer"
              >
                <img 
                  src="/favicon.svg" 
                  alt="Wrytera Logo" 
                  className="w-8 h-8 mr-2"
                />
                Wrytera
              </button>
            </div>

            {/* Search Bar - Center (hidden on Library, Admin, Following, Trending, and Recommendations pages) */}
            {location.pathname !== '/library' && location.pathname !== '/admin' && location.pathname !== '/following' && location.pathname !== '/trending' && location.pathname !== '/recommendations' && (
              <div className="hidden md:block flex-1 max-w-lg mx-8">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onKeyDown={handleSearchSubmit}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-all duration-200"
                  />
                </div>
              </div>
            )}

            {/* Action Buttons - Right side (hidden on mobile) */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                // User is logged in - show notifications and profile popover
                <>
                  <NotificationDropdown />
                  <UserProfilePopover user={user} onLogout={handleLogoutClick} />
                </>
              ) : (
                // User is not logged in - show auth buttons
                <>
                  <button 
                    onClick={() => handleAuthClick('login')}
                    className="px-4 py-2 text-gray-700 hover:text-purple-600 transition-colors duration-200 font-medium"
                  >
                    Sign in
                  </button>
                  <button 
                    onClick={() => handleAuthClick('signup')}
                    className="px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-all duration-200 font-medium"
                  >
                    Get started
                  </button>
                </>
              )}
            </div>

            {/* Mobile menu button and user profile (visible only on mobile) */}
            <div className="md:hidden flex items-center space-x-2">
              {user && (
                <div className="flex-shrink-0">
                  <UserProfilePopover user={user} onLogout={handleLogoutClick} />
                </div>
              )}
              <button
                onClick={toggleMenu}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors duration-200 flex-shrink-0"
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <div className="w-5 h-5 flex flex-col justify-center space-y-1">
                    <div className="w-full h-0.5 bg-gray-600 rounded-sm"></div>
                    <div className="w-full h-0.5 bg-gray-600 rounded-sm"></div>
                    <div className="w-full h-0.5 bg-gray-600 rounded-sm"></div>
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-100">
                {/* Mobile Search Bar */}
                <div className="px-3 py-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search"
                      className="block w-full px-4 py-2 border border-gray-300 rounded-full leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    />
                  </div>
                </div>
                
                {/* Mobile Navigation Links */}
                <button className="block px-3 py-2 text-gray-700 hover:text-purple-600 transition-colors duration-200 font-medium w-full text-left">
                  Profile
                </button>
                <button className="block px-3 py-2 text-gray-700 hover:text-purple-600 transition-colors duration-200 font-medium w-full text-left">
                  Settings
                </button>
                
                {/* Mobile Action Buttons */}
                <div className="pt-4 pb-3 border-t border-gray-100">
                  {user ? (
                    // Mobile user greeting and logout
                    <div className="space-y-2">
                      <div className="px-3 py-2 text-gray-700 font-medium">
                        Hello, {user.username}! 👋
                      </div>
                      <button 
                        onClick={handleLogoutClick}
                        className="w-full flex items-center px-3 py-2 text-gray-700 hover:text-red-600 transition-colors duration-200 font-medium"
                      >
                        <LogOut className="w-5 h-5 mr-2" />
                        Logout
                      </button>
                    </div>
                  ) : (
                    // Mobile auth buttons
                    <>
                      <button 
                        onClick={() => handleAuthClick('login')}
                        className="w-full flex items-center px-3 py-2 text-gray-700 hover:text-purple-600 transition-colors duration-200 font-medium"
                      >
                        <User className="w-5 h-5 mr-2" />
                        Sign in
                      </button>
                      <button 
                        onClick={() => handleAuthClick('signup')}
                        className="w-full mt-2 px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-all duration-200 font-medium"
                      >
                        Get started
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Authentication Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={handleModalClose}
        mode={authMode}
        onModeChange={handleModeChange}
      />

      {/* Logout Confirmation Modal */}
      <LogoutModal 
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
};

export default Navbar; 