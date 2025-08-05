import React, { useState, useEffect } from 'react';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';

const AdminPanel = () => {
  const [adminUser, setAdminUser] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  // Check admin authentication on component mount
  useEffect(() => {
    const checkAdminAuth = () => {
      const adminToken = localStorage.getItem('adminToken');
      const adminUserData = localStorage.getItem('adminUser');
      
      if (adminToken && adminUserData) {
        try {
          const parsedAdminUser = JSON.parse(adminUserData);
          if (parsedAdminUser.is_superuser || parsedAdminUser.is_staff) {
            setAdminUser(parsedAdminUser);
            setIsAuthenticating(false);
            return;
          }
        } catch (error) {
          console.error('Error parsing admin user data:', error);
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
        }
      }
      
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      setAdminUser(null);
      setIsAuthenticating(false);
    };
    
    checkAdminAuth();
  }, []);

  const handleLoginSuccess = (user) => {
    setAdminUser(user);
  };

  // Show loading while checking authentication
  if (isAuthenticating) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!adminUser) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  // Show admin dashboard if authenticated
  return <AdminDashboard adminUser={adminUser} />;
};

export default AdminPanel;
