'use client'

import { useParams } from 'next/navigation';
import { ArrowLeft, Film } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { useMovieData } from '@/hooks/useMovieData';
import { useUserPersonalization } from '@/hooks/useUserPersonalization';
import MovieHeader from '@/components/MovieHeader';
import TagsSection from '@/components/TagsSection';
import CategoriesSection from '@/components/CategoriesSection';
import NotesSection from '@/components/NotesSection';
import Notification from '@/components/Notification';
import PublicMovieTagsAndCategories from '@/components/PublicMovieTagsAndCategories';

export default function MovieDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const movieId = params.id as string;

  const { movie, loading } = useMovieData(movieId);
  const {
    userTags,
    userCategories,
    userNotes,
    notification,
    setNotification,
    addTag,
    removeTag,
    addCategory,
    removeCategory,
    addNote,
    removeNote
  } = useUserPersonalization(movieId, user?.id);

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
      {/* Notification */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
      
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
        <MovieHeader movie={movie} />

        {/* Community Tags & Categories Section */}
        <div className="mb-8">
          <PublicMovieTagsAndCategories movieId={movieId} />
        </div>

        {/* User Personalization Section */}
        {user && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Personal Tags & Notes</h2>
            
            <TagsSection 
              tags={userTags} 
              onAddTag={addTag} 
              onRemoveTag={removeTag} 
            />
            
            <CategoriesSection 
              categories={userCategories} 
              onAddCategory={addCategory} 
              onRemoveCategory={removeCategory} 
            />
            
            <NotesSection 
              notes={userNotes} 
              onAddNote={addNote} 
              onRemoveNote={removeNote} 
            />
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
