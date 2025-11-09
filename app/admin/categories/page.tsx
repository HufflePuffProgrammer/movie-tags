'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { ArrowLeft, Tag, X, Search, Plus, Edit2, Trash2 } from 'lucide-react';
import { Database } from '@/types/database';
import { SupabaseClient } from '@supabase/supabase-js';

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

type CategoryInsert = Database['public']['Tables']['categories']['Insert'];
type CategoryUpdate = Database['public']['Tables']['categories']['Update'];
type CategoryUsageRow = Database['public']['Tables']['user_movie_categories']['Row'];

export default function CategoriesManagementPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryUsage, setCategoryUsage] = useState<CategoryUsage>({});
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6'
  });
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // Simple admin check
  const isAdmin = user?.email?.includes('admin') || user?.email === 'testuser02@email.com';

  useEffect(() => {
    fetchCategories();
    fetchCategoryUsage();
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const supabase: SupabaseClient<Database> = createClient();
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
      const supabase: SupabaseClient<Database> = createClient();
      const { data, error } = await supabase
        .from('user_movie_categories')
        .select('category_id');

      if (error) {
        console.error('Error fetching category usage:', error);
        return;
      }

      const usage: CategoryUsage = {};
      (data ?? []).forEach((item: Pick<CategoryUsageRow, 'category_id'>) => {
        if (item.category_id == null) return;
        usage[item.category_id] = (usage[item.category_id] || 0) + 1;
      });

      setCategoryUsage(usage);
    } catch (error) {
      console.error('Category usage fetch error:', error);
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
      const supabase: SupabaseClient<Database> = createClient();
      const payload: CategoryInsert = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        color: formData.color
      };
      const { error } = await supabase
        .from('categories')
        .insert(payload as never);

      if (error) {
        if (error.code === '23505') {
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
      setIsCreating(false);
      setFormData({ name: '', description: '', color: '#3B82F6' });
      setNotification({
        type: 'success',
        message: 'Category created successfully!'
      });

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
      const supabase: SupabaseClient<Database> = createClient();
      
      const updatePayload: CategoryUpdate = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        color: formData.color
      };

      const { error } = await supabase
        .from('categories')
        .update(updatePayload as never)
        .eq('id', editingCategory.id);

      if (error) {
        if (error.code === '23505') {
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
      
      setEditingCategory(null);
      setFormData({ name: '', description: '', color: '#3B82F6' });
      setNotification({
        type: 'success',
        message: 'Category updated successfully!'
      });

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

  const handleDelete = async (category: Category) => {
    if (!confirm(`Are you sure you want to delete "${category.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', category.id);

      if (error) {
        if (error.code === '23503') {
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
    if (selectedCategories.length === 0) return;

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
        if (error.code === '23503') {
          setNotification({
            type: 'error',
            message: 'Cannot delete some categories: they are being used by movies.'
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

  const startEdit = (category: Category) => {
    setEditingCategory(category);
    setIsCreating(false);
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color
    });
  };

  const startCreate = () => {
    setIsCreating(true);
    setEditingCategory(null);
    setFormData({ name: '', description: '', color: '#3B82F6' });
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setIsCreating(false);
    setFormData({ name: '', description: '', color: '#3B82F6' });
  };

  const handleCategorySelect = (categoryId: number) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCategories.length === filteredCategories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(filteredCategories.map(cat => cat.id));
    }
  };

  const filteredCategories = categories.filter(category => 
    category && category.name && (
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  );

  const predefinedColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ];

  // Access control check - moved after all hooks
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

        {/* Controls */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search categories..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-gray-900"
              />
            </div>

            {/* Add Button */}
            <button
              onClick={startCreate}
              disabled={isCreating || editingCategory !== null}
              className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Category
            </button>
          </div>

          {/* Bulk Actions */}
          {selectedCategories.length > 0 && (
            <div className="flex items-center gap-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <span className="text-red-800 font-medium">
                {selectedCategories.length} categories selected
              </span>
              <button
                onClick={handleBulkDelete}
                disabled={isCreating || editingCategory !== null}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete Selected
              </button>
            </div>
          )}
        </div>

        {/* Create/Edit Form */}
        {(isCreating || editingCategory) && (
          <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingCategory ? 'Edit Category' : 'Create New Category'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    placeholder="e.g., Action, Comedy, Drama"
                    maxLength={50}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.name.length}/50 characters</p>
                </div>

                <div>
                  <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      id="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                      placeholder="#3B82F6"
                    />
                  </div>
                  <div className="flex gap-1 mt-2">
                    {predefinedColors.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        className="w-6 h-6 rounded border-2 border-gray-300 hover:border-gray-400"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Brief description of this category..."
                  rows={3}
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 mt-1">{formData.description.length}/200 characters</p>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
                
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Categories List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading categories...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  All Categories ({filteredCategories.length})
                </h3>
                {filteredCategories.length > 0 && (
                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCategories.length === filteredCategories.length}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                    />
                    Select All
                  </label>
                )}
              </div>
            </div>
            
            {filteredCategories.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {searchQuery ? 'No categories match your search.' : 'No categories found. Create your first category!'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredCategories.map((category) => (
                  <div key={category.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category.id)}
                          onChange={() => handleCategorySelect(category.id)}
                          className="rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                        />
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900">{category.name}</h4>
                            {categoryUsage[category.id] && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {categoryUsage[category.id]} use{categoryUsage[category.id] !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                          {category.description && (
                            <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEdit(category)}
                          disabled={isCreating || editingCategory !== null}
                          className="p-2 text-gray-400 hover:text-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Edit category"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category)}
                          disabled={isCreating || editingCategory !== null}
                          className="p-2 text-gray-400 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{categories.length}</div>
              <div className="text-sm text-gray-600">Total Categories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {Object.values(categoryUsage).reduce((sum, count) => sum + count, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Usage</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {Object.keys(categoryUsage).length}
              </div>
              <div className="text-sm text-gray-600">Categories in Use</div>
            </div>
          </div>
        </div>

        {/* Most Used Categories */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Used Categories</h3>
          {Object.keys(categoryUsage).length === 0 ? (
            <div className="text-center py-8">
              <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No category usage data yet. Categories will appear here once users start categorizing movies.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {categories
                .filter(category => categoryUsage[category.id] > 0)
                .sort((a, b) => (categoryUsage[b.id] || 0) - (categoryUsage[a.id] || 0))
                .slice(0, 10)
                .map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{category.name}</h4>
                        {category.description && (
                          <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-lg font-semibold text-purple-600">
                          {categoryUsage[category.id]}
                        </div>
                        <div className="text-xs text-gray-500">
                          {categoryUsage[category.id] === 1 ? 'use' : 'uses'}
                        </div>
                      </div>
                      
                     
                    </div>
                  </div>
                ))}
              
              {categories.filter(category => categoryUsage[category.id] > 0).length > 10 && (
                <div className="text-center pt-4">
                  <p className="text-sm text-gray-500">
                    Showing top 10 of {categories.filter(category => categoryUsage[category.id] > 0).length} used categories
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
