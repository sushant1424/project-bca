import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, PenTool, BarChart3, Users, BookOpen, Sparkles, TrendingUp, Menu, Plus } from 'lucide-react';
import LogoutModal from './LogoutModal';
import { useToast } from '../context/ToastContext';

const Sidebar = ({ isCollapsed, onToggle, onToggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { showWarning } = useToast();

  // Check if user is logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setShowLogoutModal(false);
    navigate('/');
  };

  // Navigation items with icons and tooltips
  const navigationItems = [
    { icon: Home, label: 'Home', path: '/', requiresAuth: false },
    { icon: BarChart3, label: 'Dashboard', path: '/dashboard', requiresAuth: true },
    { icon: Users, label: 'Following', path: '/following', requiresAuth: false },
    { icon: BookOpen, label: 'My Library', path: '/library', requiresAuth: true },
    { icon: Sparkles, label: 'Recommendations', path: '/recommendations', requiresAuth: false },
    { icon: TrendingUp, label: 'Trending', path: '/trending', requiresAuth: false },
  ];

  const handleNavClick = (item) => {
    if (item.requiresAuth && !user) {
      showWarning(`Please sign in to access ${item.label}`, 'You need to be logged in to access this page.');
      return;
    }
    navigate(item.path);
  };

  return (
    <div className="fixed left-0 top-0 h-screen bg-gray-900 flex flex-col items-center py-4 z-50" style={{ width: '60px' }}>
      {/* Hamburger Menu Toggle */}
      <div className="relative group mb-6">
        <button 
          className="p-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          title="Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        {/* Tooltip */}
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
          Menu
        </div>
      </div>

      {/* Navigation Icons */}
      <nav className="flex flex-col space-y-2 flex-1">
        {navigationItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <div key={item.path} className="relative group">
              <button
                onClick={() => handleNavClick(item)}
                className={`p-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-orange-500 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <IconComponent className="w-5 h-5" />
              </button>
              
              {/* Tooltip */}
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                {item.label}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Write Button (Plus Icon) */}
      <div className="relative group">
        <button
          onClick={() => handleNavClick({ icon: Plus, label: 'Write', path: '/write', requiresAuth: true })}
          className="p-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
        
        {/* Tooltip */}
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
          Write
        </div>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <LogoutModal 
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}
    </div>
  );
};

export default Sidebar;
