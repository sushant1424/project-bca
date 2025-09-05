// API Configuration
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? 'https://wrytera.netlify.app' : 'http://127.0.0.1:8000'),
  ENDPOINTS: {
    // Authentication
    LOGIN: '/api/auth/login/',
    REGISTER: '/api/auth/register/',
    LOGOUT: '/api/auth/logout/',
    FORGOT_PASSWORD: '/api/auth/password/reset/',
    UPLOAD_PROFILE_IMAGE: '/api/auth/upload-profile-image/',
    
    // Posts
    POSTS: '/api/posts/',
    POST_DETAIL: (id) => `/api/posts/${id}/`,
    POST_COMMENTS: (id) => `/api/posts/${id}/comments/`,
    POST_LIKE: (id) => `/api/posts/${id}/like/`,
    POST_REPOST: (id) => `/api/posts/${id}/repost/`,
    TRENDING_POSTS: '/api/posts/trending/',
    USER_POSTS: '/api/posts/users/posts/',
    USER_STATS: '/api/posts/users/stats/',
    
    // Categories
    CATEGORIES: '/api/posts/categories/',
    
    // User Management
    USER_PROFILE: '/api/users/profile/',
    FOLLOW_USER: (id) => `/api/users/${id}/follow/`,
    USER_FOLLOWERS: '/api/users/followers/',
    
    // Library & Favorites
    LIBRARY: '/api/posts/users/library/',
    FAVORITES: '/api/posts/users/favorites/',
  }
};

// Helper function to build full URL
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Token ${token}` })
  };
};

// Helper function for authenticated fetch
export const authenticatedFetch = async (endpoint, options = {}) => {
  const url = buildApiUrl(endpoint);
  const headers = {
    ...getAuthHeaders(),
    ...options.headers
  };
  
  const response = await fetch(url, {
    ...options,
    headers
  });
  
  // Handle common auth errors
  if (response.status === 401) {
    // Token expired or invalid
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
    throw new Error('Authentication expired. Please log in again.');
  }
  
  return response;
};

export default API_CONFIG;
