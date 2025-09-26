'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Tag, X, Search, Plus, Edit2, Trash2 } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  description: string | null;
  color: string;
  created_at: string;
}

interface CategoryUsage {
  [categoryId: number]: number;
}

interface CategoryStats {
  [categoryId: number]: {
    totalUsage: number;
    uniqueUsers: number;
    uniqueMovies: number;
    recentUsage: number; // Last 7 days
    topUsers: Array<{ userId: string; count: number; }>;
    popularMovies: Array<{ movieId: number; movieTitle: string; count: number; }>;
  };
}

export default function CategoriesManagementPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryUsage, setCategoryUsage] = useState<CategoryUsage>({});
  const [categoryStats, setCategoryStats] = useState<CategoryStats>({});
  const [showDetailedStats, setShowDetailedStats] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6'
  });
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // Simple admin check
  const isAdmin = user?.email?.includes('admin') || user?.email === 'testuser02@email.com';
  
  // Debug: Log user email for RLS troubleshooting
  console.log('Current user email for RLS:', user?.email);
  console.log('Is admin:', isAdmin);

  useEffect(() => {
    fetchCategories();
    fetchCategoryUsage();
    if (showDetailedStats) {
      fetchDetailedCategoryStats();
    }
  }, [showDetailedStats]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
        setNotification({
          type: 'error',
          message: 'Failed to load categories'
        });
      } else {
        setCategories(data || []);
      }
    } catch (error) {
      console.error('Categories fetch error:', error);
      setNotification({
        type: 'error',
        message: 'Failed to load categories'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryUsage = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('user_movie_categories')
        .select('category_id');

      if (error) {
        console.error('Error fetching category usage:', error);
        return;
      }

      const usage: CategoryUsage = {};
      data?.forEach((item: any) => {
        const categoryId = item.category_id;
        usage[categoryId] = (usage[categoryId] || 0) + 1;
      });

      setCategoryUsage(usage);
    } catch (error) {
      console.error('Category usage fetch error:', error);
    }
  };

  const fetchDetailedCategoryStats = async () => {
    try {
      const supabase = createClient();
      
      // Get detailed category usage with user and movie info
      const { data, error } = await supabase
        .from('user_movie_categories')
        .select(`
          category_id,
          user_id,
          movie_id,
          created_at,
          movies (
            id,
            title
          )
        `);

      if (error) {
        console.error('Error fetching detailed category stats:', error);
        return;
      }

      const stats: CategoryStats = {};
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      data?.forEach((item: any) => {
        const categoryId = item.category_id;
        const createdAt = new Date(item.created_at);
        
        if (!stats[categoryId]) {
          stats[categoryId] = {
            totalUsage: 0,
            uniqueUsers: 0,
            uniqueMovies: 0,
            recentUsage: 0,
            topUsers: [],
            popularMovies: []
          };
        }

        stats[categoryId].totalUsage++;
        
        // Count recent usage (last 7 days)
        if (createdAt >= sevenDaysAgo) {
          stats[categoryId].recentUsage++;
        }
      });

      // Calculate unique users and movies for each category
      data?.forEach((item: any) => {
        const categoryId = item.category_id;
        
        // Count unique users
        const userCounts: { [userId: string]: number } = {};
        const movieCounts: { [movieId: number]: { count: number; title: string } } = {};
        
        data?.filter((d: any) => d.category_id === categoryId).forEach((d: any) => {
          userCounts[d.user_id] = (userCounts[d.user_id] || 0) + 1;
          if (d.movies) {
            movieCounts[d.movie_id] = {
              count: (movieCounts[d.movie_id]?.count || 0) + 1,
              title: d.movies.title
            };
          }
        });

        stats[categoryId].uniqueUsers = Object.keys(userCounts).length;
        stats[categoryId].uniqueMovies = Object.keys(movieCounts).length;
        
        // Top users (limit to 5)
        stats[categoryId].topUsers = Object.entries(userCounts)
          .map(([userId, count]) => ({ userId, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
        
        // Popular movies (limit to 5)
        stats[categoryId].popularMovies = Object.entries(movieCounts)
          .map(([movieId, data]) => ({ 
            movieId: parseInt(movieId), 
            movieTitle: data.title, 
            count: data.count 
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
      });

      setCategoryStats(stats);
    } catch (error) {
      console.error('Detailed category stats fetch error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setNotification({
        type: 'error',
        message: 'Category name is required'
      });
      return;
    }

    if (formData.name.trim().length > 50) {
      setNotification({
        type: 'error',
        message: 'Category name must be 50 characters or less'
      });
      return;
    }

    if (editingCategory) {
      await handleUpdate();
    } else {
      await handleCreate();
    }
  };

  const handleCreate = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          color: formData.color
        } as any)
        .select();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          setNotification({
            type: 'error',
            message: 'A category with this name already exists'
          });
        } else {
          throw error;
        }
        return;
      }

      await fetchCategories();
      setFormData({ name: '', description: '', color: '#3B82F6' });
      setNotification({
        type: 'success',
        message: 'Category created successfully!'
      });

      // Clear localStorage cache to force refresh
      localStorage.removeItem('movie-categories');
      localStorage.removeItem('movie-categories-timestamp');
    } catch (error) {
      console.error('Error creating category:', error);
      setNotification({
        type: 'error',
        message: 'Failed to create category. Please try again.'
      });
    }
  };

  const handleUpdate = async () => {
    if (!editingCategory) return;

    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('categories')
        .update({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          color: formData.color
        } as any)
        .eq('id', editingCategory.id);

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          setNotification({
            type: 'error',
            message: 'A category with this name already exists'
          });
        } else {
          throw error;
        }
        return;
      }

      // Since the update doesn't return data, refresh from database
      await fetchCategories();
      
      setEditingCategory(null);
      setFormData({ name: '', description: '', color: '#3B82F6' });
      setNotification({
        type: 'success',
        message: 'Category updated successfully!'
      });

      // Clear localStorage cache to force refresh
      localStorage.removeItem('movie-categories');
      localStorage.removeItem('movie-categories-timestamp');
    } catch (error) {
      console.error('Error updating category:', error);
      setNotification({
        type: 'error',
        message: 'Failed to update category. Please try again.'
      });
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color
    });
  };

  const handleDelete = async (categoryId: number) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) {
        if (error.code === '23503') { // Foreign key constraint violation
          setNotification({
            type: 'error',
            message: 'Cannot delete category: it is being used by movies. Remove it from all movies first.'
          });
        } else {
          throw error;
        }
        return;
      }

      await fetchCategories();
      await fetchCategoryUsage();
      setNotification({
        type: 'success',
        message: 'Category deleted successfully!'
      });

      // Clear localStorage cache to force refresh
      localStorage.removeItem('movie-categories');
      localStorage.removeItem('movie-categories-timestamp');
    } catch (error) {
      console.error('Error deleting category:', error);
      setNotification({
        type: 'error',
        message: 'Failed to delete category. Please try again.'
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCategories.length === 0) {
      setNotification({
        type: 'error',
        message: 'Please select categories to delete'
      });
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedCategories.length} categories? This action cannot be undone.`)) {
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('categories')
        .delete()
        .in('id', selectedCategories);

      if (error) {
        if (error.code === '23503') { // Foreign key constraint violation
          setNotification({
            type: 'error',
            message: 'Cannot delete some categories: they are being used by movies. Remove them from all movies first.'
          });
        } else {
          throw error;
        }
        return;
      }

      await fetchCategories();
      await fetchCategoryUsage();
      setSelectedCategories([]);
      setNotification({
        type: 'success',
        message: `${selectedCategories.length} categories deleted successfully!`
      });

      // Clear localStorage cache to force refresh
      localStorage.removeItem('movie-categories');
      localStorage.removeItem('movie-categories-timestamp');
    } catch (error) {
      console.error('Error bulk deleting categories:', error);
      setNotification({
        type: 'error',
        message: 'Failed to delete categories. Please try again.'
      });
    }
  };

  const handleSelectAll = () => {
    if (selectedCategories.length === filteredCategories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(filteredCategories.map(cat => cat.id));
    }
  };

  const filteredCategories = categories.filter(category =>
    category && category.name && category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check admin access after all hooks
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <Link href="/admin" className="text-purple-600 hover:text-purple-700 font-medium">
            Back to Admin
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
          notification.type === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          <span className="font-medium">{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="ml-2 hover:bg-black/10 rounded-full p-0.5"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Header */}
      <header className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/admin" className="flex items-center gap-2 text-purple-500 hover:text-purple-400">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Admin</span>
            </Link>
            <div className="flex items-center gap-2">
              <Tag className="w-6 h-6 text-purple-500" />
              <h1 className="text-xl font-semibold">Categories Management</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Manage Movie Categories</h2>
          <p className="text-gray-600">Create, edit, and organize your movie categorization system.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="e.g., Action, Comedy, Drama"
                    maxLength={50}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.name.length}/50 characters</p>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Brief description of this category..."
                    rows={3}
                    maxLength={200}
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.description.length}/200 characters</p>
                </div>

                <div>
                  <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      id="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="#3B82F6"
                    />
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {editingCategory ? 'Update Category' : 'Create Category'}
                  </button>
                  
                  {editingCategory && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCategory(null);
                        setFormData({ name: '', description: '', color: '#3B82F6' });
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Categories List Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              {/* Search and Bulk Actions */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                    <div className="flex-1 max-w-md">
                      <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setShowDetailedStats(!showDetailedStats)}
                        className={`px-3 py-2 text-sm border rounded-md transition-colors ${
                          showDetailedStats 
                            ? 'bg-blue-500 text-white border-blue-500' 
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {showDetailedStats ? 'Hide Stats' : 'Show Detailed Stats'}
                      </button>
                      
                      <button
                        onClick={handleSelectAll}
                        className="px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                      >
                        {selectedCategories.length === filteredCategories.length ? 'Deselect All' : 'Select All'}
                      </button>
                      
                      {selectedCategories.length > 0 && (
                        <button
                          onClick={handleBulkDelete}
                          className="px-3 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
                        >
                          Delete Selected ({selectedCategories.length})
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Stats Summary */}
                  {showDetailedStats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {Object.values(categoryStats).reduce((sum, stat) => sum + stat.totalUsage, 0)}
                        </div>
                        <div className="text-sm text-gray-600">Total Usage</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {Object.values(categoryStats).reduce((sum, stat) => sum + stat.recentUsage, 0)}
                        </div>
                        <div className="text-sm text-gray-600">Last 7 Days</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {new Set(Object.values(categoryStats).flatMap(stat => stat.topUsers.map(u => u.userId))).size}
                        </div>
                        <div className="text-sm text-gray-600">Active Users</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {Object.values(categoryStats).reduce((sum, stat) => sum + stat.uniqueMovies, 0)}
                        </div>
                        <div className="text-sm text-gray-600">Categorized Movies</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Categories List */}
              <div className="p-6">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading categories...</p>
                  </div>
                ) : filteredCategories.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      {searchTerm ? 'No categories found matching your search.' : 'No categories yet. Create your first category!'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredCategories.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(category.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCategories([...selectedCategories, category.id]);
                              } else {
                                setSelectedCategories(selectedCategories.filter(id => id !== category.id));
                              }
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          
                          <div
                            className="w-4 h-4 rounded-full border border-gray-300"
                            style={{ backgroundColor: category.color }}
                          ></div>
                          
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{category.name}</h3>
                            {category.description && (
                              <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                            )}
                            
                            {/* Basic Stats */}
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                              <span>ID: {category.id}</span>
                              <span>Used: {categoryUsage[category.id] || 0} times</span>
                              <span>Created: {new Date(category.created_at).toLocaleDateString()}</span>
                            </div>
                            
                            {/* Detailed Stats */}
                            {showDetailedStats && categoryStats[category.id] && (
                              <div className="mt-3 p-3 bg-gray-50 rounded-md">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                  <div>
                                    <div className="font-medium text-blue-600">{categoryStats[category.id].totalUsage}</div>
                                    <div className="text-gray-500">Total Uses</div>
                                  </div>
                                  <div>
                                    <div className="font-medium text-green-600">{categoryStats[category.id].recentUsage}</div>
                                    <div className="text-gray-500">Last 7 Days</div>
                                  </div>
                                  <div>
                                    <div className="font-medium text-purple-600">{categoryStats[category.id].uniqueUsers}</div>
                                    <div className="text-gray-500">Unique Users</div>
                                  </div>
                                  <div>
                                    <div className="font-medium text-orange-600">{categoryStats[category.id].uniqueMovies}</div>
                                    <div className="text-gray-500">Unique Movies</div>
                                  </div>
                                </div>
                                
                                {/* Popular Movies */}
                                {categoryStats[category.id].popularMovies.length > 0 && (
                                  <div className="mt-3">
                                    <div className="text-xs font-medium text-gray-700 mb-1">Popular Movies:</div>
                                    <div className="flex flex-wrap gap-1">
                                      {categoryStats[category.id].popularMovies.slice(0, 3).map((movie) => (
                                        <span
                                          key={movie.movieId}
                                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                                        >
                                          {movie.movieTitle} ({movie.count})
                                        </span>
                                      ))}
                                      {categoryStats[category.id].popularMovies.length > 3 && (
                                        <span className="text-xs text-gray-500">
                                          +{categoryStats[category.id].popularMovies.length - 3} more
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(category)}
                            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(category.id)}
                            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
