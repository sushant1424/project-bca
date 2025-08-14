import React, { useState, useEffect, useRef, useCallback } from 'react';
import AddUserModal from './AddUserModal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { useToast } from '../context/ToastContext';
import { 
  Users, 
  FileText, 
  MessageSquare, 
  Eye, 
  Heart, 
  TrendingUp, 
  Calendar,
  Search,
  Filter,
  Edit,
  Trash2,
  Plus,
  BarChart3,
  Activity,
  Tag,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

// CommentManagement Component
const CommentManagement = ({ users, posts, comments, searchTerm, setSearchTerm, currentPage, setCurrentPage, itemsPerPage, searchInputRef, showSuccess, showError }) => {
  const [localComments, setLocalComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const totalPages = Math.ceil(localComments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedComments = localComments.slice(startIndex, startIndex + itemsPerPage);

  // Fetch comments on component mount
  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) return;
      const baseURL = 'http://127.0.0.1:8000';
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Token ${adminToken}`
      };

      const response = await fetch(`${baseURL}/api/posts/comments/`, { headers });
      if (response.ok) {
        const data = await response.json();
        const commentsArray = data.results || data || [];
        setLocalComments(commentsArray);
      } else {
        console.error('Failed to fetch comments:', response.status);
        setLocalComments(comments || []);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      setLocalComments(comments || []);
    } finally {
      setLoading(false);
    }
  };

  const deleteComment = async (commentId) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) return;
      const baseURL = 'http://127.0.0.1:8000';
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Token ${adminToken}`
      };

      const response = await fetch(`${baseURL}/api/posts/comments/${commentId}/`, {
        method: 'DELETE',
        headers
      });

      if (response.ok) {
        setLocalComments(localComments.filter(comment => comment.id !== commentId));
        showSuccess('Success', 'Comment deleted successfully!');
      } else {
        showError('Error', 'Failed to delete comment. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      showError('Error', 'Error deleting comment. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading comments...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Comment Management</h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search comments..."
              defaultValue={searchTerm}
              onInput={(e) => {
                const query = e.target.value;
                clearTimeout(window.adminCommentSearchTimeout);
                window.adminCommentSearchTimeout = setTimeout(() => {
                  setSearchTerm(query);
                  setCurrentPage(1);
                  // Filter comments locally
                  if (query) {
                    const filtered = (comments || []).filter(comment => 
                      comment.content?.toLowerCase().includes(query.toLowerCase()) ||
                      comment.author?.username?.toLowerCase().includes(query.toLowerCase())
                    );
                    setLocalComments(filtered);
                  } else {
                    fetchComments();
                  }
                }, 500);
              }}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200"
            />
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-medium">Comment</th>
                  <th className="text-left p-4 font-medium">Made By</th>
                  <th className="text-left p-4 font-medium">Author</th>
                  <th className="text-left p-4 font-medium">Post</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedComments.map((comment) => {
                  return (
                    <tr key={comment.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="max-w-xs">
                          <p className="text-sm text-gray-900 truncate">
                            {comment.content || 'No content'}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs">
                            {(comment.author_name || 'U')[0]?.toUpperCase()}
                          </div>
                          <span className="text-sm">
                            {comment.author_name || 'Unknown User'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                            {(comment.author_email || 'U')[0]?.toUpperCase()}
                          </div>
                          <span className="text-sm">
                            {comment.author_email || 'Unknown Author'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="max-w-xs">
                          <p className="text-sm text-gray-900 truncate">
                            {comment.post_title || 'Unknown Post'}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <button
                                  className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                                  disabled={false}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this comment? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteComment(comment.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete Comment
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this comment? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteComment(comment.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <div className="text-sm text-gray-500">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, localComments.length)} of {localComments.length} comments
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// CategoryManagement Component
const CategoryManagement = ({ categories, searchTerm, setSearchTerm, currentPage, setCurrentPage, itemsPerPage, searchInputRef, showSuccess, showError }) => {
  const [localCategories, setLocalCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [totalCategories, setTotalCategories] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Fetch categories on component mount and when page changes
  useEffect(() => {
    fetchCategories(currentPage, searchTerm);
  }, [currentPage]);

  const fetchCategories = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) return;
      const baseURL = 'http://127.0.0.1:8000';
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Token ${adminToken}`
      };

      const url = `${baseURL}/api/posts/categories/?page=${page}&search=${search}`;
      const response = await fetch(url, { headers });
      if (response.ok) {
        const data = await response.json();
        const categoriesArray = data.results || data || [];
        setLocalCategories(categoriesArray);
        setTotalCategories(data.count || categoriesArray.length);
        setTotalPages(Math.ceil((data.count || categoriesArray.length) / itemsPerPage));
      } else {
        console.error('Failed to fetch categories:', response.status);
        setLocalCategories(categories || []);
        setTotalCategories(0);
        setTotalPages(0);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setLocalCategories(categories || []);
      setTotalCategories(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async () => {
    if (!newCategoryName.trim()) {
      showError('Error', 'Category name is required.');
      return;
    }

    try {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) return;
      const baseURL = 'http://127.0.0.1:8000';
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Token ${adminToken}`
      };

      const response = await fetch(`${baseURL}/api/posts/categories/`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: newCategoryName.trim() })
      });

      if (response.ok) {
        const newCategory = await response.json();
        // Refresh the category list to get the latest data
        await fetchCategories();
        setNewCategoryName('');
        setShowCreateModal(false);
        // Reset pagination to first page to show the new category
        setCurrentPage(1);
        showSuccess('Success', 'Category created successfully!');
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Category creation error:', errorData);
        console.error('Full error details:', JSON.stringify(errorData, null, 2));
        
        let errorMessage = 'Failed to create category';
        if (errorData.name && Array.isArray(errorData.name)) {
          errorMessage = `Name: ${errorData.name[0]}`;
        } else if (errorData.slug && Array.isArray(errorData.slug)) {
          errorMessage = `Slug: ${errorData.slug[0]}`;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.non_field_errors && Array.isArray(errorData.non_field_errors)) {
          errorMessage = errorData.non_field_errors[0];
        }
        
        showError('Error', errorMessage);
      }
    } catch (error) {
      console.error('Error creating category:', error);
      showError('Error', 'Error creating category. Please try again.');
    }
  };

  const updateCategory = async (categoryId, newName) => {
    if (!newName.trim()) {
      showError('Error', 'Category name is required.');
      return;
    }

    try {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) return;
      const baseURL = 'http://127.0.0.1:8000';
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Token ${adminToken}`
      };

      const response = await fetch(`${baseURL}/api/posts/categories/${categoryId}/`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ name: newName.trim() })
      });

      if (response.ok) {
        const updatedCategory = await response.json();
        setLocalCategories(localCategories.map(cat => 
          cat.id === categoryId ? updatedCategory : cat
        ));
        setEditingCategory(null);
        showSuccess('Success', 'Category updated successfully!');
      } else {
        showError('Error', 'Failed to update category. Please try again.');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      showError('Error', 'Error updating category. Please try again.');
    }
  };

  const deleteCategory = async (categoryId) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) return;
      const baseURL = 'http://127.0.0.1:8000';
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Token ${adminToken}`
      };

      const response = await fetch(`${baseURL}/api/posts/categories/${categoryId}/`, {
        method: 'DELETE',
        headers
      });

      if (response.ok) {
        // Refresh the category list to get the latest data
        await fetchCategories();
        // Reset pagination to first page after deletion
        setCurrentPage(1);
        showSuccess('Success', 'Category deleted successfully!');
      } else {
        showError('Error', 'Failed to delete category. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      showError('Error', 'Error deleting category. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading categories...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Category Management</h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search categories..."
              defaultValue={searchTerm}
              onInput={(e) => {
                const query = e.target.value;
                clearTimeout(window.adminCategorySearchTimeout);
                window.adminCategorySearchTimeout = setTimeout(() => {
                  setSearchTerm(query);
                  setCurrentPage(1);
                  // Use backend search with pagination
                  fetchCategories(1, query);
                }, 500);
              }}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200"
            />
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-medium">Name</th>
                  <th className="text-left p-4 font-medium">Posts Count</th>
                  <th className="text-left p-4 font-medium">Created</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {localCategories.map((category) => (
                  <tr key={category.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {editingCategory === category.id ? (
                        <input
                          type="text"
                          defaultValue={category.name}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              updateCategory(category.id, e.target.value);
                            } else if (e.key === 'Escape') {
                              setEditingCategory(null);
                            }
                          }}
                          onBlur={(e) => updateCategory(category.id, e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          autoFocus
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">{category.name}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {category.posts_count || 0}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {new Date(category.created_at || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setEditingCategory(category.id)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit Category"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-red-600 hover:text-red-800"
                              title="Delete Category"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Category</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this category? This action cannot be undone and may affect posts using this category.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteCategory(category.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <div className="text-sm text-gray-500">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCategories)} of {totalCategories} categories
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Category Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
            <DialogDescription>
              Add a new category for organizing posts.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Name
              </label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Enter category name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    createCategory();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={createCategory}>
              Create Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const AdminDashboard = ({ adminUser }) => {
  const { showSuccess, showError } = useToast();
  const [stats, setStats] = useState({});
  const [dashboardStats, setDashboardStats] = useState({}); // Real-time dashboard stats
  const [users, setUsers] = useState([]); // Initialize users state as empty array
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [userStats, setUserStats] = useState({}); // Add userStats state
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [editingUser, setEditingUser] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [currentUserPage, setCurrentUserPage] = useState(1);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserData, setNewUserData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    is_staff: false
  });
  
  // Sorting state
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc'
  });
  
  // User/Admin tab state
  const [userViewTab, setUserViewTab] = useState('all'); // 'all', 'users', 'admins'

  // Fetch dashboard stats on component mount and set up auto-refresh
  useEffect(() => {
    // Initial fetch
    fetchDashboardStats();
    
    // Set up auto-refresh every 30 seconds
    const statsInterval = setInterval(() => {
      fetchDashboardStats();
    }, 30000);
    
    return () => {
      clearInterval(statsInterval);
    };
  }, []);

  // Handle admin logout confirmation
  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  // Pagination handlers
  const handleUserPageChange = (newPage) => {
    setCurrentUserPage(newPage);
  };

  const handleUserPrevPage = () => {
    if (currentUserPage > 1) {
      setCurrentUserPage(currentUserPage - 1);
    }
  };

  const handleUserNextPage = () => {
    if (currentUserPage < totalPages) {
      setCurrentUserPage(currentUserPage + 1);
    }
  };

  // Handle admin logout
  const handleAdminLogout = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      if (adminToken) {
        // Only logout the admin token, don't affect user session
        await fetch('http://127.0.0.1:8000/api/auth/logout/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${adminToken}`,
          },
        });
      }
    } catch (error) {
      console.error('Admin logout error:', error);
    } finally {
      // Only clear admin-specific data, leave user session intact
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      
      showSuccess('Success', 'Admin logged out successfully!');
      
      // Redirect to admin login page, not home
      setTimeout(() => {
        window.location.href = '/admin';
      }, 1000);
    }
  };

  // Sorting functions
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="h-4 w-4 text-blue-600" />
      : <ArrowDown className="h-4 w-4 text-blue-600" />;
  };

  const sortData = (data, key, direction) => {
    if (!key) return data;
    
    return [...data].sort((a, b) => {
      let aValue = a[key];
      let bValue = b[key];
      
      // Handle nested properties
      if (key.includes('.')) {
        const keys = key.split('.');
        aValue = keys.reduce((obj, k) => obj?.[k], a);
        bValue = keys.reduce((obj, k) => obj?.[k], b);
      }
      
      // Handle different data types
      if (key === 'date_joined' || key === 'created_at') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (aValue < bValue) {
        return direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    fetchAdminData();
  }, []);

  useEffect(() => {
    fetchUsers(currentUserPage, '');
  }, [currentUserPage]);

  // Fetch users with pagination
  const fetchUsers = async (page = 1, search = '') => {
    try {
      const adminToken = localStorage.getItem('adminToken'); // Use admin token
      const baseURL = 'http://127.0.0.1:8000';
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Token ${adminToken}`
      };

      // Use the correct users list endpoint
      const endpoint = `${baseURL}/api/auth/users/?page=${page}&search=${search}`;

      console.log(`Fetching users from: ${endpoint}`);
      
      const response = await fetch(endpoint, { headers });
      if (response.ok) {
        const data = await response.json();
        console.log('Users API response:', data);
        const usersArray = data.results || data || [];
        setUsers(Array.isArray(usersArray) ? usersArray : []);
        setTotalUsers(data.count || usersArray.length);
        
        // Update pagination info
        const totalPagesCount = Math.ceil((data.count || 0) / itemsPerPage);
        setTotalPages(totalPagesCount);
        
        console.log(`Loaded ${usersArray.length} users, total: ${data.count}, pages: ${totalPagesCount}`);
      } else {
        console.error(`Users API returned ${response.status}:`, response.statusText);
        setUsers([]);
        setTotalUsers(0);
        setTotalPages(0);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
      setTotalUsers(0);
      setTotalPages(0);
    }
  };

  // Create new user
  const createUser = async (userData) => {
    try {
      // Validate required fields
      if (!userData.username.trim() || !userData.email.trim() || !userData.password.trim()) {
        showError('Error', 'Please fill in all required fields (username, email, password)');
        return;
      }

      const token = localStorage.getItem('adminToken');
      const requestData = {
        username: userData.username.trim(),
        email: userData.email.trim(),
        first_name: userData.first_name.trim(),
        last_name: userData.last_name.trim(),
        password: userData.password,
        confirm_password: userData.password,
        is_staff: userData.is_staff
      };
      
      console.log('Sending signup request with data:', requestData);
      
      const response = await fetch('http://127.0.0.1:8000/api/auth/signup/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${adminToken}`
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess('Success', `User '${userData.username}' created successfully!`);
        
        // Close modal
        setShowAddUserModal(false);
        
        // Refresh users list
        fetchUsers(currentPage, searchTerm);
      } else {
        console.error('Signup error response:', data);
        console.error('Detailed errors:', data.errors);
        
        // Extract specific error messages
        let errorMessages = [];
        if (data.errors) {
          Object.keys(data.errors).forEach(field => {
            const fieldErrors = Array.isArray(data.errors[field]) ? data.errors[field] : [data.errors[field]];
            fieldErrors.forEach(error => {
              errorMessages.push(`${field}: ${error}`);
            });
          });
        }
        
        const errorMessage = errorMessages.length > 0 
          ? errorMessages.join('\n') 
          : data.message || data.error || 'Failed to create user';
        
        showError('Error', errorMessage);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      showError('Error', 'Failed to create user. Please try again.');
    }
  };



  // Stable handler for user data changes
  const handleUserDataChange = useCallback((field, value) => {
    setNewUserData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Fetch posts with pagination and author information
  const fetchPosts = async (page = 1, search = '') => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        console.error('No admin token found');
        return;
      }
      const baseURL = 'http://127.0.0.1:8000';
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Token ${adminToken}`
      };

      const response = await fetch(`${baseURL}/api/posts/?page=${page}&search=${search}`, { headers });
      if (response.ok) {
        const data = await response.json();
        const postsArray = data.results || data || [];
        
        // Debug: Log the first post to see what data we're getting
        if (postsArray.length > 0) {
          console.log('Sample post data from API:', postsArray[0]);
        }
        
        // Ensure each post has proper author information
        const postsWithAuthors = postsArray.map(post => {
          // Debug: Log status fields for each post
          console.log(`Post "${post.title}" - is_published: ${post.is_published}, status: ${post.status}`);
          
          // Determine status based on is_published field from API
          const postStatus = post.is_published === true ? 'published' : 'draft';
          
          console.log(`Final status for "${post.title}": ${postStatus}`);
          
          return {
            ...post,
            // Keep author object as-is since it comes from UserSerializer
            // Use the determined status
            status: postStatus,
            // Ensure numeric fields
            views: parseInt(post.views) || 0,
            like_count: parseInt(post.like_count) || 0
          };
        });
        
        setPosts(postsWithAuthors);
        setTotalPosts(data.count || postsWithAuthors.length);
      } else {
        console.error('Failed to fetch posts:', response.status, response.statusText);
        setPosts([]);
        setTotalPosts(0);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
      setTotalPosts(0);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) return;
      const baseURL = 'http://127.0.0.1:8000';
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Token ${adminToken}`
      };

      const response = await fetch(`${baseURL}/api/posts/categories/`, { headers });
      if (response.ok) {
        const data = await response.json();
        const categoriesArray = data.results || data || [];
        setCategories(categoriesArray);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  // Fetch real-time dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        console.error('No admin token found');
        return;
      }
      const baseURL = 'http://127.0.0.1:8000';
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Token ${adminToken}`
      };

      const response = await fetch(`${baseURL}/api/posts/admin/dashboard-stats/`, { headers });
      if (response.ok) {
        const data = await response.json();
        setDashboardStats(data);
      } else {
        console.error('Failed to fetch dashboard stats:', response.status);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  // CRUD Operations for Users
  const [userToDelete, setUserToDelete] = useState(null);

  const deleteUser = async (userId) => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('adminToken'); // Use admin token
      const baseURL = 'http://127.0.0.1:8000';
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      };

      const response = await fetch(`${baseURL}/api/auth/users/${userId}/delete/`, {
        method: 'DELETE',
        headers
      });

      if (response.ok) {
        // Refresh data after successful deletion
        await fetchUsers(currentPage, searchTerm);
        await fetchPosts(currentPage, searchTerm);
        showSuccess('Success', 'User deleted successfully!');
        setUserToDelete(null);
      } else {
        showError('Error', 'Failed to delete user. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      showError('Error', 'Error deleting user. Please try again.');
    }
    setIsDeleting(false);
  };

  const updateUserStatus = async (userId, isActive) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) return;
      const baseURL = 'http://127.0.0.1:8000';
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Token ${adminToken}`
      };

      const response = await fetch(`${baseURL}/api/users/${userId}/`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ is_active: !isActive })
      });

      if (response.ok) {
        // Refresh data after successful update
        await fetchUsers(currentPage, searchTerm);
        alert(`User ${!isActive ? 'activated' : 'deactivated'} successfully!`);
      } else {
        alert('Failed to update user status. Please try again.');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Error updating user status. Please try again.');
    }
  };



  // CRUD Operations for Posts
  const deletePost = async (postId) => {
    setIsDeleting(true);
    try {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) return;
      const baseURL = 'http://127.0.0.1:8000';
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Token ${adminToken}`
      };

      const response = await fetch(`${baseURL}/api/posts/${postId}/`, {
        method: 'DELETE',
        headers
      });

      if (response.ok) {
        // Refresh data after successful deletion
        await fetchPosts(currentPage, searchTerm);
        await fetchUsers(currentPage, searchTerm); // Refresh to update user post counts
        showSuccess('Success', 'Post deleted successfully!');
      } else {
        showError('Error', 'Failed to delete post. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      showError('Error', 'Error deleting post. Please try again.');
    }
    setIsDeleting(false);
  };

  const updatePostStatus = async (postId, currentStatus) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) return;
      const baseURL = 'http://127.0.0.1:8000';
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Token ${adminToken}`
      };

      const newStatus = currentStatus === 'published' ? 'draft' : 'published';
      const updateData = {
        status: newStatus,
        is_published: newStatus === 'published'
      };

      const response = await fetch(`${baseURL}/api/posts/${postId}/`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        // Refresh data after successful update
        await fetchPosts(currentPage, searchTerm);
        showSuccess('Success', `Post ${newStatus === 'published' ? 'published' : 'moved to draft'} successfully!`);
      } else {
        showError('Error', 'Failed to update post status. Please try again.');
      }
    } catch (error) {
      console.error('Error updating post status:', error);
      showError('Error', 'Error updating post status. Please try again.');
    }
  };

  // Handle pagination changes
  const handlePageChange = async (newPage) => {
    setCurrentPage(newPage);
    if (activeTab === 'users') {
      await fetchUsers(newPage, searchTerm);
    } else if (activeTab === 'posts') {
      await fetchPosts(newPage, searchTerm);
    }
  };

  // Search is now handled directly in each component like navbar

  // Fetch admin data
  const fetchAdminData = async () => {
    setLoading(true);
    await Promise.all([
      fetchUsers(currentPage, searchTerm),
      fetchPosts(currentPage, searchTerm),
      fetchCategories()
    ]);
    
    // Calculate stats from fetched data
    const calculatedStats = {
      total_users: totalUsers,
      total_posts: totalPosts,
      published_posts: posts.filter(p => p.status === 'published' || p.is_published).length,
      total_views: posts.reduce((sum, post) => sum + (post.views || 0), 0),
      total_likes: posts.reduce((sum, post) => sum + (post.like_count || 0), 0)
    };
    setStats(calculatedStats);
    setLoading(false);
  };

  const StatCard = ({ title, value, icon: Icon, trend, color = "blue" }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 text-${color}-600`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );

  const UserManagement = React.memo(() => {
    // Filter users based on selected tab
    const getFilteredUsers = () => {
      if (userViewTab === 'admins') {
        return users.filter(user => user.is_superuser || user.is_staff);
      } else if (userViewTab === 'users') {
        return users.filter(user => !user.is_superuser && !user.is_staff);
      }
      return users; // 'all' tab
    };
    
    const filteredUsers = getFilteredUsers();
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
            <p className="text-sm text-gray-600 mt-1">
              {userViewTab === 'admins' ? 'Admin Users' : 
               userViewTab === 'users' ? 'Regular Users' : 
               'All Users'} ({filteredUsers.length} total)
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search users..."
                defaultValue={searchTerm}
                onInput={(e) => {
                  const query = e.target.value;
                  // Debounce search to avoid too many calls
                  clearTimeout(window.adminUserSearchTimeout);
                  window.adminUserSearchTimeout = setTimeout(() => {
                    setSearchTerm(query); // Update state for persistence
                    setCurrentPage(1);
                    fetchUsers(1, query);
                  }, 500);
                }}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200"
              />
            </div>

          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => {
              setUserViewTab('all');
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              userViewTab === 'all'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Users ({users.length})
          </button>
          <button
            onClick={() => {
              setUserViewTab('users');
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              userViewTab === 'users'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Regular Users ({users.filter(u => !u.is_superuser && !u.is_staff).length})
          </button>
          <button
            onClick={() => {
              setUserViewTab('admins');
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              userViewTab === 'admins'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Admin Users ({users.filter(u => u.is_superuser || u.is_staff).length})
          </button>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      <button 
                        onClick={() => handleSort('username')}
                        className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                      >
                        User
                        {getSortIcon('username')}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      <button 
                        onClick={() => handleSort('posts_count')}
                        className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                      >
                        Posts
                        {getSortIcon('posts_count')}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      <button 
                        onClick={() => handleSort('saved_posts_count')}
                        className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                      >
                        Saved
                        {getSortIcon('saved_posts_count')}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      <button 
                        onClick={() => handleSort('is_active')}
                        className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                      >
                        Status
                        {getSortIcon('is_active')}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      <button 
                        onClick={() => handleSort('date_joined')}
                        className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                      >
                        Joined
                        {getSortIcon('date_joined')}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    // Use backend data directly - no need for client-side calculation
                    // Backend now provides posts_count and saved_posts_count
                    
                    // Apply sorting directly to filtered users
                    const sortedUsers = sortData(filteredUsers, sortConfig.key, sortConfig.direction);
                    
                    return sortedUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                            {(user.first_name || user.username)[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{user.username}</span>
                              {user.is_staff && (
                                <Badge variant="default" className="text-xs bg-blue-100 text-blue-800">
                                  Admin
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-900">
                          {posts.filter(p => {
                            // Handle both cases: p.author as object or as ID
                            const authorId = typeof p.author === 'object' ? p.author.id : p.author;
                            return authorId === user.id;
                          }).length}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-900">
                          {user.saved_posts_count || 0}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => updateUserStatus(user.id, user.is_active)}
                          className="cursor-pointer"
                        >
                          <Badge variant={user.is_active ? "default" : "secondary"}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-900">
                          {(() => {
                            if (user.date_joined) {
                              try {
                                const date = new Date(user.date_joined);
                                if (!isNaN(date.getTime())) {
                                  return date.toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  });
                                }
                              } catch (error) {
                                console.error('Error parsing date:', user.date_joined, error);
                              }
                            }
                            return 'Not available';
                          })()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                disabled={isDeleting}
                                title="Delete User"
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete User</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete user "{user.username}"? This action cannot be undone and will permanently remove all their posts and data.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteUser(user.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete User
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ));
                  })()}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <div className="text-sm text-gray-500">
                  Showing {((currentUserPage - 1) * itemsPerPage) + 1} to {Math.min(currentUserPage * itemsPerPage, totalUsers)} of {totalUsers} users
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleUserPrevPage}
                    disabled={currentUserPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {currentUserPage} of {totalPages}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleUserNextPage}
                    disabled={currentUserPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>


      </div>
    );
  });

  const PostManagement = () => {
    // Backend pagination - no need to filter on frontend
    const totalPages = Math.ceil(totalPosts / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Post Management</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search posts by title..."
                defaultValue={searchTerm}
                onInput={(e) => {
                  const query = e.target.value;
                  // Debounce search to avoid too many calls
                  clearTimeout(window.adminPostSearchTimeout);
                  window.adminPostSearchTimeout = setTimeout(() => {
                    setSearchTerm(query); // Update state for persistence
                    setCurrentPage(1);
                    fetchPosts(1, query);
                  }, 500);
                }}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200"
              />
            </div>
          </div>
        </div>
      
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-medium">
                    <button 
                      onClick={() => handleSort('title')}
                      className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                    >
                      Title
                      {getSortIcon('title')}
                    </button>
                  </th>
                  <th className="text-left p-4 font-medium">
                    <button 
                      onClick={() => handleSort('author.username')}
                      className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                    >
                      Author
                      {getSortIcon('author.username')}
                    </button>
                  </th>
                  <th className="text-left p-4 font-medium">
                    <button 
                      onClick={() => handleSort('category.name')}
                      className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                    >
                      Category
                      {getSortIcon('category.name')}
                    </button>
                  </th>
                  <th className="text-left p-4 font-medium">
                    <button 
                      onClick={() => handleSort('views')}
                      className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                    >
                      Views
                      {getSortIcon('views')}
                    </button>
                  </th>
                  <th className="text-left p-4 font-medium">
                    <button 
                      onClick={() => handleSort('likes')}
                      className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                    >
                      Likes
                      {getSortIcon('likes')}
                    </button>
                  </th>
                  <th className="text-left p-4 font-medium">
                    <button 
                      onClick={() => handleSort('is_published')}
                      className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                    >
                      Status
                      {getSortIcon('is_published')}
                    </button>
                  </th>
                  <th className="text-left p-4 font-medium">
                    <button 
                      onClick={() => handleSort('saved_count')}
                      className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                    >
                      Saved
                      {getSortIcon('saved_count')}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  // Apply sorting to posts
                  const sortedPosts = sortData(posts, sortConfig.key, sortConfig.direction);
                  
                  return sortedPosts.map((post) => {
                  const author = users.find(u => u.id === post.author);
                  const category = categories.find(c => c.id === post.category);
                  const postStatus = post.status; // Use the status already determined in fetchPosts
                  
                  return (
                    <tr key={post.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium">{post.title}</div>
                        <div className="text-sm text-gray-500">{new Date(post.created_at).toLocaleDateString()}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                            {(post.author?.username || post.author?.first_name || `User${post.author?.id || post.author}`)[0]?.toUpperCase()}
                          </div>
                          <span className="text-sm">
                            {post.author?.username || `User${post.author?.id || post.author}`}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">
                          {category?.name || 'Uncategorized'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Eye className="h-3 w-3" />
                          <span>{post.views || 0}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Heart className="h-3 w-3" />
                          <span>{post.like_count || 0}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => updatePostStatus(post.id, postStatus)}
                          className="cursor-pointer"
                        >
                          <Badge variant={postStatus === 'published' ? "default" : "secondary"}>
                            {postStatus === 'published' ? "Published" : "Draft"}
                          </Badge>
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <span className="text-gray-900 font-medium">
                            {post.saved_count || 0}
                          </span>
                          <span className="text-xs text-gray-500">
                            {(post.saved_count || 0) === 1 ? 'save' : 'saves'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                  });
                })()}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <div className="text-sm text-gray-500">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, totalPosts)} of {totalPosts} posts
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    );
  };

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Users" 
          value={dashboardStats.total_users || 0} 
          icon={Users} 
          trend={dashboardStats.users_trend || 0}
          color="blue"
        />
        <StatCard 
          title="Total Posts" 
          value={dashboardStats.total_posts || 0} 
          icon={FileText} 
          trend={dashboardStats.posts_trend || 0}
          color="green"
        />
        <StatCard 
          title="Total Categories" 
          value={dashboardStats.total_categories || 0} 
          icon={Tag} 
          trend={dashboardStats.categories_trend || 0}
          color="purple"
        />
        <StatCard 
          title="Total Comments" 
          value={dashboardStats.total_comments || 0} 
          icon={MessageSquare} 
          trend={dashboardStats.comments_trend || 0}
          color="blue"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(dashboardStats.recent_users || [])
                .map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                      {user.username?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-sm">
                        {user.username}
                      </div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {user.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'Unknown'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🚀 Admin Dashboard</h1>
            <p className="text-gray-600">Manage your Wrytera platform - Welcome, {adminUser.username} ({adminUser.is_superuser ? 'Superuser' : 'Staff'})</p>
          </div>
          <button
            onClick={handleLogoutClick}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'users', label: 'Users', icon: Users },
                { id: 'posts', label: 'Posts', icon: FileText },
                { id: 'comments', label: 'Comments', icon: MessageSquare },
                { id: 'categories', label: 'Categories', icon: Tag },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'posts' && <PostManagement />}
          {activeTab === 'comments' && (
            <CommentManagement 
              users={users}
              posts={posts}
              comments={comments}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              itemsPerPage={itemsPerPage}
              searchInputRef={searchInputRef}
              showSuccess={showSuccess}
              showError={showError}
            />
          )}
          {activeTab === 'categories' && (
            <CategoryManagement 
              categories={categories}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              itemsPerPage={itemsPerPage}
              searchInputRef={searchInputRef}
              showSuccess={showSuccess}
              showError={showError}
            />
          )}
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout from the admin panel? You will need to login again to access admin features.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAdminLogout} className="bg-red-600 hover:bg-red-700">
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDashboard;
