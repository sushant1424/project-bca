import React, { useState, useEffect } from "react";
import AppRouter from "./components/AppRouter";
import { ToastContainer } from "./components/ToastNotification";
import { ToastProvider, useToast } from "./context/ToastContext";
import { LikeProvider } from './contexts/LikeContext';
import { AnalyticsProvider } from './contexts/AnalyticsContext';
import { FollowProvider } from './contexts/FollowContext';
import { NotificationProvider } from './contexts/NotificationContext';

// App Content Component that uses toast context
function AppContent() {
  // Start with sidebar collapsed (hidden) by default
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const { toasts, removeToast } = useToast();

  // Check screen size and set initial sidebar state
  useEffect(() => {
    const checkScreenSize = () => {
      const isDesktop = window.innerWidth >= 1024; // lg breakpoint
      // On desktop, sidebar can be expanded by default, on mobile it should be collapsed
      setSidebarCollapsed(!isDesktop);
    };

    // Set initial state
    checkScreenSize();

    // Listen for window resize
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <>
      <AppRouter 
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={toggleSidebar}
      />
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </>
  );
}

// Main App Component with ToastProvider, LikeProvider, and AnalyticsProvider
export default function App() {
  return (
    <ToastProvider>
      <AnalyticsProvider>
        <FollowProvider>
          <LikeProvider>
            <AppContent />
          </LikeProvider>
        </FollowProvider>
      </AnalyticsProvider>
    </ToastProvider>
  );
}
