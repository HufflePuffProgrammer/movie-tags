'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Film, Plus, Edit2, Trash2, Save, X, Search } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { createClient } from '@/lib/supabase-client';
import { Movie } from '@/types/movie';
import { Database } from '@/types/database';
import { SupabaseClient } from '@supabase/supabase-js';
import { useNotification } from '@/hooks/useNotification';

type MovieInsertPayload = Database['public']['Tables']['movies']['Insert'];
type MovieUpdatePayload = Database['public']['Tables']['movies']['Update'];

interface MovieFormData {
  title: string;
  description: string;
  director: string;
  release_date: string;
  genre: string;
  runtime_minutes: string;
  poster_url: string;
  imdb_id: string;
  tmdb_id: string;
}

export default function MoviesManagementPage() {
  const { user } = useAuth();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<MovieFormData>({
    title: '',
    description: '',
    director: '',
    release_date: '',
    genre: '',
    runtime_minutes: '',
    poster_url: '',
    imdb_id: '',
    tmdb_id: ''
  });
  const { notification, showSuccess, showError, setNotification } = useNotification();

  // Simple admin check
  const isAdmin = user?.email?.includes('admin') || user?.email === 'testuser02@email.com';

  useEffect(() => {
    if (isAdmin) {
      fetchMovies();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const supabase: SupabaseClient<Database> = createClient();
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMovies(data || []);
    } catch (error) {
      console.error('Error fetching movies:', error);
      showError('Failed to load movies');

    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      showError('Movie title is required');
      return;
    }

    try {
      const supabase: SupabaseClient<Database> = createClient();
      
      const movieInsert: MovieInsertPayload = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        director: formData.director.trim() || null,
        release_date: formData.release_date || null,
        genre: formData.genre.trim() || null,
        runtime_minutes: formData.runtime_minutes ? parseInt(formData.runtime_minutes) : null,
        poster_url: formData.poster_url.trim() || null,
        imdb_id: formData.imdb_id.trim() || null,
        tmdb_id: formData.tmdb_id ? parseInt(formData.tmdb_id) : null
      };

      if (editingMovie) {
        // Update existing movie
        const movieUpdate: MovieUpdatePayload = movieInsert;
        const { error } = await supabase
          .from('movies')
          .update(movieUpdate as never)
          .eq('id', editingMovie.id);

        if (error) throw error;

        showSuccess('Movie updated successfully');
      } else {
        // Create new movie
        const { error } = await supabase
          .from('movies')
          .insert([movieInsert] as never);

        if (error) throw error;

        showSuccess('Movie created successfully');
      }

      // Reset form and refresh data
      cancelEdit();
      fetchMovies();
    } catch (error) {
      console.error('Error saving movie:', error);
      showError('Failed to save movie');
    }
  };

  const handleDelete = async (movieId: number) => {
    if (!confirm('Are you sure you want to delete this movie? This will also remove all user tags, categories, and notes associated with it.')) {
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('movies')
        .delete()
        .eq('id', movieId);

      if (error) throw error;

      showSuccess('Movie deleted successfully');
      
      fetchMovies();
    } catch (error) {
      console.error('Error deleting movie:', error);
      showError('Failed to delete movie');
    }
  };

  const startEdit = (movie: Movie) => {
    setEditingMovie(movie);
    setFormData({
      title: movie.title,
      description: movie.description || '',
      director: movie.director || '',
      release_date: movie.release_date || '',
      genre: movie.genre || '',
      runtime_minutes: movie.runtime_minutes?.toString() || '',
      poster_url: movie.poster_url || '',
      imdb_id: movie.imdb_id || '',
      tmdb_id: movie.tmdb_id?.toString() || ''
    });
    setIsCreating(false);
  };

  const startCreate = () => {
    setIsCreating(true);
    setEditingMovie(null);
    setFormData({
      title: '',
      description: '',
      director: '',
      release_date: '',
      genre: '',
      runtime_minutes: '',
      poster_url: '',
      imdb_id: '',
      tmdb_id: ''
    });
  };

  const cancelEdit = () => {
    setEditingMovie(null);
    setIsCreating(false);
    setFormData({
      title: '',
      description: '',
      director: '',
      release_date: '',
      genre: '',
      runtime_minutes: '',
      poster_url: '',
      imdb_id: '',
      tmdb_id: ''
    });
  };

  const filteredMovies = movies.filter(movie => 
    movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (movie.director && movie.director.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (movie.genre && movie.genre.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
      {/* Header */}
      <header className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/admin" className="flex items-center gap-2 text-yellow-500 hover:text-yellow-400">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Admin</span>
            </Link>
            <div className="flex items-center gap-2">
              <Film className="w-6 h-6 text-yellow-500" />
              <h1 className="text-xl font-semibold">Movies Management</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {notification.message}
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Movies Management</h2>
          <p className="text-gray-600">Add, edit, and manage movie catalog.</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="max-w-md flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Search Movies
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, director, or genre..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={startCreate}
                className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-3 rounded-lg hover:bg-yellow-600 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Movie
              </button>
            </div>
          </div>
        </div>

        {/* Create/Edit Form */}
        {(isCreating || editingMovie) && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingMovie ? 'Edit Movie' : 'Add New Movie'}
              </h3>
              <button
                onClick={cancelEdit}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Director
                  </label>
                  <input
                    type="text"
                    value={formData.director}
                    onChange={(e) => setFormData({...formData, director: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Release Date
                  </label>
                  <input
                    type="date"
                    value={formData.release_date}
                    onChange={(e) => setFormData({...formData, release_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Genre
                  </label>
                  <input
                    type="text"
                    value={formData.genre}
                    onChange={(e) => setFormData({...formData, genre: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Runtime (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.runtime_minutes}
                    onChange={(e) => setFormData({...formData, runtime_minutes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Poster URL
                  </label>
                  <input
                    type="url"
                    value={formData.poster_url}
                    onChange={(e) => setFormData({...formData, poster_url: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {editingMovie ? 'Update Movie' : 'Create Movie'}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Movies List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Movies ({filteredMovies.length})
            </h3>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading movies...</p>
            </div>
          ) : filteredMovies.length === 0 ? (
            <div className="p-8 text-center">
              <Film className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No movies found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredMovies.map((movie) => (
                <div key={movie.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {movie.title}
                        </h4>
                        {movie.release_date && (
                          <span className="text-sm text-gray-500">
                            ({new Date(movie.release_date).getFullYear()})
                          </span>
                        )}
                      </div>
                      
                      {movie.description && (
                        <p className="text-gray-600 mb-3 line-clamp-2">
                          {movie.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        {movie.director && (
                          <span>Director: {movie.director}</span>
                        )}
                        {movie.genre && (
                          <span>Genre: {movie.genre}</span>
                        )}
                        {movie.runtime_minutes && (
                          <span>{movie.runtime_minutes} min</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => startEdit(movie)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit movie"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(movie.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete movie"
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
      </main>
    </div>
  );
}
