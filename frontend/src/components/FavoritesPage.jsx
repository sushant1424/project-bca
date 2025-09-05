import React, { useState, useEffect } from 'react';
import API_CONFIG from '../config/api';
import { useNavigate } from 'react-router-dom';
import { Heart, Search, User, Menu, ArrowLeft } from 'lucide-react';
import Post from './Post';
import { ToastContainer } from './ToastNotification';
import useToast from '../hooks/useToast';

const FavoritesPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent'); // recent, popular, oldest
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(6); // Show 6 posts per page

  useEffect(() => {
    fetchFavoritePosts();
  }, []);

  // Fetch user's favorite posts (liked posts)
  const fetchFavoritePosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to view your favorites');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/api/posts/users/favorites/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      } else {
        setError('Failed to fetch favorite posts');
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setError('Error loading favorites');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort posts
  const getFilteredAndSortedPosts = () => {
    let filtered = posts.filter(post =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort posts based on selected criteria
    switch (sortBy) {
      case 'popular':
        return filtered.sort((a, b) => b.like_count - a.like_count);
      case 'oldest':
        return filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      case 'recent':
      default:
        return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
  };

  const filteredPosts = getFilteredAndSortedPosts();
  
  // Pagination logic
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const currentPosts = filteredPosts.slice(startIndex, endIndex);
  
  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy]);
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top of content when page changes
    document.querySelector('.favorites-content')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => window.history.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center">
              <Heart className="w-6 h-6 text-red-500 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Favorites</h1>
            </div>
          </div>
          
          {/* Search and Filter */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search favorites..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent w-64"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="recent">Most Recent</option>
                <option value="popular">Most Popular</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto favorites-content">
        <div className="max-w-4xl mx-auto px-4 py-6 h-full">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
              <span className="ml-3 text-gray-600">Loading your favorites...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load favorites</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchFavoritePosts}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No matching favorites found' : 'No favorites yet'}
              </h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? 'Try adjusting your search terms' 
                  : 'Like posts to add them to your favorites and find them easily later'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-gray-600">
                  {filteredPosts.length} {filteredPosts.length === 1 ? 'favorite' : 'favorites'}
                  {searchTerm && ` matching "${searchTerm}"`}
                  {totalPages > 1 && (
                    <span className="text-sm text-gray-500 ml-2">
                      (Page {currentPage} of {totalPages})
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-500">
                  Sorted by {sortBy === 'recent' ? 'most recent' : sortBy === 'popular' ? 'most popular' : 'oldest first'}
                </p>
              </div>
              
              <div className="grid gap-6">
                {currentPosts.map((post) => (
                  <article key={post.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-3">
                          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                            {post.author.avatar ? (
                              <img src={post.author.avatar} alt={post.author.username} className="w-8 h-8 rounded-full" />
                            ) : (
                              <span className="text-red-600 text-sm font-medium">
                                {post.author.username.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{post.author.username}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(post.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Heart className="w-4 h-4 text-red-500 fill-current ml-auto" />
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-red-600 cursor-pointer">
                          {post.title}
                        </h3>
                        
                        <p className="text-gray-700 mb-4 line-clamp-3">
                          {post.excerpt || post.content.substring(0, 200) + '...'}
                        </p>
                        
                        <div className="flex items-center text-sm text-gray-500 space-x-6">
                          <div className="flex items-center">
                            <Heart className="w-4 h-4 mr-1 text-red-500 fill-current" />
                            {post.like_count}
                          </div>
                          <div className="flex items-center">
                            <MessageCircle className="w-4 h-4 mr-1" />
                            {post.comment_count}
                          </div>
                          <div className="flex items-center">
                            <Eye className="w-4 h-4 mr-1" />
                            {post.views}
                          </div>
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                            Favorited
                          </span>
                        </div>
                      </div>
                      
                      {post.image && (
                        <img 
                          src={post.image} 
                          alt={post.title}
                          className="w-24 h-24 object-cover rounded-lg ml-6 flex-shrink-0"
                        />
                      )}
                    </div>
                  </article>
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  <div className="flex space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                          page === currentPage
                            ? 'bg-red-500 text-white'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FavoritesPage;
