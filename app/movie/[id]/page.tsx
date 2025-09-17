'use client'

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Star, Clock, Calendar, Film, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-client';
import { useAuth } from '@/contexts/auth-context';

interface Movie {
  id: number;
  title: string;
  description: string | null;
  release_date: string | null;
  poster_url: string | null;
  genre: string | null;
  director: string | null;
  runtime_minutes: number | null;
  imdb_id: string | null;
  tmdb_id: number | null;
}

interface UserTag {
  id: number;
  tag_name: string;
  color?: string;
}

interface UserCategory {
  id: number;
  category_name: string;
  color?: string;
}

interface UserNote {
  id: number;
  content: string;
  created_at: string;
}

export default function MovieDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const movieId = params.id as string;

  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [userTags, setUserTags] = useState<UserTag[]>([]);
  const [userCategories, setUserCategories] = useState<UserCategory[]>([]);
  const [userNotes, setUserNotes] = useState<UserNote[]>([]);
  const [newTag, setNewTag] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newNote, setNewNote] = useState('');
  const [showAddTag, setShowAddTag] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);

  useEffect(() => {
    if (movieId) {
      fetchMovieDetails();
      if (user) {
        fetchUserPersonalization();
      }
    }
  }, [movieId, user]);

  const fetchMovieDetails = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .eq('id', movieId)
        .single();

      if (error) {
        console.error('Error fetching movie:', error);
        router.push('/');
      } else {
        setMovie(data);
      }
    } catch (error) {
      console.error('Error fetching movie:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPersonalization = async () => {
    // For now, we'll use mock data since we haven't implemented the full personalization tables yet
    // This will be replaced with actual Supabase queries once we expand the schema
    setUserTags([
      { id: 1, tag_name: 'male rear nudity', color: 'bg-blue-100 text-blue-800' },
      { id: 2, tag_name: 'cat', color: 'bg-green-100 text-green-800' },
      { id: 3, tag_name: 'new york city', color: 'bg-purple-100 text-purple-800' },
      { id: 4, tag_name: 'male nudity', color: 'bg-red-100 text-red-800' },
      { id: 5, tag_name: 'psychological thriller', color: 'bg-orange-100 text-orange-800' }
    ]);
    
    setUserCategories([
      { id: 1, category_name: 'Comedy', color: 'bg-yellow-100 text-yellow-800' },
      { id: 2, category_name: 'Crime', color: 'bg-red-100 text-red-800' },
      { id: 3, category_name: 'Thriller', color: 'bg-gray-100 text-gray-800' }
    ]);

    setUserNotes([
      { 
        id: 1, 
        content: 'Great character development and unexpected plot twists. The cinematography really captures the gritty atmosphere of 90s NYC.',
        created_at: '2024-01-15T10:30:00Z'
      }
    ]);
  };

  const addTag = async () => {
    if (!newTag.trim()) return;
    
    // Mock implementation - will be replaced with Supabase call
    const newTagObj: UserTag = {
      id: Date.now(),
      tag_name: newTag.trim(),
      color: 'bg-blue-100 text-blue-800'
    };
    
    setUserTags([...userTags, newTagObj]);
    setNewTag('');
    setShowAddTag(false);
  };

  const removeTag = async (tagId: number) => {
    setUserTags(userTags.filter(tag => tag.id !== tagId));
  };

  const addCategory = async () => {
    if (!newCategory.trim()) return;
    
    const newCategoryObj: UserCategory = {
      id: Date.now(),
      category_name: newCategory.trim(),
      color: 'bg-green-100 text-green-800'
    };
    
    setUserCategories([...userCategories, newCategoryObj]);
    setNewCategory('');
    setShowAddCategory(false);
  };

  const removeCategory = async (categoryId: number) => {
    setUserCategories(userCategories.filter(category => category.id !== categoryId));
  };

  const addNote = async () => {
    if (!newNote.trim()) return;
    
    const newNoteObj: UserNote = {
      id: Date.now(),
      content: newNote.trim(),
      created_at: new Date().toISOString()
    };
    
    setUserNotes([...userNotes, newNoteObj]);
    setNewNote('');
    setShowAddNote(false);
  };

  const removeNote = async (noteId: number) => {
    setUserNotes(userNotes.filter(note => note.id !== noteId));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Film className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Movie not found</p>
          <Link href="/" className="text-yellow-600 hover:text-yellow-700 mt-2 inline-block">
            Return to homepage
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
          <div className="flex items-center h-16">
            <Link href="/" className="flex items-center gap-2 text-yellow-500 hover:text-yellow-400">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Movies</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Movie Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="flex flex-col md:flex-row">
            {/* Poster */}
            <div className="md:w-64 flex-shrink-0">
              <div className="aspect-[2/3] bg-gray-200 relative">
                {movie.poster_url ? (
                  <img 
                    src={movie.poster_url} 
                    alt={movie.title} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`absolute inset-0 flex items-center justify-center text-gray-400 ${movie.poster_url ? 'hidden' : ''}`}>
                  <Film className="w-16 h-16" />
                </div>
              </div>
            </div>

            {/* Movie Info */}
            <div className="flex-1 p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{movie.title}</h1>
              
              <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-600">
                {movie.release_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(movie.release_date).getFullYear()}</span>
                  </div>
                )}
                {movie.runtime_minutes && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{movie.runtime_minutes} min</span>
                  </div>
                )}
                {movie.genre && (
                  <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium">
                    {movie.genre}
                  </span>
                )}
              </div>

              {movie.director && (
                <p className="text-gray-700 mb-4">
                  <span className="font-medium">Director:</span> {movie.director}
                </p>
              )}

              {/* Storyline */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 border-l-4 border-yellow-500 pl-3">
                  Storyline
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {movie.description || 'No storyline available.'}
                </p>
              </div>

              {/* Taglines and Genres would go here */}
              <div className="space-y-4">
                <div>
                  <span className="font-medium text-gray-700">Taglines:</span>
                  <span className="ml-2 text-gray-600">2 Russians, 2 Jews and a Puerto Rican walk into a bar...</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Genres:</span>
                  <span className="ml-2 text-gray-600">{movie.genre || 'Not specified'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Personalization Section */}
        {user && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Personal Tags & Notes</h2>
            
            {/* Tags Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-800">Tags</h3>
                <button
                  onClick={() => setShowAddTag(true)}
                  className="flex items-center gap-1 text-yellow-600 hover:text-yellow-700 text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Tag
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {userTags.map((tag) => (
                  <span
                    key={tag.id}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${tag.color || 'bg-blue-100 text-blue-800'}`}
                  >
                    {tag.tag_name}
                    <button
                      onClick={() => removeTag(tag.id)}
                      className="ml-1 hover:bg-black/10 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {userTags.length > 5 && (
                  <button className="text-yellow-600 hover:text-yellow-700 text-sm font-medium">
                    +{userTags.length - 5} more
                  </button>
                )}
              </div>

              {showAddTag && (
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Enter tag name..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <button
                    onClick={addTag}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 font-medium"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {setShowAddTag(false); setNewTag('');}}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Categories Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-800">Categories</h3>
                <button
                  onClick={() => setShowAddCategory(true)}
                  className="flex items-center gap-1 text-yellow-600 hover:text-yellow-700 text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Category
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {userCategories.map((category) => (
                  <span
                    key={category.id}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${category.color || 'bg-green-100 text-green-800'}`}
                  >
                    {category.category_name}
                    <button
                      onClick={() => removeCategory(category.id)}
                      className="ml-1 hover:bg-black/10 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              {showAddCategory && (
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Enter category name..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                    onKeyPress={(e) => e.key === 'Enter' && addCategory()}
                  />
                  <button
                    onClick={addCategory}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 font-medium"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {setShowAddCategory(false); setNewCategory('');}}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Notes Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-800">Personal Notes</h3>
                <button
                  onClick={() => setShowAddNote(true)}
                  className="flex items-center gap-1 text-yellow-600 hover:text-yellow-700 text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Note
                </button>
              </div>
              
              <div className="space-y-4">
                {userNotes.map((note) => (
                  <div key={note.id} className="bg-gray-50 rounded-lg p-4 relative">
                    <button
                      onClick={() => removeNote(note.id)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <p className="text-gray-700 pr-8">{note.content}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(note.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>

              {showAddNote && (
                <div className="mt-4">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Write your personal note about this movie..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={addNote}
                      className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 font-medium"
                    >
                      Save Note
                    </button>
                    <button
                      onClick={() => {setShowAddNote(false); setNewNote('');}}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {userNotes.length === 0 && !showAddNote && (
                <p className="text-gray-500 text-center py-8 italic">
                  No personal notes yet. Add your thoughts about this movie!
                </p>
              )}
            </div>
          </div>
        )}

        {/* Show login prompt if not authenticated */}
        {!user && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Personalize Your Experience</h3>
            <p className="text-gray-600 mb-4">
              Sign in to add your own tags, categories, and notes to movies
            </p>
            <div className="flex justify-center gap-4">
              <Link 
                href="/login"
                className="px-4 py-2 text-yellow-600 hover:text-yellow-700 font-medium"
              >
                Sign In
              </Link>
              <Link 
                href="/signup"
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md font-medium"
              >
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
