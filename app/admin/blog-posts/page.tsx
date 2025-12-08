'use client'

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, Eye, EyeOff, Check, X, Trash2, Search, ExternalLink, Globe, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { createClient } from '@supabase/supabase-js';
import { useNotification } from '@/hooks/useNotification';

// Create untyped client to avoid TS issues with movie_blog_posts table
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

interface BlogPost {
  id: number;
  user_id: string;
  movie_id: number;
  slug: string;
  title: string;
  meta_description: string | null;
  is_public: boolean;
  admin_approved: boolean;
  view_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  movie_title?: string;
  user_name?: string;
  full_name?: string;
}

type FilterStatus = 'all' | 'approved' | 'pending' | 'hidden';

export default function BlogPostsManagementPage() {
  const { user } = useAuth();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [selectedPosts, setSelectedPosts] = useState<number[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const { notification, showSuccess, showError, setNotification } = useNotification();

  const supabase = useMemo(() => createClient(supabaseUrl, supabaseKey), []);

  // Simple admin check
  const isAdmin = user?.email?.includes('admin') || user?.email === 'testuser02@email.com';

  const fetchBlogPosts = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch blog posts
      const { data: posts, error: postsError } = await supabase
        .from('movie_blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      if (!posts || posts.length === 0) {
        setBlogPosts([]);
        return;
      }

      // Get unique movie IDs and user IDs
      const movieIds = [...new Set(posts.map(p => p.movie_id))];
      const userIds = [...new Set(posts.map(p => p.user_id))];

      // Fetch movies
      const { data: movies } = await supabase
        .from('movies')
        .select('id, title')
        .in('id', movieIds);

      // Fetch profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, user_name, full_name')
        .in('id', userIds);

      // Create lookup maps
      const movieMap = new Map((movies || []).map(m => [m.id, m.title]));
      const profileMap = new Map((profiles || []).map(p => [p.id, { user_name: p.user_name, full_name: p.full_name }]));

      // Transform the data
      const transformedData: BlogPost[] = posts.map((post) => ({
        ...post,
        movie_title: movieMap.get(post.movie_id) || 'Unknown Movie',
        user_name: profileMap.get(post.user_id)?.user_name || 'Unknown',
        full_name: profileMap.get(post.user_id)?.full_name || 'Unknown User',
      }));

      setBlogPosts(transformedData);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchBlogPosts();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification, setNotification]);

  const handleToggleApproval = async (post: BlogPost) => {
    try {
      const newStatus = !post.admin_approved;
      
      const { error } = await supabase
        .from('movie_blog_posts')
        .update({ admin_approved: newStatus, updated_at: new Date().toISOString() })
        .eq('id', post.id);

      if (error) throw error;

      setBlogPosts(prev => prev.map(p => 
        p.id === post.id ? { ...p, admin_approved: newStatus } : p
      ));

      showSuccess(newStatus ? 'Blog post approved' : 'Blog post hidden');
    } catch (error) {
      console.error('Error updating approval:', error);
      showError('Failed to update approval status');
    }
  };

  const handleTogglePublic = async (post: BlogPost) => {
    try {
      const newStatus = !post.is_public;
      
      const { error } = await supabase
        .from('movie_blog_posts')
        .update({ is_public: newStatus, updated_at: new Date().toISOString() })
        .eq('id', post.id);

      if (error) throw error;

      setBlogPosts(prev => prev.map(p => 
        p.id === post.id ? { ...p, is_public: newStatus } : p
      ));

      showSuccess(newStatus ? 'Blog post made public' : 'Blog post made private');
    } catch (error) {
      console.error('Error updating public status:', error);
      showError('Failed to update public status');
    }
  };

  const handleDelete = async (post: BlogPost) => {
    if (!confirm(`Are you sure you want to delete "${post.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('movie_blog_posts')
        .delete()
        .eq('id', post.id);

      if (error) throw error;

      setBlogPosts(prev => prev.filter(p => p.id !== post.id));
      showSuccess('Blog post deleted successfully');
    } catch (error) {
      console.error('Error deleting blog post:', error);
      showError('Failed to delete blog post');
    }
  };

  const handleBulkApprove = async () => {
    if (selectedPosts.length === 0) return;
    
    setBulkActionLoading(true);
    try {
      const { error } = await supabase
        .from('movie_blog_posts')
        .update({ admin_approved: true, updated_at: new Date().toISOString() })
        .in('id', selectedPosts);

      if (error) throw error;

      setBlogPosts(prev => prev.map(p => 
        selectedPosts.includes(p.id) ? { ...p, admin_approved: true } : p
      ));
      setSelectedPosts([]);
      showSuccess(`${selectedPosts.length} post(s) approved`);
    } catch (error) {
      console.error('Error bulk approving:', error);
      showError('Failed to approve posts');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkHide = async () => {
    if (selectedPosts.length === 0) return;
    
    setBulkActionLoading(true);
    try {
      const { error } = await supabase
        .from('movie_blog_posts')
        .update({ admin_approved: false, updated_at: new Date().toISOString() })
        .in('id', selectedPosts);

      if (error) throw error;

      setBlogPosts(prev => prev.map(p => 
        selectedPosts.includes(p.id) ? { ...p, admin_approved: false } : p
      ));
      setSelectedPosts([]);
      showSuccess(`${selectedPosts.length} post(s) hidden`);
    } catch (error) {
      console.error('Error bulk hiding:', error);
      showError('Failed to hide posts');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPosts.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedPosts.length} post(s)? This action cannot be undone.`)) {
      return;
    }

    setBulkActionLoading(true);
    try {
      const { error } = await supabase
        .from('movie_blog_posts')
        .delete()
        .in('id', selectedPosts);

      if (error) throw error;

      setBlogPosts(prev => prev.filter(p => !selectedPosts.includes(p.id)));
      setSelectedPosts([]);
      showSuccess(`${selectedPosts.length} post(s) deleted`);
    } catch (error) {
      console.error('Error bulk deleting:', error);
      showError('Failed to delete posts');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedPosts.length === filteredPosts.length) {
      setSelectedPosts([]);
    } else {
      setSelectedPosts(filteredPosts.map(p => p.id));
    }
  };

  const handlePostSelect = (postId: number) => {
    setSelectedPosts(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  // Filter posts
  const filteredPosts = blogPosts.filter(post => {
    // Search filter
    const matchesSearch = 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.movie_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.full_name?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Status filter
    switch (filterStatus) {
      case 'approved':
        return post.admin_approved && post.is_public;
      case 'pending':
        return post.is_public && !post.admin_approved;
      case 'hidden':
        return !post.admin_approved || !post.is_public;
      default:
        return true;
    }
  });

  // Statistics
  const stats = {
    total: blogPosts.length,
    public: blogPosts.filter(p => p.is_public && p.admin_approved).length,
    pending: blogPosts.filter(p => p.is_public && !p.admin_approved).length,
    hidden: blogPosts.filter(p => !p.admin_approved || !p.is_public).length,
    totalViews: blogPosts.reduce((sum, p) => sum + p.view_count, 0),
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Access control check
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
              <FileText className="w-6 h-6 text-yellow-500" />
              <h1 className="text-xl font-semibold">Blog Posts Management</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Posts</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-green-600">{stats.public}</div>
            <div className="text-sm text-gray-600">Public</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-red-600">{stats.hidden}</div>
            <div className="text-sm text-gray-600">Hidden</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.totalViews}</div>
            <div className="text-sm text-gray-600">Total Views</div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, movie, or author..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500 text-gray-900"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Filter:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-yellow-500 focus:border-yellow-500"
              >
                <option value="all">All Posts</option>
                <option value="approved">Public & Approved</option>
                <option value="pending">Pending Approval</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedPosts.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium text-gray-700">
                  {selectedPosts.length} selected:
                </span>
                <button
                  onClick={handleBulkApprove}
                  disabled={bulkActionLoading}
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  Approve
                </button>
                <button
                  onClick={handleBulkHide}
                  disabled={bulkActionLoading}
                  className="flex items-center gap-1 px-3 py-1.5 bg-yellow-500 text-white rounded-lg text-sm hover:bg-yellow-600 disabled:opacity-50"
                >
                  <EyeOff className="w-4 h-4" />
                  Hide
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={bulkActionLoading}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Blog Posts List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Blog Posts ({filteredPosts.length})
              </h3>
              {filteredPosts.length > 0 && (
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedPosts.length === filteredPosts.length && filteredPosts.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
                  />
                  Select All
                </label>
              )}
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading blog posts...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchQuery || filterStatus !== 'all' 
                  ? 'No blog posts match your filters.' 
                  : 'No blog posts found.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredPosts.map((post) => (
                <div key={post.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedPosts.includes(post.id)}
                      onChange={() => handlePostSelect(post.id)}
                      className="mt-1 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
                    />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 truncate">
                            {post.movie_title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            By {post.full_name} (@{post.user_name})
                          </p>
                          {post.meta_description && (
                            <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                              {post.meta_description}
                            </p>
                          )}
                        </div>

                        {/* Status Badges */}
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-2">
                            {post.is_public ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                <Globe className="w-3 h-3" />
                                Public
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                <Lock className="w-3 h-3" />
                                Private
                              </span>
                            )}
                            {post.admin_approved ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <Check className="w-3 h-3" />
                                Approved
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <EyeOff className="w-3 h-3" />
                                Hidden
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {post.view_count} views
                            </span>
                            <span>Created: {formatDate(post.created_at)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-4">
                        <Link
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View
                        </Link>
                        <button
                          onClick={() => handleToggleApproval(post)}
                          className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg ${
                            post.admin_approved
                              ? 'text-yellow-600 hover:bg-yellow-50'
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                        >
                          {post.admin_approved ? (
                            <>
                              <EyeOff className="w-4 h-4" />
                              Hide
                            </>
                          ) : (
                            <>
                              <Check className="w-4 h-4" />
                              Approve
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleTogglePublic(post)}
                          className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg ${
                            post.is_public
                              ? 'text-gray-600 hover:bg-gray-50'
                              : 'text-blue-600 hover:bg-blue-50'
                          }`}
                        >
                          {post.is_public ? (
                            <>
                              <Lock className="w-4 h-4" />
                              Make Private
                            </>
                          ) : (
                            <>
                              <Globe className="w-4 h-4" />
                              Make Public
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(post)}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

