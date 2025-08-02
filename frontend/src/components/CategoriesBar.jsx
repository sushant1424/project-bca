import React from 'react';
import { ChevronRight } from 'lucide-react';

const CategoriesBar = () => {
  // Categories data - can be fetched from API later
  const categories = [
    { id: 1, name: 'Home', active: true },
    { id: 2, name: 'Technology', active: false },
    { id: 3, name: 'Culture', active: false },
    { id: 4, name: 'Business', active: false },
    { id: 5, name: 'Politics', active: false },
    { id: 6, name: 'Finance', active: false },
    { id: 7, name: 'Food & Drink', active: false },
    { id: 8, name: 'Sports', active: false },
    { id: 9, name: 'Art & Design', active: false },
    { id: 10, name: 'Health', active: false },
    { id: 11, name: 'Science', active: false },
    { id: 12, name: 'Education', active: false },
    { id: 13, name: 'Travel', active: false },
    { id: 14, name: 'Fashion', active: false },
    { id: 15, name: 'Entertainment', active: false },
    { id: 16, name: 'Environment', active: false },
  ];

  return (
    <div className="bg-gray-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Horizontal scrollable categories container */}
        <div className="flex items-center space-x-2 py-3 overflow-x-auto scrollbar-hide">
          {/* Category buttons */}
          {categories.map((category) => (
            <button
              key={category.id}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                category.active
                  ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {category.name}
            </button>
          ))}
          
          {/* Scroll indicator arrow */}
          <div className="flex items-center pl-2">
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesBar; 