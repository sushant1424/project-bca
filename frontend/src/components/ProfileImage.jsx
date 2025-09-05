import React, { useState, useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import API_CONFIG from '../config/api';
// import defaultAvatar from '../assets/images/default-avatar.png';

// Temporary default avatar (you can replace this with your actual image path)
const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iMzciIHI9IjE4IiBmaWxsPSIjOUI5QkE0Ii8+CjxwYXRoIGQ9Ik0yMCA4MEM4IDgwIDggNzIgMjAgNzJIMzBDNDIgNzIgNDIgODAgMzAgODBIMjBaIiBmaWxsPSIjOUI5QkE0Ii8+CjxwYXRoIGQ9Ik03MCA4MEM4MiA4MCA4MiA3MiA3MCA3Mkg4MEM5MiA3MiA5MiA4MCA4MCA4MEg3MFoiIGZpbGw9IiM5QjlCQTQiLz4KPC9zdmc+';

const ProfileImage = ({ 
  src, 
  alt = "Profile", 
  size = "md", 
  editable = false, 
  onImageChange,
  className = "" 
}) => {
  const [imageError, setImageError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Size classes
  const sizeClasses = {
    xs: "w-8 h-8",
    sm: "w-12 h-12", 
    md: "w-16 h-16",
    lg: "w-24 h-24",
    xl: "w-32 h-32",
    "2xl": "w-40 h-40"
  };

  const iconSizes = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8",
    xl: "w-12 h-12",
    "2xl": "w-16 h-16"
  };

  // Handle image upload
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.error('Invalid file type:', file.type);
      if (onImageChange) {
        onImageChange(null, 'Please select a valid image file (JPG, PNG, WebP)');
      }
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      console.error('File too large:', file.size);
      if (onImageChange) {
        onImageChange(null, 'Image size must be less than 5MB');
      }
      return;
    }

    try {
      setUploading(true);
      
      // Create FormData for upload
      const formData = new FormData();
      formData.append('profile_image', file);

      // Create local preview URL for immediate display
      const previewUrl = URL.createObjectURL(file);
      
      // Update UI immediately with preview
      if (onImageChange) {
        onImageChange(previewUrl, null, 'Image selected! This is a preview. Backend upload functionality needs to be implemented.');
      }
      
      // Get auth token
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No auth token found');
        if (onImageChange) {
          onImageChange(previewUrl, 'Please log in to upload profile image');
        }
        return;
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/upload-profile-image/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
        },
        body: formData,
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setPreviewUrl(data.profile_image_url);
        onImageChange && onImageChange(data.profile_image_url);
        console.log('Profile image uploaded successfully!');
      } else {
        throw new Error(data.error || data.message || 'Upload failed');
      }
      
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Determine image source
  const getImageSrc = () => {
    if (imageError || !src) {
      return defaultAvatar;
    }
    
    // If it's a full URL, use as is
    if (src.startsWith('http')) {
      return src;
    }
    
    // If it's a relative path, prepend backend URL
    return `${API_CONFIG.BASE_URL}${src}`;
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div className={`
        ${sizeClasses[size]} 
        rounded-full overflow-hidden bg-gray-200 border-2 border-gray-300
        ${editable ? 'cursor-pointer hover:border-blue-400 transition-colors' : ''}
        ${uploading ? 'opacity-50' : ''}
      `}>
        {/* Profile Image */}
        <img
          src={getImageSrc()}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
          onLoad={() => setImageError(false)}
        />
        
        {/* Upload Overlay */}
        {editable && (
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
            <Camera className={`${iconSizes[size]} text-white opacity-0 hover:opacity-100 transition-opacity`} />
          </div>
        )}
        
        {/* Loading Spinner */}
        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
        )}
      </div>
      
      {/* Upload Input */}
      {editable && (
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />
      )}
      
      {/* Camera Icon for Editable */}
      {editable && (
        <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1.5 border-2 border-white shadow-lg">
          <Camera className="w-3 h-3 text-white" />
        </div>
      )}
    </div>
  );
};

export default ProfileImage;
