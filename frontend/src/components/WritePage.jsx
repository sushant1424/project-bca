import React, { useState, useEffect } from 'react';
import { X, Save, Send, Image as ImageIcon, Tag, ArrowLeft } from 'lucide-react';

const WritePage = ({ isOpen, onClose, onPostCreated }) => {
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

  // Check if user is logged in
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/posts/categories/');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

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
      const response = await fetch('http://127.0.0.1:8000/api/posts/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          is_published: !isDraft
        })
      });

      if (response.ok) {
        const newPost = await response.json();
        setFormData({
          title: '',
          content: '',
          excerpt: '',
          image: '',
          category: ''
        });
        setHasUnsavedChanges(false);
        onClose();
        if (onPostCreated) {
          onPostCreated(newPost);
        }
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
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirmed) return;
    }
    onClose();
  };

  // If user is not logged in, show login message
  if (!user) {
    return (
      <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${isOpen ? 'block' : 'hidden'}`}>
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Login Required</h3>
            <p className="text-gray-600 mb-6">You need to be logged in to create posts.</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Write a Post</h1>
            {hasUnsavedChanges && (
              <span className="text-sm text-orange-600">• Unsaved changes</span>
            )}
          </div>
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
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
    </div>
  );
};

export default WritePage; 