import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';

const AdminLogin = ({ onLoginSuccess }) => {
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [createAdminData, setCreateAdminData] = useState({
    username: '',
    email: '',
    password: '',
    confirm_password: ''
  });
  const [createAdminLoading, setCreateAdminLoading] = useState(false);
  const [createAdminError, setCreateAdminError] = useState('');
  const { showSuccess, showError } = useToast();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    
    try {
      // For admin login, convert username to admin email format
      const adminEmail = loginData.username === 'admin' ? 'admin11@gmail.com' : 
                        loginData.username === 'admin1' ? 'admin1@gmail.com' : 
                        `${loginData.username}@gmail.com`;
      
      const loginResponse = await fetch('http://127.0.0.1:8000/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: adminEmail,
          password: loginData.password,
        }),
      });
      
      const data = await loginResponse.json();
      
      if (loginResponse.ok) {
        // Check if user is admin/staff
        if (data.user.is_staff || data.user.is_superuser) {
          // Only store admin-specific tokens, don't interfere with user session
          localStorage.setItem('adminToken', data.token);
          localStorage.setItem('adminUser', JSON.stringify(data.user));
          setLoginData({ username: '', password: '' });
          showSuccess('Success', 'Admin login successful!');
          onLoginSuccess(data.user);
        } else {
          setLoginError('Access denied. Admin privileges required.');
        }
      } else {
        setLoginError(data.message || data.error || 'Invalid username or password.');
      }
      
    } catch (error) {
      console.error('Admin login error:', error);
      setLoginError('Login failed. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Password validation function
  const validatePassword = (password) => {
    const errors = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)');
    }
    
    return errors;
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setCreateAdminLoading(true);
    setCreateAdminError('');
    
    // Frontend password validation
    const passwordErrors = validatePassword(createAdminData.password);
    if (passwordErrors.length > 0) {
      setCreateAdminError(passwordErrors.join('. '));
      setCreateAdminLoading(false);
      return;
    }
    
    // Check password confirmation
    if (createAdminData.password !== createAdminData.confirm_password) {
      setCreateAdminError('Passwords do not match');
      setCreateAdminLoading(false);
      return;
    }
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/create-admin/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createAdminData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Store admin tokens and login immediately
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.user));
        showSuccess('Success', 'Admin account created successfully!');
        onLoginSuccess(data.user);
      } else {
        // Handle backend validation errors
        if (data.errors) {
          const errorMessages = [];
          Object.keys(data.errors).forEach(field => {
            if (Array.isArray(data.errors[field])) {
              errorMessages.push(...data.errors[field]);
            } else {
              errorMessages.push(data.errors[field]);
            }
          });
          setCreateAdminError(errorMessages.join('. '));
        } else {
          setCreateAdminError(data.message || data.error || 'Failed to create admin account');
        }
      }
      
    } catch (error) {
      console.error('Create admin error:', error);
      setCreateAdminError('Failed to create admin account. Please try again.');
    } finally {
      setCreateAdminLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-lg">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">🚀 Admin {showCreateAdmin ? 'Registration' : 'Login'}</h2>
          <p className="text-gray-600 mb-6">{showCreateAdmin ? 'Create a new admin account' : 'Access your Wrytera admin dashboard'}</p>
        </div>
        
        {showCreateAdmin ? (
          <form onSubmit={handleCreateAdmin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={createAdminData.username}
                onChange={(e) => setCreateAdminData({...createAdminData, username: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your username"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={createAdminData.email}
                onChange={(e) => setCreateAdminData({...createAdminData, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={createAdminData.password}
                onChange={(e) => setCreateAdminData({...createAdminData, password: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              {createAdminData.password && (
                <div className="mt-2 text-xs space-y-1">
                  <div className="text-gray-600 font-medium">Password Requirements:</div>
                  <div className={`flex items-center ${createAdminData.password.length >= 8 ? 'text-green-600' : 'text-red-500'}`}>
                    <span className="mr-1">{createAdminData.password.length >= 8 ? '✓' : '✗'}</span>
                    At least 8 characters
                  </div>
                  <div className={`flex items-center ${/[A-Z]/.test(createAdminData.password) ? 'text-green-600' : 'text-red-500'}`}>
                    <span className="mr-1">{/[A-Z]/.test(createAdminData.password) ? '✓' : '✗'}</span>
                    One uppercase letter
                  </div>
                  <div className={`flex items-center ${/[a-z]/.test(createAdminData.password) ? 'text-green-600' : 'text-red-500'}`}>
                    <span className="mr-1">{/[a-z]/.test(createAdminData.password) ? '✓' : '✗'}</span>
                    One lowercase letter
                  </div>
                  <div className={`flex items-center ${/\d/.test(createAdminData.password) ? 'text-green-600' : 'text-red-500'}`}>
                    <span className="mr-1">{/\d/.test(createAdminData.password) ? '✓' : '✗'}</span>
                    One number
                  </div>
                  <div className={`flex items-center ${/[!@#$%^&*(),.?":{}|<>]/.test(createAdminData.password) ? 'text-green-600' : 'text-red-500'}`}>
                    <span className="mr-1">{/[!@#$%^&*(),.?":{}|<>]/.test(createAdminData.password) ? '✓' : '✗'}</span>
                    One special character
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                value={createAdminData.confirm_password}
                onChange={(e) => setCreateAdminData({...createAdminData, confirm_password: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            {createAdminError && (
              <div className="text-red-600 text-sm text-center">{createAdminError}</div>
            )}
            
            <button
              type="submit"
              disabled={createAdminLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createAdminLoading ? 'Creating...' : 'Create Admin'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={loginData.username}
                onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your username"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            {loginError && (
              <div className="text-red-600 text-sm text-center">{loginError}</div>
            )}
            
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loginLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        )}
        
        <div className="text-center mt-6">
          <button
            type="button"
            onClick={() => setShowCreateAdmin(!showCreateAdmin)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {showCreateAdmin ? 'Already have an admin account? Login' : 'New to admin? Create admin account'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
