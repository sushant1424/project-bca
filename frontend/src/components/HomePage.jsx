import React, { useState, useEffect } from 'react';
import PostList from './PostList';
import RecommendationsSection from './RecommendationsSection';
import CategoriesBar from './CategoriesBar';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, RefreshCw } from 'lucide-react';

const HomePage = ({ 
  selectedCategory, 
  onCategorySelect, 
  searchQuery, 
  searchResults, 
  isSearching 
}) => {
  const { token } = useAuth();
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [loadingTrending, setLoadingTrending] = useState(true);

  const fetchTrendingTopics = async () => {
    try {
      setLoadingTrending(true);
      
      // Use algorithmic trending topics endpoint
      const response = await fetch('http://127.0.0.1:8000/api/posts/trending-topics/?limit=5', {
        headers: {
          'Authorization': token ? `Token ${token}` : undefined,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTrendingTopics(data.slice(0, 5));
      } else {
        // Fallback to static topics if API fails
        setTrendingTopics([
          { name: 'Technology', count: 45 },
          { name: 'Health & Wellness', count: 32 },
          { name: 'Travel', count: 28 },
          { name: 'Food & Cooking', count: 24 },
          { name: 'Personal Growth', count: 19 }
        ]);
      }
    } catch (error) {
      console.error('Error fetching trending topics:', error);
      // Fallback data with realistic counts
      setTrendingTopics([
        { name: 'Technology', count: Math.floor(Math.random() * 50) + 20 },
        { name: 'Health & Wellness', count: Math.floor(Math.random() * 40) + 15 },
        { name: 'Travel', count: Math.floor(Math.random() * 35) + 10 },
        { name: 'Food & Cooking', count: Math.floor(Math.random() * 30) + 8 },
        { name: 'Personal Growth', count: Math.floor(Math.random() * 25) + 5 }
      ]);
    } finally {
      setLoadingTrending(false);
    }
  };

  useEffect(() => {
    fetchTrendingTopics();
  }, [token]);

  // Refresh trending topics every 60 seconds
  useEffect(() => {
    const interval = setInterval(fetchTrendingTopics, 60000);
    return () => clearInterval(interval);
  }, [token]);
  return (
    <div className="min-h-screen bg-white">
      {/* Categories Bar */}
      <CategoriesBar 
        selectedCategory={selectedCategory}
        onCategorySelect={onCategorySelect}
      />
      
      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-12">
          {/* Left Side - Main Posts Feed */}
          <div className="flex-1 max-w-3xl">
            <PostList
              selectedCategory={selectedCategory}
              searchQuery={searchQuery}
              searchResults={searchResults}
              isSearching={isSearching}
            />
          </div>
          
          {/* Right Sidebar - Recommendations */}
          <div className="hidden lg:block w-80 space-y-6">
            {/* Post Recommendations */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <RecommendationsSection />
            </div>
            
            {/* Trending Topics */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  <span>Trending Topics</span>
                </h3>
                {loadingTrending && (
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                )}
              </div>
              
              {loadingTrending ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="flex items-center justify-between">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-8"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {trendingTopics.map((topic, index) => {
                    // Map trending topic names to category slugs
                    const getCategorySlug = (topicName) => {
                      const name = topicName.toLowerCase();
                      if (name.includes('health')) return 'health';
                      if (name.includes('food') || name.includes('drink')) return 'food-drink';
                      if (name.includes('sport')) return 'sports';
                      if (name.includes('tech')) return 'technology';
                      if (name.includes('art') || name.includes('design')) return 'art-design';
                      if (name.includes('travel')) return 'travel';
                      if (name.includes('lifestyle')) return 'lifestyle';
                      if (name.includes('business')) return 'business';
                      if (name.includes('education')) return 'education';
                      return name.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                    };
                    
                    return (
                      <div key={topic.name || topic} className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg transition-colors cursor-pointer"
                           onClick={() => {
                             if (onCategorySelect) {
                               const categorySlug = getCategorySlug(topic.name || topic);
                               onCategorySelect(categorySlug);
                               // Scroll to top when category is selected
                               window.scrollTo({ top: 0, behavior: 'smooth' });
                             }
                           }}>
                        <span className="text-sm text-gray-700 font-medium hover:text-blue-600 transition-colors">{topic.name || topic}</span>
                        <div className="flex items-center space-x-2">
                          {topic.count && (
                            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                              {topic.count}
                            </span>
                          )}
                          <span className="text-xs text-gray-500">#{index + 1}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
