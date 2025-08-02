import React from 'react';
import { Home, PenTool, BookOpen, Heart, User, Settings, LogOut } from 'lucide-react';

const Sidebar = () => {
  return (
    <div className="hidden lg:flex flex-col w-56 bg-white border-r border-gray-200 min-h-screen">
      {/* Main Navigation Section */}
      <div className="flex-1 p-4">
        <nav className="space-y-1">
          {/* Primary Navigation Links */}
          <div className="space-y-1">
            <a href="#" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-purple-600 rounded-lg transition-colors duration-200">
              <Home className="w-5 h-5 mr-3" />
              <span className="font-medium">Home</span>
            </a>
            <a href="#" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-purple-600 rounded-lg transition-colors duration-200">
              <PenTool className="w-5 h-5 mr-3" />
              <span className="font-medium">Write</span>
            </a>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-4"></div>

          {/* Following List - Publications user follows */}
          <div className="space-y-1">
            <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Following
            </h3>
            {/* Dummy following data - replace with API data */}
            <a href="#" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-purple-600 rounded-lg transition-colors duration-200">
              <div className="w-6 h-6 bg-gray-300 rounded-full mr-3"></div>
              <span className="font-medium">Tech Insights</span>
            </a>
            <a href="#" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-purple-600 rounded-lg transition-colors duration-200">
              <div className="w-6 h-6 bg-gray-300 rounded-full mr-3"></div>
              <span className="font-medium">Design Weekly</span>
            </a>
            <a href="#" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-purple-600 rounded-lg transition-colors duration-200">
              <div className="w-6 h-6 bg-gray-300 rounded-full mr-3"></div>
              <span className="font-medium">Startup Stories</span>
            </a>
            <a href="#" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-purple-600 rounded-lg transition-colors duration-200">
              <div className="w-6 h-6 bg-gray-300 rounded-full mr-3"></div>
              <span className="font-medium">Product Thoughts</span>
            </a>
            <a href="#" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-purple-600 rounded-lg transition-colors duration-200">
              <div className="w-6 h-6 bg-gray-300 rounded-full mr-3"></div>
              <span className="font-medium">AI Today</span>
            </a>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-4"></div>

          {/* Reading List - User's saved content */}
          <div className="space-y-1">
            <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Reading
            </h3>
            <a href="#" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-purple-600 rounded-lg transition-colors duration-200">
              <BookOpen className="w-5 h-5 mr-3" />
              <span className="font-medium">My Library</span>
            </a>
            <a href="#" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-purple-600 rounded-lg transition-colors duration-200">
              <Heart className="w-5 h-5 mr-3" />
              <span className="font-medium">Favorites</span>
            </a>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-4"></div>

          {/* Account Settings */}
          <div className="space-y-1">
            <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Account
            </h3>
            <a href="#" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-purple-600 rounded-lg transition-colors duration-200">
              <User className="w-5 h-5 mr-3" />
              <span className="font-medium">Profile</span>
            </a>
            <a href="#" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-purple-600 rounded-lg transition-colors duration-200">
              <Settings className="w-5 h-5 mr-3" />
              <span className="font-medium">Settings</span>
            </a>
            <a href="#" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-red-600 rounded-lg transition-colors duration-200">
              <LogOut className="w-5 h-5 mr-3" />
              <span className="font-medium">Sign Out</span>
            </a>
          </div>
        </nav>
      </div>

      {/* Bottom CTA Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Start Writing</h4>
          <p className="text-xs text-gray-600 mb-3">Share your thoughts with the world</p>
          <button className="w-full px-3 py-2 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-all duration-200">
            Create Publication
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 