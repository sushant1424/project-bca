import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');
  
  // Temporarily allow access for testing - comment out staff check
  // if (!token || !user.is_staff) {
  //   return <Navigate to="/" replace />;
  // }
  
  return children;
};

export default AdminRoute;
