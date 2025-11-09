'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Tag, Plus, Edit2, Trash2, Save, X, Search } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { createClient } from '@/lib/supabase-client';
import { Database } from '@/types/database';
import { SupabaseClient } from '@supabase/supabase-js';

type Tag = Database['public']['Tables']['tags']['Row'];
type TagInsert = Database['public']['Tables']['tags']['Insert'];
type TagUpdate = Database['public']['Tables']['tags']['Update'];
type TagUsageRow = Database['public']['Tables']['user_movie_tags']['Row'];

interface TagFormData {
  name: string;
  description: string;
  color: string;
}

export default function TagsManagementPage() {
  const { user } = useAuth();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [tagUsage, setTagUsage] = useState<Record<number, number>>({});
  const [formData, setFormData] = useState<TagFormData>({
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
    fetchTags();
    fetchTagUsage();
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const supabase: SupabaseClient<Database> = createClient();
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name');

      if (error) throw error;
      setTags(data || []);
    } catch (error) {
      console.error('Error fetching tags:', error);
      setNotification({
        type: 'error',
        message: 'Failed to load tags'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTagUsage = async () => {
    try {
      const supabase: SupabaseClient<Database> = createClient();
      const { data, error } = await supabase
        .from('user_movie_tags')
        .select('tag_id')
        .order('tag_id');

      if (error) throw error;

      // Count usage for each tag
      const usage: Record<number, number> = {};
      (data ?? []).forEach((item: Pick<TagUsageRow, 'tag_id'>) => {
        if (item.tag_id == null) return;
        usage[item.tag_id] = (usage[item.tag_id] || 0) + 1;
      });
      
      setTagUsage(usage);
    } catch (error) {
      console.error('Error fetching tag usage:', error);
    }
  };

  const validateTagName = (name: string, excludeId?: number): string | null => {
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      return 'Tag name is required';
    }
    
    if (trimmedName.length < 2) {
      return 'Tag name must be at least 2 characters';
    }
    
    if (trimmedName.length > 50) {
      return 'Tag name must be less than 50 characters';
    }
    
    // Check for duplicates
    const existingTag = tags.find(tag => 
      tag.name.toLowerCase() === trimmedName.toLowerCase() && 
      tag.id !== excludeId
    );
    
    if (existingTag) {
      return 'A tag with this name already exists';
    }
    
    return null;
  };

  const handleCreate = async () => {
    const validationError = validateTagName(formData.name);
    if (validationError) {
      setNotification({
        type: 'error',
        message: validationError
      });
      return;
    }

    try {
      const supabase: SupabaseClient<Database> = createClient();
      const payload: TagInsert = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        color: formData.color
      };
      const { data, error } = await supabase
        .from('tags')
        .insert(payload as never)
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          setNotification({
            type: 'error',
            message: 'A tag with this name already exists'
          });
        } else {
          throw error;
        }
        return;
      }

      setTags(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      setIsCreating(false);
      setFormData({ name: '', description: '', color: '#3B82F6' });
      setNotification({
        type: 'success',
        message: 'Tag created successfully!'
      });

      // Clear localStorage cache to force refresh
      localStorage.removeItem('movie-tags');
      localStorage.removeItem('movie-tags-timestamp');
    } catch (error) {
      console.error('Error creating tag:', error);
      setNotification({
        type: 'error',
        message: 'Failed to create tag. Please try again.'
      });
    }
  };

  const handleUpdate = async () => {
    if (!editingTag) return;
    
    const validationError = validateTagName(formData.name, editingTag.id);
    if (validationError) {
      setNotification({
        type: 'error',
        message: validationError
      });
      return;
    }

    try {
      const supabase: SupabaseClient<Database> = createClient();
      // First, let's verify the tag exists
      const { data: existingTag } = await supabase
        .from('tags')
        .select('*')
        .eq('id', editingTag.id)
        .single();
      
      console.log('Existing tag before update:', existingTag);
      
      const updatePayload: TagUpdate = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        color: formData.color
      };

      const { data, error } = await supabase
        .from('tags')
        .update(updatePayload as never)
        .eq('id', editingTag.id)
        .select();
        
        console.log('Update response:', { data, error });
        console.log('Editing tag ID:', editingTag.id);
        console.log('Form data being sent:', {
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          color: formData.color
        });
        
        // Check if the update actually worked by fetching the tag again
        const { data: updatedTag } = await supabase
          .from('tags')
          .select('*')
          .eq('id', editingTag.id)
          .single();
        
        console.log('Tag after update attempt:', updatedTag);
      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          setNotification({
            type: 'error',
            message: 'A tag with this name already exists'
          });
        } else if (error.code === 'PGRST116') { // No rows found
          setNotification({
            type: 'error',
            message: 'Tag not found. It may have been deleted by another user.'
          });
          // Refresh the tags list
          fetchTags();
        } else {
          throw error;
        }
        return;
      }

      // Since the update doesn't return data, refresh from database
      await fetchTags();
      
      setEditingTag(null);
      setFormData({ name: '', description: '', color: '#3B82F6' });
      setNotification({
        type: 'success',
        message: 'Tag updated successfully!'
      });

      // Clear localStorage cache to force refresh
      localStorage.removeItem('movie-tags');
      localStorage.removeItem('movie-tags-timestamp');
      localStorage.removeItem('movie-categories');
      localStorage.removeItem('movie-categories-timestamp');
    } catch (error) {
      console.error('Error updating tag:', error);
      setNotification({
        type: 'error',
        message: 'Failed to update tag. Please try again.'
      });
    }
  };

  const handleDelete = async (tag: Tag) => {
    const usage = tagUsage[tag.id] || 0;
    const confirmMessage = usage > 0 
      ? `"${tag.name}" is used in ${usage} movie(s). Deleting it will remove it from all movies. This action cannot be undone. Continue?`
      : `Are you sure you want to delete "${tag.name}"? This action cannot be undone.`;
      
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', tag.id);

      if (error) {
        if (error.code === '23503') { // Foreign key constraint
          setNotification({
            type: 'error',
            message: 'Cannot delete tag: it is currently in use by movies.'
          });
        } else {
          throw error;
        }
        return;
      }

      setTags(prev => prev.filter(t => t.id !== tag.id));
      setTagUsage(prev => {
        const newUsage = { ...prev };
        delete newUsage[tag.id];
        return newUsage;
      });
      
      setNotification({
        type: 'success',
        message: 'Tag deleted successfully!'
      });

      // Clear localStorage cache to force refresh
      localStorage.removeItem('movie-tags');
      localStorage.removeItem('movie-tags-timestamp');
    } catch (error) {
      console.error('Error deleting tag:', error);
      setNotification({
        type: 'error',
        message: 'Failed to delete tag. Please try again.'
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTags.length === 0) return;
    
    const totalUsage = selectedTags.reduce((sum, tagId) => sum + (tagUsage[tagId] || 0), 0);
    
    const confirmMessage = totalUsage > 0
      ? `Delete ${selectedTags.length} tag(s)? This will remove them from ${totalUsage} movie assignment(s). This action cannot be undone.`
      : `Delete ${selectedTags.length} selected tag(s)? This action cannot be undone.`;
      
    if (!confirm(confirmMessage)) {
      return;
    }

    setBulkDeleteLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('tags')
        .delete()
        .in('id', selectedTags);

      if (error) throw error;

      setTags(prev => prev.filter(tag => !selectedTags.includes(tag.id)));
      setTagUsage(prev => {
        const newUsage = { ...prev };
        selectedTags.forEach(tagId => delete newUsage[tagId]);
        return newUsage;
      });
      setSelectedTags([]);
      
      setNotification({
        type: 'success',
        message: `${selectedTags.length} tag(s) deleted successfully!`
      });

      // Clear localStorage cache to force refresh
      localStorage.removeItem('movie-tags');
      localStorage.removeItem('movie-tags-timestamp');
    } catch (error) {
      console.error('Error bulk deleting tags:', error);
      setNotification({
        type: 'error',
        message: 'Failed to delete some tags. They may be in use by movies.'
      });
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedTags.length === filteredTags.length) {
      setSelectedTags([]);
    } else {
      setSelectedTags(filteredTags.map(tag => tag.id));
    }
  };

  const handleTagSelect = (tagId: number) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const startEdit = (tag: Tag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      description: tag.description || '',
      color: tag.color
    });
    setIsCreating(false);
  };

  const startCreate = () => {
    setIsCreating(true);
    setEditingTag(null);
    setFormData({ name: '', description: '', color: '#3B82F6' });
  };

  const cancelEdit = () => {
    setEditingTag(null);
    setIsCreating(false);
    setFormData({ name: '', description: '', color: '#3B82F6' });
  };

  const filteredTags = tags.filter(tag => 
    tag && tag.name && (
      tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tag.description && tag.description.toLowerCase().includes(searchQuery.toLowerCase()))
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
          <Link href="/admin" className="text-yellow-600 hover:text-yellow-700 font-medium">
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
            <Link href="/admin" className="flex items-center gap-2 text-yellow-500 hover:text-yellow-400">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Admin</span>
            </Link>
            <div className="flex items-center gap-2">
              <Tag className="w-6 h-6 text-yellow-500" />
              <h1 className="text-xl font-semibold">Tags Management</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Manage Story Tags</h2>
          <p className="text-gray-600">Create, edit, and organize your storytelling analysis tags.</p>
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
                placeholder="Search tags..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500 text-gray-900"
              />
            </div>

            {/* Add Button */}
            <button
              onClick={startCreate}
              disabled={isCreating || editingTag !== null}
              className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-black px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add New Tag
            </button>
          </div>

          {/* Bulk Actions */}
          {selectedTags.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">
                  {selectedTags.length} tag(s) selected
                </span>
                <button
                  onClick={handleBulkDelete}
                  disabled={bulkDeleteLoading}
                  className="flex items-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  {bulkDeleteLoading ? 'Deleting...' : 'Delete Selected'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Create/Edit Form */}
        {(isCreating || editingTag) && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {isCreating ? 'Create New Tag' : 'Edit Tag'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tag Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Character Development"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <div className="flex gap-1">
                    {predefinedColors.map(color => (
                      <button
                        key={color}
                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                        className={`w-6 h-6 rounded border-2 ${
                          formData.color === color ? 'border-gray-800' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this tag represents..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500 text-gray-900"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={isCreating ? handleCreate : handleUpdate}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                <Save className="w-4 h-4" />
                {isCreating ? 'Create Tag' : 'Update Tag'}
              </button>
              <button
                onClick={cancelEdit}
                className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Tags List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading tags...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  All Tags ({filteredTags.length})
                </h3>
                {filteredTags.length > 0 && (
                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedTags.length === filteredTags.length}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
                    />
                    Select All
                  </label>
                )}
              </div>
            </div>
            
            {filteredTags.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {searchQuery ? 'No tags match your search.' : 'No tags found. Create your first tag!'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredTags.map((tag) => (
                  <div key={tag.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedTags.includes(tag.id)}
                          onChange={() => handleTagSelect(tag.id)}
                          className="rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
                        />
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900">{tag.name}</h4>
                            {tagUsage[tag.id] && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {tagUsage[tag.id]} use{tagUsage[tag.id] !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                          {tag.description && (
                            <p className="text-sm text-gray-600 mt-1">{tag.description}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEdit(tag)}
                          disabled={isCreating || editingTag !== null}
                          className="p-2 text-gray-400 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Edit tag"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(tag)}
                          disabled={isCreating || editingTag !== null}
                          className="p-2 text-gray-400 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete tag"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-yellow-600">{tags.length}</div>
              <div className="text-sm text-gray-600">Total Tags</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {tags.filter(t => t.description).length}
              </div>
              <div className="text-sm text-gray-600">With Descriptions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {Object.keys(tagUsage).length}
              </div>
              <div className="text-sm text-gray-600">Used in Movies</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {Object.values(tagUsage).reduce((sum, count) => sum + count, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Usages</div>
            </div>
          </div>
          
          {/* Most Used Tags */}
          {Object.keys(tagUsage).length > 0 && (
            <div className="mt-6">
              <h4 className="text-md font-medium text-gray-900 mb-3">Most Used Tags</h4>
              <div className="space-y-2">
                {Object.entries(tagUsage)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                  .map(([tagIdStr, count]) => {
                    const tagId = parseInt(tagIdStr);
                    const tag = tags.find(t => t.id === tagId);
                    if (!tag) return null;
                    
                    return (
                      <div key={tagId} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: tag.color }}
                          />
                          <span className="text-sm font-medium text-gray-900">{tag.name}</span>
                        </div>
                        <span className="text-sm text-gray-600">{count} use{count !== 1 ? 's' : ''}</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
