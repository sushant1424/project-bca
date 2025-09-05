import React, { useState, useEffect } from 'react';
import { User, Calendar, MapPin, Link as LinkIcon, Mail, Edit, Settings, Plus, Heart, MessageCircle, Eye, Bookmark } from 'lucide-react';
import API_CONFIG from '../config/api';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { ToastContainer } from './ToastNotification';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({ posts: 0, followers: 0, following: 0 });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    bio: '',
    website: '',
    phone_number: '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [errors, setErrors] = useState({});
  const { toasts, showSuccess, showError, removeToast } = useToast();

  useEffect(() => {
    fetchUserData();
    fetchUserPosts();
  }, []);

  const fetchUserData = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setStats({
        posts: userData.posts_count || 0,
        followers: userData.followers_count || 0,
        following: userData.following_count || 0
      });
      // Initialize form data with current user data
      setFormData({
        username: userData.username || '',
        email: userData.email || '',
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        bio: userData.bio || '',
        website: userData.website || '',
        phone_number: userData.phone_number || '',
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    }
    setLoading(false);
  };

  const fetchUserPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_CONFIG.BASE_URL}/api/posts/users/posts/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  };

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

  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }



    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setErrors({ general: 'Please login to update profile' });
        return;
      }

      // Prepare data to send
      const updateData = {
        username: formData.username,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        bio: formData.bio,
        website: formData.website,
        phone_number: formData.phone_number
      };



      const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/profile/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (response.ok) {
        // Update localStorage with new user data
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setSuccessMessage('Profile updated successfully!');
        
        // Clear password fields
        setFormData(prev => ({
          ...prev,
          current_password: '',
          new_password: '',
          confirm_password: ''
        }));

        setIsEditing(false);

        // Refresh page to reflect changes everywhere after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setErrors(data);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrors({ general: 'Error updating profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Handle profile image change
  const handleImageChange = (newImageUrl, error, message) => {
    if (error) {
      showError('Upload Error', error);
      return;
    }
    
    if (newImageUrl) {
      setUser(prev => ({
        ...prev,
        profile_image: newImageUrl
      }));
      
      // Update localStorage
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      userData.profile_image = newImageUrl;
      localStorage.setItem('user', JSON.stringify(userData));
      
      if (message) {
        showSuccess('Image Preview', message);
      } else {
        showSuccess('Success', 'Profile image updated successfully!');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => window.history.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center">
              <User className="w-6 h-6 text-purple-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
            </div>
          </div>
          
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            {isEditing ? 'View Profile' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {!isEditing ? (
            // View Mode
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl p-8 text-white">
                <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                  <div className="flex-shrink-0">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={user?.profile_image} alt={user?.username || 'Profile'} />
                      <AvatarFallback className="bg-white text-purple-600 text-2xl font-bold">
                        {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="text-center md:text-left">
                    <h2 className="text-3xl font-bold mb-2">{user?.username || 'Username'}</h2>
                    <p className="text-purple-100 text-lg mb-2">
                      {user?.first_name || user?.last_name 
                        ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                        : 'No name provided'
                      }
                    </p>
                    <p className="text-purple-200">{user?.email || 'No email provided'}</p>
                  </div>
                </div>
                {user?.bio && (
                  <div className="mt-6 pt-6 border-t border-white border-opacity-20">
                    <p className="text-purple-100 leading-relaxed">{user.bio}</p>
                  </div>
                )}
              </div>

              {/* Profile Information */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-gray-900">{user?.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <p className="text-gray-900">{user?.phone_number || 'Not provided'}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <p className="text-gray-900">{user?.bio || 'No bio provided'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <p className="text-gray-900">
                    {user?.website ? (
                      <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                        {user.website}
                      </a>
                    ) : (
                      'Not provided'
                    )}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            // Edit Mode
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Success Message */}
              {successMessage && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-600 text-sm">{successMessage}</p>
                </div>
              )}

              {/* Profile Image Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h3>
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-24 w-24 cursor-pointer">
                    <AvatarImage src={user?.profile_image} alt={user?.username || 'Profile'} />
                    <AvatarFallback className="bg-purple-100 text-purple-600 text-2xl font-bold">
                      {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-sm text-gray-600 text-center">
                    Click on your profile picture to upload a new image<br/>
                    <span className="text-xs text-gray-500">Supported formats: JPG, PNG, WebP (Max 5MB)</span>
                  </p>
                </div>
              </div>

              {/* Basic Information */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                
                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
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

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
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

                {/* First Name & Last Name */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Last name"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                {/* Website & Phone */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="+1234567890"
                    />
                  </div>
                </div>
              </div>

              {/* Password Change Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
                <p className="text-sm text-gray-600">Leave blank if you don't want to change your password</p>
                
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      name="current_password"
                      value={formData.current_password}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.current_password ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.current_password && (
                    <p className="text-red-500 text-sm mt-1">{errors.current_password}</p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      name="new_password"
                      value={formData.new_password}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.new_password ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.new_password && (
                    <p className="text-red-500 text-sm mt-1">{errors.new_password}</p>
                  )}
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirm_password"
                      value={formData.confirm_password}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.confirm_password ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Confirm new password"
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
              </div>

              {/* General error message */}
              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{errors.general}</p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Save className="w-5 h-5 mr-2" />
                  )}
                  {loading ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
};

export default ProfilePage;
