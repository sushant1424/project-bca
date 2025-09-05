import React, { useState } from 'react';
import { Eye, EyeOff, User, Mail, Lock, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const AuthModal = ({ isOpen, onClose, mode = 'login', onModeChange }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess } = useToast();
  const { login } = useAuth();

  const passwordRules = {
    minLength: formData.password.length >= 8,
    hasUppercase: /[A-Z]/.test(formData.password),
    hasLowercase: /[a-z]/.test(formData.password),
    hasNumber: /\d/.test(formData.password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password)
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (mode === 'signup' && !formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (mode === 'signup' && formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (mode !== 'forgot-password') {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (mode === 'signup' && !Object.values(passwordRules).every(Boolean)) {
        newErrors.password = 'Password does not meet requirements';
      }

      if (mode === 'signup' && formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const baseURL = API_CONFIG.BASE_URL;
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
        // Update AuthContext state immediately
        login(data.user, data.token);
        
        // Show success toast message
        if (mode === 'login') {
          showSuccess('Login Successful', 'Welcome back to Wrytera!');
        } else {
          showSuccess('Signup Successful', 'Welcome to Wrytera!');
        }
        
        onClose();
        
        // Trigger a custom event to update navbar state instead of reloading
        window.dispatchEvent(new CustomEvent('userLoggedIn', { 
          detail: { user: data.user } 
        }));
      } else {
        if (response.status === 400) {
          // Handle signup-specific errors
          if (mode === 'signup') {
            console.log('Signup error data:', data); // Debug log
            console.log('Error data keys:', Object.keys(data)); // Show what fields have errors
            console.log('Error data stringified:', JSON.stringify(data, null, 2)); // Show full structure
            console.log('Full response:', response); // Debug full response
            
            // Handle nested error structure (data.errors.field)
            const errorData = data.errors || data;
            
            // Collect all errors to show multiple errors simultaneously
            const newErrors = {};
            
            // Check for username errors
            if (errorData.username) {
              if (Array.isArray(errorData.username)) {
                const usernameError = errorData.username[0];
                if (usernameError.toLowerCase().includes('already exists') || 
                    usernameError.toLowerCase().includes('user with this username already exists') ||
                    usernameError.toLowerCase().includes('already taken')) {
                  newErrors.username = 'This username is already taken. Please choose another.';
                } else {
                  newErrors.username = usernameError;
                }
              } else if (typeof errorData.username === 'string') {
                if (errorData.username.toLowerCase().includes('already exists') || 
                    errorData.username.toLowerCase().includes('user with this username already exists') ||
                    errorData.username.toLowerCase().includes('already taken')) {
                  newErrors.username = 'This username is already taken. Please choose another.';
                } else {
                  newErrors.username = errorData.username;
                }
              }
            }
            
            // Check for email errors
            if (errorData.email) {
              if (Array.isArray(errorData.email)) {
                const emailError = errorData.email[0];
                if (emailError.toLowerCase().includes('already exists') || 
                    emailError.toLowerCase().includes('user with this email already exists') ||
                    emailError.toLowerCase().includes('already taken')) {
                  newErrors.email = 'An account with this email already exists.';
                } else {
                  newErrors.email = emailError;
                }
              } else if (typeof errorData.email === 'string') {
                if (errorData.email.toLowerCase().includes('already exists') || 
                    errorData.email.toLowerCase().includes('user with this email already exists') ||
                    errorData.email.toLowerCase().includes('already taken')) {
                  newErrors.email = 'An account with this email already exists.';
                } else {
                  newErrors.email = errorData.email;
                }
              }
            }
            
            // Check for password errors
            if (errorData.password && Array.isArray(errorData.password)) {
              newErrors.password = errorData.password[0];
            }
            
            // Check for general errors
            if (data.non_field_errors) {
              newErrors.general = data.non_field_errors[0];
            }
            
            // Check for any other field errors
            Object.keys(errorData).forEach(key => {
              if (!newErrors[key] && key !== 'username' && key !== 'email' && key !== 'password') {
                const fieldError = Array.isArray(errorData[key]) ? errorData[key][0] : errorData[key];
                newErrors[key] = fieldError;
              }
            });
            
            // Set all errors at once or fallback to general error
            if (Object.keys(newErrors).length > 0) {
              setErrors(newErrors);
            } else {
              setErrors({ general: 'Please check your input and try again.' });
            }
          } else {
            // Handle login-specific errors
            if (data.non_field_errors) {
              const errorMessage = data.non_field_errors[0] || 'Invalid credentials.';
              if (errorMessage.toLowerCase().includes('invalid credentials') || 
                  errorMessage.toLowerCase().includes('unable to log in')) {
                setErrors({ general: 'Incorrect email or password. Please check your credentials and try again.' });
              } else {
                setErrors({ general: errorMessage });
              }
            } else if (data.detail) {
              setErrors({ general: data.detail });
            } else if (data.email && data.email.includes('not found')) {
              setErrors({ general: 'No account found with this email address.' });
            } else if (data.password) {
              setErrors({ general: 'Incorrect password. Please try again.' });
            } else {
              setErrors({ general: 'Incorrect email or password. Please check your credentials and try again.' });
            }
          }
        } else if (response.status === 401) {
          setErrors({ general: 'Incorrect email or password. Please check your credentials and try again.' });
        } else if (response.status === 404) {
          setErrors({ general: 'No account found with this email address.' });
        } else {
          setErrors({ general: 'Something went wrong. Please try again.' });
        }
      }
    } catch (error) {
      console.error('Network error:', error);
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      setFormData({ username: '', email: '', password: '', confirmPassword: '' });
      setErrors({});
    }
  }, [isOpen, mode]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            {mode === 'login' ? 'Sign in to your account' : 'Join our community today'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {errors.general}
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <User className={`absolute left-3 top-2.5 w-5 h-5 ${errors.username ? 'text-red-500' : 'text-gray-400'}`} />
                <Input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`pl-10 ${errors.username ? 'border-red-500 focus:border-red-500' : ''}`}
                  placeholder="Enter your username"
                />
                {errors.username && (
                  <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className={`absolute left-3 top-2.5 w-5 h-5 ${errors.email ? 'text-red-500' : 'text-gray-400'}`} />
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`pl-10 ${errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
          </div>

          {mode !== 'forgot-password' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>
            </div>
          )}

          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
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
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              {formData.password && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</p>
                  <div className="space-y-1">
                    {Object.entries({
                      'At least 8 characters': passwordRules.minLength,
                      'One uppercase letter': passwordRules.hasUppercase,
                      'One lowercase letter': passwordRules.hasLowercase,
                      'One number': passwordRules.hasNumber,
                      'One special character': passwordRules.hasSpecial
                    }).map(([rule, met]) => (
                      <div key={rule} className="flex items-center space-x-2">
                        <CheckCircle className={`w-4 h-4 ${met ? 'text-green-500' : 'text-gray-300'}`} />
                        <span className={`text-sm ${met ? 'text-green-700' : 'text-gray-500'}`}>
                          {rule}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}



          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Loading...' : 
             mode === 'login' ? 'Sign In' : 
             'Create Account'}
          </Button>
        </form>

        <div className="text-center space-y-2">
          {mode === 'login' && (
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => onModeChange('signup')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Sign up
              </button>
            </p>
          )}
          
          {mode === 'signup' && (
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => onModeChange('login')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
