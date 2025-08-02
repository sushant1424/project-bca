import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';
import { AuthProvider } from '../context/AuthContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import CategoriesBar from './CategoriesBar';
import PostList from './PostList';
import PostDetail from './PostDetail';
import WritePage from './WritePage';
import Dashboard from './Dashboard';
import LibraryPage from './LibraryPage';
import FavoritesPage from './FavoritesPage';
import ProfilePage from './ProfilePage';
import ProfileSettings from './ProfileSettings';
import FollowingPage from './FollowingPage';

const AppRouter = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

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
      
      const response = await fetch(`http://127.0.0.1:8000/api/posts/search/?q=${encodeURIComponent(query)}`, {
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
    <ErrorBoundary>
      <AuthProvider>
        <Router>
        <Routes>
        {/* Home page with sidebar layout */}
        <Route path="/" element={
          <div className="min-h-screen bg-gray-50">
            <Navbar onSearch={handleSearch} />
            <div className="flex">
              <Sidebar />
              <main className="flex-1 w-full min-w-0">
                <CategoriesBar 
                  selectedCategory={selectedCategory}
                  onCategorySelect={handleCategorySelect}
                />
                <div className="max-w-4xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <PostList 
                      selectedCategory={selectedCategory}
                      searchQuery={searchQuery}
                      searchResults={searchResults}
                      isSearching={isSearching}
                    />
                  </div>
                </div>
              </main>
            </div>
          </div>
        } />
        
        {/* Individual post page with sidebar */}
        <Route path="/post/:id" element={
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="flex">
              <Sidebar />
              <main className="flex-1 w-full min-w-0">
                <PostDetail />
              </main>
            </div>
          </div>
        } />
        
        {/* Full-screen pages with navbar but no sidebar */}
        <Route path="/write" element={
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <WritePage />
          </div>
        } />
        <Route path="/dashboard" element={
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Dashboard />
          </div>
        } />
        <Route path="/library" element={
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="flex">
              <Sidebar />
              <main className="flex-1 w-full min-w-0">
                <LibraryPage />
              </main>
            </div>
          </div>
        } />
        <Route path="/favorites" element={
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="flex">
              <Sidebar />
              <main className="flex-1 w-full min-w-0">
                <FavoritesPage />
              </main>
            </div>
          </div>
        } />
        <Route path="/profile" element={
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="flex">
              <Sidebar />
              <main className="flex-1 w-full min-w-0">
                <ProfilePage />
              </main>
            </div>
          </div>
        } />
        <Route path="/profile/settings" element={
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="flex">
              <Sidebar />
              <main className="flex-1 w-full min-w-0">
                <ProfileSettings />
              </main>
            </div>
          </div>
        } />
        <Route path="/following" element={<FollowingPage />} />
        </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default AppRouter;
