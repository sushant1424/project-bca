import React from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import CategoriesBar from "./components/CategoriesBar";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top navigation bar */}
      <Navbar />
      
      {/* Main layout container */}
      <div className="flex">
        {/* Left sidebar - hidden on mobile */}
        <Sidebar />
        
        {/* Main content area */}
        <main className="flex-1 lg:ml-0">
          {/* Categories navigation bar */}
          <CategoriesBar />
          
          {/* Content container */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Main content will go here */}
            <div className="text-center text-gray-500 mt-20">
              <p>Welcome to Wrytera - Your content platform</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
