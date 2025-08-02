import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { buildApiUrl } from '../config/api';
import API_CONFIG from '../config/api';

const CategoriesBar = ({ selectedCategory, onCategorySelect }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/posts/categories/');
        if (response.ok) {
          const data = await response.json();
          // Add "All" category at the beginning
          const allCategories = [
            { id: 0, name: 'All', slug: 'all', color: '#6B7280', active: !selectedCategory },
            ...data.map(cat => ({
              ...cat,
              active: selectedCategory === cat.slug
            }))
          ];
          setCategories(allCategories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Set fallback categories if API fails
        setCategories([
          { id: 0, name: 'All', slug: 'all', color: '#6B7280', active: !selectedCategory }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [selectedCategory]);

  // Handle scroll arrows
  const handleScroll = (direction) => {
    const container = document.getElementById('categories-container');
    if (container) {
      const scrollAmount = 200;
      const newPosition = direction === 'left' 
        ? scrollPosition - scrollAmount 
        : scrollPosition + scrollAmount;
      
      container.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });
      setScrollPosition(newPosition);
    }
  };

  // Check scroll position for arrow visibility
  useEffect(() => {
    const container = document.getElementById('categories-container');
    if (container) {
      const checkScroll = () => {
        setShowLeftArrow(container.scrollLeft > 0);
        setShowRightArrow(
          container.scrollLeft < container.scrollWidth - container.clientWidth
        );
      };

      container.addEventListener('scroll', checkScroll);
      checkScroll();

      return () => container.removeEventListener('scroll', checkScroll);
    }
  }, [categories]);

  if (loading) {
    return (
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 py-3">
            <div className="animate-pulse bg-gray-200 h-8 w-20 rounded-full"></div>
            <div className="animate-pulse bg-gray-200 h-8 w-24 rounded-full"></div>
            <div className="animate-pulse bg-gray-200 h-8 w-16 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center py-3">
          {/* Left arrow */}
          {showLeftArrow && (
            <button
              onClick={() => handleScroll('left')}
              className="absolute left-0 z-10 flex items-center justify-center w-8 h-8 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
          )}

          {/* Categories container */}
          <div
            id="categories-container"
            className="flex items-center space-x-2 overflow-x-auto scrollbar-hide px-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => onCategorySelect(category.slug === 'all' ? null : category.slug)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                  category.active
                    ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Right arrow */}
          {showRightArrow && (
            <button
              onClick={() => handleScroll('right')}
              className="absolute right-0 z-10 flex items-center justify-center w-8 h-8 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoriesBar; 