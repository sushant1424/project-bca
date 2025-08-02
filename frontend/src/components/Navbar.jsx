import React, { useState } from 'react';
import { Menu, X, Search, User } from 'lucide-react';

const Navbar = () => {
  // State for mobile menu toggle
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Left side */}
          <div className="flex items-center">
            <span className="text-2xl font-bold text-gray-900">Wrytera</span>
          </div>

          {/* Search Bar - Center (hidden on mobile) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search"
                className="block w-full px-4 py-2 border border-gray-300 rounded-full leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Action Buttons - Right side (hidden on mobile) */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="px-4 py-2 text-gray-700 hover:text-purple-600 transition-colors duration-200 font-medium">
              Sign in
            </button>
            <button className="px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-all duration-200 font-medium">
              Get started
            </button>
          </div>

          {/* Mobile menu button (visible only on mobile) */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
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
              <a href="#" className="block px-3 py-2 text-gray-700 hover:text-purple-600 transition-colors duration-200 font-medium">
                Home
              </a>
              <a href="#" className="block px-3 py-2 text-gray-700 hover:text-purple-600 transition-colors duration-200 font-medium">
                Write
              </a>
              
              {/* Mobile Action Buttons */}
              <div className="pt-4 pb-3 border-t border-gray-100">
                <button className="w-full flex items-center px-3 py-2 text-gray-700 hover:text-purple-600 transition-colors duration-200 font-medium">
                  <User className="w-5 h-5 mr-2" />
                  Sign in
                </button>
                <button className="w-full mt-2 px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-all duration-200 font-medium">
                  Get started
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 