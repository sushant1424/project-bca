import React, { useState } from 'react';
import { X, Eye, EyeOff, User, Mail, Lock, CheckCircle } from 'lucide-react';

const AuthModal = ({ isOpen, onClose, mode = 'login', onModeChange }) => {
  // Form state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Password validation rules
  const passwordRules = {
    minLength: formData.password.length >= 8,
    hasUppercase: /[A-Z]/.test(formData.password),
    hasLowercase: /[a-z]/.test(formData.password),
    hasNumber: /\d/.test(formData.password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password)
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Client-side validation
  const validateForm = () => {
    const newErrors = {};

    // Username validation (signup only)
    if (mode === 'signup' && !formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (mode === 'signup' && formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    // Email validation (required for all modes)
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Password validation (not required for forgot-password)
    if (mode !== 'forgot-password') {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (mode === 'signup') {
        if (formData.password.length < 8) {
          newErrors.password = 'Password must be at least 8 characters';
        } else if (!passwordRules.hasUppercase) {
          newErrors.password = 'Password must contain uppercase letter';
        } else if (!passwordRules.hasLowercase) {
          newErrors.password = 'Password must contain lowercase letter';
        } else if (!passwordRules.hasNumber) {
          newErrors.password = 'Password must contain a number';
        } else if (!passwordRules.hasSpecial) {
          newErrors.password = 'Password must contain a special character';
        }
      }
    }

    // Confirm password validation (signup only)
    if (mode === 'signup' && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Use the correct Django backend URL
      const baseURL = 'http://127.0.0.1:8000';
      let endpoint, payload;
      
      if (mode === 'login') {
        endpoint = '/api/auth/login/';
        payload = { email: formData.email, password: formData.password };
      } else if (mode === 'signup') {
        endpoint = '/api/auth/signup/';
        payload = { 
          username: formData.username, 
          email: formData.email, 
          password: formData.password,
          confirm_password: formData.confirmPassword
        };
      } else if (mode === 'forgot-password') {
        endpoint = '/api/auth/forgot-password/';
        payload = { email: formData.email };
      }
      
      const url = baseURL + endpoint;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Close modal and refresh page or update state
        onClose();
        window.location.reload(); // Simple approach for now
      } else {
        // Handle server errors with specific messages
        if (response.status === 400) {
          if (data.username && data.username.includes('already exists')) {
            setErrors({ username: 'This username is already taken. Please choose another.' });
          } else if (data.email && data.email.includes('already exists')) {
            setErrors({ email: 'An account with this email already exists.' });
          } else if (data.non_field_errors) {
            setErrors({ general: data.non_field_errors[0] || 'Invalid credentials.' });
          } else if (data.detail) {
            setErrors({ general: data.detail });
          } else {
            setErrors({ general: 'Please check your information and try again.' });
          }
        } else if (response.status === 401) {
          setErrors({ general: 'Invalid email or password. Please try again.' });
        } else if (data.errors) {
          setErrors(data.errors);
        } else {
          setErrors({ general: data.message || 'Something went wrong. Please try again.' });
        }
      }
    } catch (error) {
      console.error('Network error:', error);
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setFormData({ username: '', email: '', password: '', confirmPassword: '' });
      setErrors({});
    }
  }, [isOpen, mode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md mx-4 my-8 max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-gray-800 ring-2 ring-gray-300">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create account' : 'Reset Password'}
          </h2>
          <p className="text-gray-600 mb-8">
            {mode === 'login' 
              ? 'Sign in to your account to continue' 
              : mode === 'signup'
              ? 'Join our community and start sharing your thoughts'
              : 'Enter your email address and we\'ll send you a link to reset your password'
            }
          </p>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username field (signup only) */}
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.username ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your username"
                />
              </div>
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username}</p>
              )}
            </div>
          )}

          {/* Email field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your email"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password field (signup only) */}
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.confirm_password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirm_password && (
                <p className="text-red-500 text-sm mt-1">{errors.confirm_password}</p>
              )}
            </div>
          )}

          {/* Password requirements (signup only) */}
          {mode === 'signup' && formData.password && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</h4>
              <div className="space-y-1">
                <div className={`flex items-center text-sm ${passwordRules.minLength ? 'text-green-600' : 'text-red-500'}`}>
                  <CheckCircle className={`w-4 h-4 mr-2 ${passwordRules.minLength ? 'text-green-600' : 'text-red-500'}`} />
                  At least 8 characters
                </div>
                <div className={`flex items-center text-sm ${passwordRules.hasUppercase ? 'text-green-600' : 'text-red-500'}`}>
                  <CheckCircle className={`w-4 h-4 mr-2 ${passwordRules.hasUppercase ? 'text-green-600' : 'text-red-500'}`} />
                  One uppercase letter
                </div>
                <div className={`flex items-center text-sm ${passwordRules.hasLowercase ? 'text-green-600' : 'text-red-500'}`}>
                  <CheckCircle className={`w-4 h-4 mr-2 ${passwordRules.hasLowercase ? 'text-green-600' : 'text-red-500'}`} />
                  One lowercase letter
                </div>
                <div className={`flex items-center text-sm ${passwordRules.hasNumber ? 'text-green-600' : 'text-red-500'}`}>
                  <CheckCircle className={`w-4 h-4 mr-2 ${passwordRules.hasNumber ? 'text-green-600' : 'text-red-500'}`} />
                  One number
                </div>
                <div className={`flex items-center text-sm ${passwordRules.hasSpecial ? 'text-green-600' : 'text-red-500'}`}>
                  <CheckCircle className={`w-4 h-4 mr-2 ${passwordRules.hasSpecial ? 'text-green-600' : 'text-red-500'}`} />
                  One special character
                </div>
              </div>
            </div>
          )}

          {/* General error message */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Loading...' : (mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link')}
          </button>
          
          {/* Divider - only show for login and signup */}
          {mode !== 'forgot-password' && (
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
          )}
          
          {/* Google Sign In Button - only show for login and signup */}
          {mode !== 'forgot-password' && (
            <button
              type="button"
              onClick={() => {
                // TODO: Implement Google OAuth later
                alert('Google sign-in will be implemented soon!');
              }}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          )}
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => {
                const newMode = mode === 'login' ? 'signup' : 'login';
                if (onModeChange) {
                  onModeChange(newMode);
                } else {
                  // Reset form when switching modes
                  setFormData({
                    username: '',
                    email: '',
                    password: '',
                    confirmPassword: ''
                  });
                  setErrors({});
                }
              }}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
          
          {/* Forgot Password Link - only show in login mode */}
          {mode === 'login' && (
            <p className="text-gray-600 mt-2">
              <button
                onClick={() => {
                  if (onModeChange) {
                    onModeChange('forgot-password');
                  }
                }}
                className="text-purple-600 hover:text-purple-700 font-medium text-sm"
              >
                Forgot your password?
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal; 