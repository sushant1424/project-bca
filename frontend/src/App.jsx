import React, { useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import CategoriesBar from "./components/CategoriesBar";
import PostList from "./components/PostList";
import WritePost from "./components/WritePost";
import WritePage from "./components/WritePage";
import Dashboard from "./components/Dashboard";
import PostDetail from "./components/PostDetail";

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [showWritePage, setShowWritePage] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCategorySelect = (categorySlug) => {
    setSelectedCategory(categorySlug);
  };

  const handleWriteClick = () => {
    setShowWritePage(true);
  };

  const handleDashboardClick = () => {
    setShowDashboard(true);
  };

  const handlePostClick = (postId) => {
    setSelectedPostId(postId);
  };

  const handlePostCreated = (newPost) => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top navigation bar */}
      <Navbar />

      {/* Main layout container */}
      <div className="flex">
        {/* Left sidebar - hidden on mobile */}
        <Sidebar onWriteClick={handleWriteClick} onDashboardClick={handleDashboardClick} />

        {/* Main content area */}
        <main className="flex-1 lg:ml-0">
          {/* Categories navigation bar */}
          <CategoriesBar 
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategorySelect}
          />

          {/* Content container */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Posts Feed */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <PostList 
                selectedCategory={selectedCategory} 
                refreshTrigger={refreshTrigger}
                onPostClick={handlePostClick}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Write Post Modal */}
      <WritePost 
        isOpen={showWriteModal}
        onClose={() => setShowWriteModal(false)}
        onPostCreated={handlePostCreated}
      />

      {/* Write Page */}
      <WritePage
        isOpen={showWritePage}
        onClose={() => setShowWritePage(false)}
        onPostCreated={handlePostCreated}
      />

      {/* Dashboard */}
      <Dashboard
        isOpen={showDashboard}
        onClose={() => setShowDashboard(false)}
      />

      {/* Post Detail */}
      <PostDetail
        postId={selectedPostId}
        isOpen={!!selectedPostId}
        onClose={() => setSelectedPostId(null)}
      />
    </div>
  );
}
