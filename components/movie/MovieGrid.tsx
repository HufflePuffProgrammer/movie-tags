'use client'

import { Film } from 'lucide-react';
import MovieCard from '@/components/movie/MovieCard';
import { Movie } from '@/types/movie';

interface MovieGridProps {
  movies: Movie[];
  loading: boolean;
  searchQuery: string;
  sortBy: string;
  onSortChange: (sortBy: string) => void;
  hasMore?: boolean;
  onLoadMore?: () => void;
  loadingMore?: boolean;
}

export default function MovieGrid({ 
  movies, 
  loading, 
  searchQuery, 
  sortBy, 
  onSortChange,
  hasMore = false,
  onLoadMore,
  loadingMore = false
}: MovieGridProps) {
  return (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <span className="text-gray-600">
            {loading ? 'Loading...' : `${movies.length} results`}
          </span>
        </div>
        <select 
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-700"
        >
          <option value="release_date">Sort by: Release Date</option>
          <option value="title">Sort by: Title</option>
        </select>
      </div>

      {/* Movie Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          // Loading skeleton
          Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
              <div className="aspect-[2/3] bg-gray-200"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-2 w-2/3"></div>
                <div className="flex itemsCenter gap-2">
                  <div className="h-6 w-8 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            </div>
          ))
        ) : movies.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Film className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No movies found</p>
            {searchQuery && (
              <p className="text-sm text-gray-500 mt-2">
                Try adjusting your search terms
              </p>
            )}
          </div>
        ) : (
          movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))
        )}
      </div>

      {/* Load More */}
      {!loading && movies.length > 0 && hasMore && onLoadMore && (
        <div className="text-center mt-8">
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingMore ? (
              <span className="flex items-center gap-2 justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700"></div>
                Loading...
              </span>
            ) : (
              'Load More Movies'
            )}
          </button>
        </div>
      )}
    </div>
  );
}

