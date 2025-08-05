import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Settings } from 'lucide-react';
import { Button } from './ui/button';

const AdminAccessButton = ({ variant = "default", size = "default", className = "" }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  // Only show for staff users
  if (!user.is_staff) {
    return null;
  }

  const handleAdminAccess = () => {
    navigate('/admin');
  };

  if (variant === "icon") {
    return (
      <button
        onClick={handleAdminAccess}
        className={`p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors ${className}`}
        title="Admin Panel"
      >
        <Shield className="h-5 w-5" />
      </button>
    );
  }

  if (variant === "compact") {
    return (
      <Button
        onClick={handleAdminAccess}
        variant="outline"
        size={size}
        className={`text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 ${className}`}
      >
        <Shield className="h-4 w-4 mr-2" />
        Admin
      </Button>
    );
  }

  return (
    <Button
      onClick={handleAdminAccess}
      variant="outline"
      size={size}
      className={`text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 ${className}`}
    >
      <Shield className="h-4 w-4 mr-2" />
      Admin Panel
    </Button>
  );
};

export default AdminAccessButton;
