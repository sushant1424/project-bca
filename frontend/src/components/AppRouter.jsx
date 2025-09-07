import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import API_CONFIG from '../config/api';
import ErrorBoundary from './ErrorBoundary';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import HomePage from './HomePage';
import PostDetail from './PostDetail';
import WritePage from './WritePage';
import Dashboard from './Dashboard';
import LibraryPage from './LibraryPage';
import FavoritesPage from './FavoritesPage';
import ProfilePage from './ProfilePage';
import ProfileSettings from './ProfileSettings';
import FollowingPage from './FollowingPage';
import UserProfileView from './UserProfileView';
import UserProfile from './UserProfile';
import AdminPanel from './AdminPanel';
import TrendingPage from './TrendingPage';
import NotificationsPage from './NotificationsPage';
import RecommendationsPage from './RecommendationsPage';
import { NotificationProvider } from '../contexts/NotificationContext';

const AppRouter = ({ sidebarCollapsed, onToggleSidebar }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);


  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    // Clear search when category changes
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
  };

  // Handle search from navbar
  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      const token = localStorage.getItem('token');
      
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Token ${token}`;
      }
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/posts/search/?q=${encodeURIComponent(query)}`, {
        headers: headers,
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      } else {
        console.error('Search failed:', response.status);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching posts:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Router>
      <ErrorBoundary>
        <AuthProvider>
          <NotificationProvider>
            {/* Mobile Sidebar Overlay */}
          {!sidebarCollapsed && (
            <div className="lg:hidden fixed inset-0 z-50">
              {/* Backdrop */}
              <div 
                className="absolute inset-0 bg-black bg-opacity-50" 
                onClick={onToggleSidebar}
              />
              {/* Sidebar */}
              <div className="absolute left-0 top-0 w-64 h-full bg-white shadow-2xl">
                {/* Header with close button */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                  <button
                    onClick={onToggleSidebar}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                    aria-label="Close menu"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {/* Sidebar content */}
                <div className="overflow-y-auto h-full pb-20">
                  <Sidebar onToggleSidebar={onToggleSidebar} />
                </div>
              </div>
            </div>
          )}
          
          <Routes>
            {/* Home page with sidebar layout */}
            <Route path="/" element={
              <div className="min-h-screen bg-white">
                <Navbar onSearch={handleSearch} onToggleSidebar={onToggleSidebar} sidebarCollapsed={sidebarCollapsed} />
                <div className="flex relative">
                  {/* Desktop Sidebar */}
                  <div className={`hidden lg:block ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
                    <Sidebar onToggleSidebar={onToggleSidebar} />
                  </div>
                  
                  <main className="flex-1 w-full min-w-0 bg-white lg:border-l border-gray-200">
                    <HomePage 
                      selectedCategory={selectedCategory}
                      onCategorySelect={handleCategorySelect}
                      searchQuery={searchQuery}
                      searchResults={searchResults}
                      isSearching={isSearching}
                    />
                  </main>
                </div>
              </div>
            } />
        
        {/* Individual post page - clean reading view without navbar but with sidebar */}
        <Route path="/post/:id" element={
          <div className="min-h-screen bg-white">
            <div className="flex relative">
              {/* Desktop Sidebar */}
              <div className={`hidden lg:block ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
                <Sidebar />
              </div>
              
              <main className="flex-1 w-full min-w-0 bg-white lg:border-l border-gray-200">
                <PostDetail />
              </main>
            </div>
          </div>
        } />
        
        {/* Full-screen pages with navbar but no sidebar */}
        <Route path="/write" element={
          <ProtectedRoute>
            <div className="min-h-screen bg-white">
              <Navbar onToggleSidebar={onToggleSidebar} sidebarCollapsed={sidebarCollapsed} />
              <WritePage />
            </div>
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/library" element={
          <div className="min-h-screen bg-white">
            <Navbar onToggleSidebar={onToggleSidebar} sidebarCollapsed={sidebarCollapsed} />
            <div className="flex relative">
              {/* Desktop Sidebar */}
              <div className={`hidden lg:block ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
                <Sidebar />
              </div>
              
              <main className="flex-1 w-full min-w-0 bg-white lg:border-l border-gray-200">
                <LibraryPage />
              </main>
            </div>
          </div>
        } />
        <Route path="/favorites" element={
          <div className="min-h-screen bg-white">
            <Navbar onToggleSidebar={onToggleSidebar} sidebarCollapsed={sidebarCollapsed} />
            <div className="flex relative">
              {/* Desktop Sidebar */}
              <div className={`hidden lg:block ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
                <Sidebar />
              </div>
              

              
              <main className="flex-1 w-full min-w-0 bg-white lg:border-l border-gray-200">
                <FavoritesPage />
              </main>
            </div>
          </div>
        } />
        <Route path="/profile" element={
          <div className="min-h-screen bg-white">
            <Navbar onToggleSidebar={onToggleSidebar} sidebarCollapsed={sidebarCollapsed} />
            <div className="flex relative">
              {/* Desktop Sidebar */}
              <div className={`hidden lg:block ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
                <Sidebar />
              </div>
              

              
              <main className="flex-1 w-full min-w-0 bg-white lg:border-l border-gray-200">
                <UserProfile />
              </main>
            </div>
          </div>
        } />
        <Route path="/profile/settings" element={
          <div className="min-h-screen bg-white">
            <Navbar onToggleSidebar={onToggleSidebar} sidebarCollapsed={sidebarCollapsed} />
            <div className="flex relative">
              {/* Desktop Sidebar */}
              <div className={`hidden lg:block ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
                <Sidebar />
              </div>
              
              <main className="flex-1 w-full min-w-0 bg-white lg:border-l border-gray-200">
                <ProfileSettings />
              </main>
            </div>
          </div>
        } />
        <Route path="/following" element={
          <div className="min-h-screen bg-white">
            <Navbar onToggleSidebar={onToggleSidebar} sidebarCollapsed={sidebarCollapsed} />
            <div className="flex relative">
              {/* Desktop Sidebar */}
              <div className={`hidden lg:block ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
                <Sidebar />
              </div>
              
              <main className="flex-1 w-full min-w-0 bg-white lg:border-l border-gray-200">
                <FollowingPage />
              </main>
            </div>
          </div>
        } />
        <Route path="/trending" element={
          <div className="min-h-screen bg-white">
            <Navbar onToggleSidebar={onToggleSidebar} sidebarCollapsed={sidebarCollapsed} />
            <div className="flex relative">
              {/* Desktop Sidebar */}
              <div className={`hidden lg:block ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
                <Sidebar />
              </div>
              
              <main className="flex-1 w-full min-w-0 bg-white lg:border-l border-gray-200">
                <TrendingPage />
              </main>
            </div>
          </div>
        } />
        <Route path="/notifications" element={
          <div className="min-h-screen bg-white">
            <Navbar onToggleSidebar={onToggleSidebar} sidebarCollapsed={sidebarCollapsed} />
            <div className="flex relative">
              {/* Desktop Sidebar */}
              <div className={`hidden lg:block ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
                <Sidebar />
              </div>
              
              <main className="flex-1 w-full min-w-0 bg-white lg:border-l border-gray-200">
                <NotificationsPage />
              </main>
            </div>
          </div>
        } />
        <Route path="/recommendations" element={
          <div className="min-h-screen bg-white">
            <Navbar onToggleSidebar={onToggleSidebar} sidebarCollapsed={sidebarCollapsed} />
            <div className="flex relative">
              {/* Desktop Sidebar */}
              <div className={`hidden lg:block ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
                <Sidebar />
              </div>
              
              <main className="flex-1 w-full min-w-0 bg-white lg:border-l border-gray-200">
                <RecommendationsPage />
              </main>
            </div>
          </div>
        } />
        <Route path="/post/:id" element={
          <div className="min-h-screen bg-white">
            <div className="flex relative">
              <main className="flex-1 w-full min-w-0 bg-white">
                <PostDetail />
              </main>
            </div>
          </div>
        } />
        <Route path="/user/:userId" element={<UserProfileView />} />
        <Route path="/profile/:username" element={<UserProfile />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
      </NotificationProvider>
    </AuthProvider>
  </ErrorBoundary>
</Router>
);
};

export default AppRouter;
