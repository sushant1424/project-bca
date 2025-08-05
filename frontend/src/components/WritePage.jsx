import React, { useState, useEffect } from 'react';
import { X, Save, Send, Image as ImageIcon, Tag, ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

const WritePage = ({ onPostCreated }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showSuccess } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    image: '',
    category: ''
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const [loadingEdit, setLoadingEdit] = useState(false);
  // Searchable dropdown state
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [selectedCategoryName, setSelectedCategoryName] = useState('');

  // Check if user is logged in and handle editing
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    // Check for edit parameter in URL
    const urlParams = new URLSearchParams(location.search);
    const editPostId = urlParams.get('edit');
    
    if (editPostId) {
      // Fetch the post data for editing
      fetchPostForEditing(editPostId);
    } else {
      // Check if editing a post from localStorage (legacy support)
      const editingPostData = localStorage.getItem('editingPost');
      if (editingPostData) {
        const post = JSON.parse(editingPostData);
        setFormData({
          title: post.title || '',
          content: post.content || '',
          excerpt: post.excerpt || '',
          image: post.image || '',
          category: post.category?.id || ''
        });
        setIsEditing(true);
        setEditingPostId(post.id);
        // Clear the editing data from localStorage
        localStorage.removeItem('editingPost');
      }
    }
  }, [location.search]);

  const fetchPostForEditing = async (postId) => {
    try {
      setLoadingEdit(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`http://127.0.0.1:8000/api/posts/${postId}/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const post = await response.json();
        setFormData({
          title: post.title || '',
          content: post.content || '',
          excerpt: post.excerpt || '',
          image: post.image || '',
          category: post.category?.id || ''
        });
        setIsEditing(true);
        setEditingPostId(postId);
      } else {
        setError('Failed to load post for editing');
      }
    } catch (error) {
      console.error('Error fetching post for editing:', error);
      setError('Failed to load post for editing');
    } finally {
      setLoadingEdit(false);
    }
  };

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log('Fetching categories from API...');
        const token = localStorage.getItem('token');
        const headers = {
          'Content-Type': 'application/json'
        };
        
        // Add auth header if token exists
        if (token) {
          headers['Authorization'] = `Token ${token}`;
        }
        
        const response = await fetch('http://127.0.0.1:8000/api/posts/categories/?page_size=100', {
          headers
        });
        console.log('Categories API response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Categories API response data:', data);
          
          // Handle different response formats
          let categoriesArray = [];
          if (Array.isArray(data)) {
            // Direct array response
            categoriesArray = data;
          } else if (data.results && Array.isArray(data.results)) {
            // Paginated response
            categoriesArray = data.results;
          } else if (data.data && Array.isArray(data.data)) {
            // Nested data response
            categoriesArray = data.data;
          }
          
          console.log('Processed categories array:', categoriesArray);
          setCategories(categoriesArray);
        } else {
          console.error('Categories API failed with status:', response.status);
          const errorText = await response.text();
          console.error('Error response:', errorText);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Track unsaved changes
  useEffect(() => {
    const hasChanges = formData.title.trim() || formData.content.trim() || formData.excerpt.trim() || formData.image.trim();
    setHasUnsavedChanges(hasChanges);
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle category selection
  const handleCategorySelect = (categoryId, categoryName) => {
    setFormData(prev => ({
      ...prev,
      category: categoryId
    }));
    setSelectedCategoryName(categoryName);
    setShowCategoryDropdown(false);
    setCategorySearch('');
  };

  // Filter categories based on search
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  // Update selected category name when editing
  useEffect(() => {
    if (formData.category && categories.length > 0) {
      const selectedCategory = categories.find(cat => cat.id.toString() === formData.category.toString());
      if (selectedCategory) {
        setSelectedCategoryName(selectedCategory.name);
      }
    }
  }, [formData.category, categories]);

  const handleSubmit = async (isDraft = false) => {
    if (!user) {
      setError('You must be logged in to create a post');
      return;
    }

    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const url = isEditing 
        ? `http://127.0.0.1:8000/api/posts/${editingPostId}/`
        : 'http://127.0.0.1:8000/api/posts/';
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({
          ...formData,
          is_published: !isDraft
        })
      });

      if (response.ok) {
        const updatedPost = await response.json();
        setHasUnsavedChanges(false);
        
        // Reset form only if creating new post
        if (!isEditing) {
          setFormData({
            title: '',
            content: '',
            excerpt: '',
            image: '',
            category: ''
          });
        }
        
        // Show success message with professional toast
        const action = isEditing ? 'updated' : (isDraft ? 'saved as draft' : 'published');
        showSuccess(
          `Post ${action} successfully!`,
          `Your post has been ${action} and is now ${isDraft ? 'saved in drafts' : 'live on your blog'}.`
        );
        
        // Call onPostCreated if provided
        if (onPostCreated) {
          onPostCreated(updatedPost);
        }
        
        // Navigate back to dashboard or home
        window.history.back();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create post');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      setPendingNavigation(() => () => window.history.back());
      setShowUnsavedDialog(true);
      return;
    }
    window.history.back();
  };

  const handleConfirmLeave = () => {
    setShowUnsavedDialog(false);
    if (pendingNavigation) {
      pendingNavigation();
    }
  };

  const handleCancelLeave = () => {
    setShowUnsavedDialog(false);
    setPendingNavigation(null);
  };

  // If user is not logged in, show login message
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-lg">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Login Required</h3>
            <p className="text-gray-600 mb-6">You need to be logged in to create posts.</p>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              {loadingEdit ? 'Loading...' : (isEditing ? 'Edit Post' : 'Write New Post')}
            </h1>
          </div>
          {hasUnsavedChanges && (
            <span className="text-sm text-orange-600">• Unsaved changes</span>
          )}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleSubmit(true)}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Draft</span>
            </button>
            <button
              onClick={() => handleSubmit(false)}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Publishing...' : 'Publish'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-full">
        {/* Left Panel - Form */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-6 overflow-y-auto">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Loading overlay for editing */}
            {loadingEdit && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                  <p className="text-gray-600">Loading post for editing...</p>
                </div>
              </div>
            )}

            <div className="max-w-4xl mx-auto space-y-6">
              {/* Title */}
              <div>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter your post title..."
                  className="w-full text-3xl font-bold border-none outline-none placeholder-gray-400"
                  maxLength={200}
                />
              </div>

              {/* Category and Excerpt Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                    <input
                      type="text"
                      value={showCategoryDropdown ? categorySearch : selectedCategoryName || 'Select a category'}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      onFocus={() => setShowCategoryDropdown(true)}
                      placeholder="Search categories..."
                      className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer"
                      readOnly={!showCategoryDropdown}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {/* Dropdown */}
                    {showCategoryDropdown && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filteredCategories.length > 0 ? (
                          filteredCategories.map((category) => (
                            <button
                              key={category.id}
                              type="button"
                              onClick={() => handleCategorySelect(category.id, category.name)}
                              className="w-full text-left px-4 py-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium text-gray-900">{category.name}</div>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-gray-500 text-center">
                            {categories.length === 0 ? (
                              <div>
                                <div>No categories loaded</div>
                                <div className="text-xs mt-1">Total categories: {categories.length}</div>
                                <div className="text-xs">Check browser console for API errors</div>
                              </div>
                            ) : categorySearch ? (
                              <div>
                                <div>No categories match "{categorySearch}"</div>
                                <div className="text-xs mt-1">Available: {categories.length} categories</div>
                              </div>
                            ) : (
                              'Loading categories...'
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Click outside to close dropdown */}
                  {showCategoryDropdown && (
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => {
                        setShowCategoryDropdown(false);
                        setCategorySearch('');
                      }}
                    />
                  )}
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Featured Image URL
                  </label>
                  <div className="relative">
                    <ImageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="url"
                      name="image"
                      value={formData.image}
                      onChange={handleChange}
                      placeholder="https://example.com/image.jpg"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Excerpt
                </label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleChange}
                  placeholder="Brief description of your post..."
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  maxLength={300}
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="Write your post content here..."
                  rows="20"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-lg leading-relaxed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="w-96 bg-gray-50 border-l border-gray-200 p-6 overflow-y-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            {formData.title && (
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{formData.title}</h2>
            )}
            
            {formData.excerpt && (
              <p className="text-gray-600 mb-4 italic">{formData.excerpt}</p>
            )}
            
            {formData.image && (
              <img 
                src={formData.image} 
                alt="Featured" 
                className="w-full h-48 object-cover rounded-lg mb-4"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            )}
            
            {formData.content && (
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-800 whitespace-pre-wrap">{formData.content}</p>
              </div>
            )}
            
            {!formData.title && !formData.content && (
              <p className="text-gray-500 text-center py-8">Start writing to see a preview...</p>
            )}
          </div>

          {/* Writing as */}
          <div className="mt-6 p-4 bg-white rounded-lg shadow-sm">
            <p className="text-sm text-gray-500">
              Writing as <span className="font-medium text-gray-700">{user.username}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Unsaved Changes Alert Dialog */}
      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to leave? Your changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelLeave}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmLeave} className="bg-red-600 hover:bg-red-700">
              Leave without saving
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WritePage; 