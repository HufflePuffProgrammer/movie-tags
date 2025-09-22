'use client'

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Tag as TagIcon, Film, Calendar, BarChart3, Bookmark, StickyNote } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useUserActivity } from '@/hooks/useUserActivity';

export default function MyTagsPage() {
  const { user } = useAuth();
  const { activities, loading, stats } = useUserActivity(user?.id);
  const [sortBy, setSortBy] = useState<'recent' | 'title' | 'year'>('recent');
  const [filterBy, setFilterBy] = useState<'all' | 'tags' | 'categories' | 'notes'>('all');

  // Filter activities based on selected filter
  const filteredActivities = activities.filter(activity => {
    if (filterBy === 'all') return true;
    if (filterBy === 'tags') return activity.tags.length > 0;
    if (filterBy === 'categories') return activity.categories.length > 0;
    if (filterBy === 'notes') return activity.notes.length > 0;
    return true;
  });

  // Sort activities
  const sortedActivities = [...filteredActivities].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
    }
    if (sortBy === 'title') {
      return a.movie.title.localeCompare(b.movie.title);
    }
    if (sortBy === 'year') {
      const dateA = a.movie.release_date ? new Date(a.movie.release_date).getTime() : 0;
      const dateB = b.movie.release_date ? new Date(b.movie.release_date).getTime() : 0;
      return dateB - dateA;
    }
    return 0;
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Film className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign In Required</h1>
          <p className="text-gray-600 mb-6">You need to be signed in to view your tagged movies.</p>
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 text-yellow-500 hover:text-yellow-400">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Movies</span>
            </Link>
            <div className="flex items-center gap-2">
              <TagIcon className="w-6 h-6 text-yellow-500" />
              <h1 className="text-xl font-semibold">My Tags</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Your Movie Analysis Stats
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{stats.totalMovies}</div>
              <div className="text-sm text-gray-600">Movies Tagged</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.totalTags}</div>
              <div className="text-sm text-gray-600">Story Tags</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.totalCategories}</div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{stats.totalNotes}</div>
              <div className="text-sm text-gray-600">Notes</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            {/* Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Filter:</label>
              <select 
                value={filterBy} 
                onChange={(e) => setFilterBy(e.target.value as 'all' | 'tags' | 'categories' | 'notes')}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value="all">All Activities</option>
                <option value="tags">With Tags</option>
                <option value="categories">With Categories</option>
                <option value="notes">With Notes</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as 'recent' | 'title' | 'year')}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value="recent">Most Recent</option>
                <option value="title">Movie Title</option>
                <option value="year">Release Year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Movies List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading your tagged movies...</p>
          </div>
        ) : sortedActivities.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Film className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Tagged Movies Yet</h3>
            <p className="text-gray-600 mb-6">
              Start exploring movies and add tags, categories, or notes to build your collection!
            </p>
            <Link 
              href="/"
              className="inline-flex items-center px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md font-medium"
            >
              Explore Movies
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedActivities.map((activity) => (
              <div key={activity.movie.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex gap-6">
                  {/* Movie Poster */}
                  <div className="flex-shrink-0">
                    <img
                      src={activity.movie.poster_url || '/placeholder-movie.jpg'}
                      alt={activity.movie.title}
                      className="w-24 h-36 object-cover rounded-md"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-movie.jpg';
                      }}
                    />
                  </div>

                  {/* Movie Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <Link 
                          href={`/movie/${activity.movie.id}`}
                          className="text-xl font-semibold text-gray-900 hover:text-yellow-600"
                        >
                          {activity.movie.title}
                        </Link>
                        <p className="text-gray-600 text-sm flex items-center gap-2 mt-1">
                          <Calendar className="w-4 h-4" />
                          {activity.movie.release_date 
                            ? new Date(activity.movie.release_date).getFullYear() 
                            : 'Unknown'} • {activity.movie.director || 'Unknown Director'}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">
                        Last activity: {new Date(activity.lastActivity).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Tags */}
                    {activity.tags.length > 0 && (
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                          <TagIcon className="w-4 h-4" />
                          Story Tags ({activity.tags.length})
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {activity.tags.map((userTag) => (
                            <span
                              key={userTag.id}
                              className="inline-flex items-center px-2 py-1 rounded text-xs font-medium text-white"
                              style={{ backgroundColor: userTag.tag?.color || '#3B82F6' }}
                            >
                              {userTag.tag?.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Categories */}
                    {activity.categories.length > 0 && (
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                          <Bookmark className="w-4 h-4" />
                          Categories ({activity.categories.length})
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {activity.categories.map((userCategory) => (
                            <span
                              key={userCategory.id}
                              className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {userCategory.category.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {activity.notes.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                          <StickyNote className="w-4 h-4" />
                          Notes ({activity.notes.length})
                        </h4>
                        <div className="space-y-2">
                          {activity.notes.slice(0, 2).map((note) => (
                            <div key={note.id} className="text-sm text-gray-600 bg-gray-50 rounded p-2">
                              {note.content.length > 150 
                                ? `${note.content.substring(0, 150)}...` 
                                : note.content
                              }
                            </div>
                          ))}
                          {activity.notes.length > 2 && (
                            <p className="text-xs text-gray-500">
                              +{activity.notes.length - 2} more notes
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
