'use client'

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Tag as TagIcon, Film } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useUserActivity } from '@/hooks/useUserActivity';
import MyTagsStats from '@/components/tag/MyTagsStats';
import MyTagsControls from '@/components/tag/MyTagsControls';
import MovieActivityCard from '@/components/movie/MovieActivityCard';
import MyTagsEmptyState from '@/components/tag/MyTagsEmptyState';
import MyTagsResultsHeader from '@/components/tag/MyTagsResultsHeader';

export default function MyTagsPage() {
  const { user } = useAuth();
  const { activities, loading, stats } = useUserActivity(user?.id);
  const [sortBy, setSortBy] = useState<'recent' | 'title' | 'year'>('recent');
  const [filterBy, setFilterBy] = useState<'all' | 'tags' | 'categories' | 'notes'>('all');
  const [notesFilter, setNotesFilter] = useState('');

  // Filter activities based on selected filter and notes search
  const filteredActivities = activities.filter(activity => {
    // First apply the main filter
    let passesMainFilter = true;
    if (filterBy === 'tags') passesMainFilter = activity.tags.length > 0;
    else if (filterBy === 'categories') passesMainFilter = activity.categories.length > 0;
    else if (filterBy === 'notes') passesMainFilter = activity.notes.length > 0;
    
    // Then apply notes content filter if specified
    let passesNotesFilter = true;
    if (notesFilter.trim()) {
      passesNotesFilter = activity.notes.some(note => 
        note.content.toLowerCase().includes(notesFilter.toLowerCase())
      );
    }
    
    return passesMainFilter && passesNotesFilter;
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
        <MyTagsStats stats={stats} />

        {/* Controls */}
        <MyTagsControls
          filterBy={filterBy}
          sortBy={sortBy}
          notesFilter={notesFilter}
          onFilterChange={setFilterBy}
          onSortChange={setSortBy}
          onNotesFilterChange={setNotesFilter}
        />

        {/* Movies List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading your tagged movies...</p>
          </div>
        ) : sortedActivities.length === 0 ? (
          <MyTagsEmptyState
            notesFilter={notesFilter}
            filterBy={filterBy}
            onClearNotesFilter={() => setNotesFilter('')}
            onClearFilter={() => setFilterBy('all')}
          />
        ) : (
          <div className="space-y-6">
            <MyTagsResultsHeader
              filteredCount={sortedActivities.length}
              totalCount={activities.length}
              notesFilter={notesFilter}
            />

            {sortedActivities.map((activity) => (
              <MovieActivityCard key={activity.movie.id} activity={activity} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
