import React, { useState, useEffect } from 'react';
import { X, Save, Send, Image as ImageIcon, Tag, ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import SubstackEditor from './SubstackEditor';
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
    imageCredit: '',
    categories: [], // Changed from single category to multiple categories
    is_premium: false,
    premium_preview: ''
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
  // Image upload state
  const [imageUploadType, setImageUploadType] = useState('url');
  const [selectedFile, setSelectedFile] = useState(null);
  // Multi-category selection state
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

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
          category: post.category?.id || '',
          is_premium: post.is_premium || false,
          premium_preview: post.premium_preview || ''
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
          category: post.category?.id || '',
          is_premium: post.is_premium || false,
          premium_preview: post.premium_preview || ''
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

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      setSelectedFile(file);
      // For now, we'll create a local URL for preview
      // In production, you'd upload to a cloud service like AWS S3, Cloudinary, etc.
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          image: e.target.result // This is a data URL for preview
        }));
      };
      reader.readAsDataURL(file);
      setError(''); // Clear any previous errors
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

  // Handle multiple category selection
  const handleCategorySelect = (categoryId, categoryName) => {
    const categoryExists = selectedCategories.find(cat => cat.id === categoryId);
    if (!categoryExists) {
      const newCategory = { id: categoryId, name: categoryName };
      const updatedCategories = [...selectedCategories, newCategory];
      setSelectedCategories(updatedCategories);
      setFormData(prev => ({ ...prev, categories: updatedCategories.map(cat => cat.id) }));
      setHasUnsavedChanges(true);
    }
    setCategorySearch('');
  };

  // Remove category from selection
  const handleRemoveCategory = (categoryId) => {
    const updatedCategories = selectedCategories.filter(cat => cat.id !== categoryId);
    setSelectedCategories(updatedCategories);
    setFormData(prev => ({ ...prev, categories: updatedCategories.map(cat => cat.id) }));
    setHasUnsavedChanges(true);
  };

  // Create new category
  const handleCreateCategory = async (categoryName) => {
    if (!categoryName.trim()) return;
    
    setIsCreatingCategory(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/api/posts/categories/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: categoryName.trim() })
      });

      if (response.ok) {
        const newCategory = await response.json();
        setCategories(prev => [...prev, newCategory]);
        handleCategorySelect(newCategory.id, newCategory.name);
        showSuccess(`Category "${newCategory.name}" created successfully!`);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to create category');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      setError('Failed to create category');
    } finally {
      setIsCreatingCategory(false);
    }
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
                {/* Categories - Multi-select with custom creation */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categories
                  </label>
                  
                  {/* Selected Categories Tags */}
                  {selectedCategories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {selectedCategories.map((category) => (
                        <span
                          key={category.id}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800 border border-purple-200"
                        >
                          {category.name}
                          <button
                            type="button"
                            onClick={() => handleRemoveCategory(category.id)}
                            className="ml-2 text-purple-600 hover:text-purple-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                    <input
                      type="text"
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      onFocus={() => setShowCategoryDropdown(true)}
                      placeholder="Search or create categories..."
                      className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                        {/* Create new category option */}
                        {categorySearch && !filteredCategories.some(cat => cat.name.toLowerCase() === categorySearch.toLowerCase()) && (
                          <button
                            type="button"
                            onClick={() => handleCreateCategory(categorySearch)}
                            disabled={isCreatingCategory}
                            className="w-full text-left px-4 py-3 hover:bg-green-50 focus:bg-green-50 focus:outline-none border-b border-gray-100 text-green-700 font-medium"
                          >
                            {isCreatingCategory ? (
                              <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                                Creating "{categorySearch}"...
                              </div>
                            ) : (
                              `+ Create "${categorySearch}"`
                            )}
                          </button>
                        )}
                        
                        {/* Existing categories */}
                        {filteredCategories.length > 0 ? (
                          filteredCategories.map((category) => {
                            const isSelected = selectedCategories.some(cat => cat.id === category.id);
                            return (
                              <button
                                key={category.id}
                                type="button"
                                onClick={() => handleCategorySelect(category.id, category.name)}
                                className={`w-full text-left px-4 py-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0 ${
                                  isSelected ? 'bg-purple-50 text-purple-700' : 'text-gray-900'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">{category.name}</span>
                                  {isSelected && <span className="text-purple-600">✓</span>}
                                </div>
                              </button>
                            );
                          })
                        ) : categorySearch && !isCreatingCategory ? (
                          <div className="px-4 py-3 text-gray-500 text-center">
                            No categories match "{categorySearch}"
                          </div>
                        ) : !categorySearch ? (
                          <div className="px-4 py-3 text-gray-500 text-center">
                            {categories.length === 0 ? 'No categories available' : 'Start typing to search categories'}
                          </div>
                        ) : null}
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

              {/* Premium Content Settings */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center space-x-3 mb-3">
                  <input
                    type="checkbox"
                    id="is_premium"
                    name="is_premium"
                    checked={formData.is_premium}
                    onChange={handleChange}
                    className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                  />
                  <label htmlFor="is_premium" className="text-sm font-medium text-gray-700">
                    Make this a premium post
                  </label>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Premium
                  </span>
                </div>
                
                {formData.is_premium && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Premium Preview Text
                    </label>
                    <textarea
                      name="premium_preview"
                      value={formData.premium_preview}
                      onChange={handleChange}
                      placeholder="Enter a preview text that non-premium users will see..."
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      maxLength={300}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This preview will be shown to non-premium users before they're prompted to upgrade.
                    </p>
                  </div>
                )}
              </div>

              {/* Content - Modern Rich Text Editor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <SubstackEditor
                  value={formData.content}
                  onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                  placeholder="Tell your story..."
                />
              </div>
            </div>
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