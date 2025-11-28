'use client'

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import SmartMovieSearch from '@/components/SmartMovieSearch';
import SidebarNavigation from '@/components/layout/SidebarNavigation';
import { SidebarLink } from '@/components/layout/SidebarNavigation';
import { useAuth } from '@/contexts/auth-context';
import { useNotification } from '@/hooks/useNotification';

interface LocalMovie {
  id: number;
  title: string;
  description: string | null;
  overview: string | null;
  release_date: string | null;
  poster_url: string | null;
  director: string | null;
  genre: string | null;
  runtime_minutes: number | null;
  tmdb_id: number | null;
  created_at: string;
}

interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  poster_path: string | null;
  vote_average: number;
  genre_ids: number[];
}

interface SearchResults {
  localResults: LocalMovie[];
  tmdbResults: TMDBMovie[];
  hasMore: boolean;
  byMovies: boolean;
  error?: string;
}

const sidebarLinks: SidebarLink[] = [
  { label: 'Local Results', href: '/search?byLocalResults=true&byMovies=false&byTVShows=false' },
  { label: 'Movies', href: '/search?byMovies=true&byTVShows=false&byLocalResults=false' },
  { label: 'TV Series', href: '/search?byTVShows=true&byMovies=false&byLocalResults=false' }
];


interface LocalResultsSectionProps {
  movies: LocalMovie[];
  formatYear: (dateString: string | null) => string;
  formatRuntime: (minutes: number | null) => string;
  sectionId?: string;
}

function LocalResultsSection({ movies, formatYear, formatRuntime, sectionId }: LocalResultsSectionProps) {
  if (movies.length === 0) {
    return null;
  }

  return (
    <section id={sectionId}>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Your Library ({movies.length})
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {movies.map((movie) => (
          <div key={`local-${movie.id}`} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {movie.poster_url ? (
          <Image 
          src={movie.poster_url} 
          alt={movie.title} 
          width={400}
          height={600}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.classList.remove('hidden');
          }}
        />
            ) : (
              <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
            )}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">{movie.title}</h3>
              <div className="text-sm text-gray-600 space-y-1">
                {movie.release_date && (
                  <p>Year: {formatYear(movie.release_date)}</p>
                )}
                {movie.director && (
                  <p>Director: {movie.director}</p>
                )}
                {movie.runtime_minutes && (
                  <p>Runtime: {formatRuntime(movie.runtime_minutes)}</p>
                )}
              </div>
              {(movie.overview || movie.description) && (
                <p className="text-sm text-gray-500 mt-2 line-clamp-3">
                  {movie.overview || movie.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

interface TMDBResultsSectionProps {
  movies: TMDBMovie[];
  formatYear: (dateString: string | null) => string;
  addingMovieId: number | null;
  onAddMovie: (movie: TMDBMovie) => void;
  sectionId?: string;
}

function TMDBResultsSection({ movies, formatYear, addingMovieId, onAddMovie, sectionId }: TMDBResultsSectionProps) {
 
  if (movies.length === 0) {
    return null;
  }

  return (
    <section id={sectionId}>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Add from TMDB ({movies.length})
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {movies.map((movie) => (
          <div key={`tmdb-${movie.id}`} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {movie.poster_path ? (
                <Image
                  src={movie.poster_path}
                  alt={movie.title}
                  className="w-full h-64 object-cover"
                  width={400}
                  height={600}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : (
              <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
            )}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">{movie.title}</h3>
              <div className="text-sm text-gray-600 space-y-1">
                {movie.release_date && (
                  <p>Year: {formatYear(movie.release_date)}</p>
                )}
                {movie.vote_average > 0 && (
                  <p>Rating: ⭐ {movie.vote_average.toFixed(1)}</p>
                )}
                <p className="text-blue-600">Source: TMDB</p>
              </div>
              {movie.overview && (
                <p className="text-sm text-gray-500 mt-2 line-clamp-3">
                  {movie.overview}
                </p>
              )}
              <button
                onClick={() => onAddMovie(movie)}
                disabled={addingMovieId === movie.id}
                className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addingMovieId === movie.id ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add to Library
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SearchResultsFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center text-gray-600">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-4" />
        <p>Loading search results…</p>
      </div>
    </div>
  );
}

function SearchResultsPageContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const byMovies = searchParams.get('byMovies');
  const byTVShows = searchParams.get('byTVShows');
  const byLocalResultsParam = searchParams.get('byLocalResults');
  const byMoviesParam = byMovies === 'true';
  const byTVShowsParam = byTVShows === 'true';
  const byLocalResults = byLocalResultsParam
    ? byLocalResultsParam === 'true'
    : !byMoviesParam && !byTVShowsParam;
  const [results, setResults] = useState<SearchResults>({
    localResults: [],
    tmdbResults: [],
    hasMore: false,
    byMovies: false
  });
  const [loading, setLoading] = useState(false);
  const [addingMovieId, setAddingMovieId] = useState<number | null>(null);
  const { notification, showSuccess, showError, setNotification } = useNotification();

  useEffect(() => {

    if (query.trim().length >= 2) {
      performSearch(query, {
        byLocalResults,
        byMovies: byMoviesParam,
        byTVShows: byTVShowsParam
      });
    }
  }, [query, byLocalResults, byMoviesParam, byTVShowsParam]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const performSearch = async (
    searchQuery: string,
    filters: { byLocalResults: boolean; byMovies: boolean; byTVShows: boolean }
  ) => {
    setLoading(true);
    try {

      const params = new URLSearchParams({
        query: searchQuery,
        byLocalResults: filters.byLocalResults ? 'true' : 'false',
        byMovies: filters.byMovies ? 'true' : 'false',
        byTVShows: filters.byTVShows ? 'true' : 'false'
      });
      const response = await fetch(`/api/search?${params.toString()}`);
      const data: SearchResults = await response.json();
      

      setResults(data);
    } catch (error) {

      setResults({ 
        localResults: [], 
        tmdbResults: [], 
        hasMore: false, 
        byMovies: false,
        error: 'Search failed' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMovie = async (tmdbMovie: TMDBMovie) => {
    if (!user) {
      showError('Please sign in to add movies');
      return;
    }

    setAddingMovieId(tmdbMovie.id);
    
    try {

      const response = await fetch('/api/add-movie', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tmdbMovie }),
      });

      const data = await response.json();

      if (data.success) {
        showSuccess(data.message);
        
        // Remove the added movie from TMDB results and refresh search
        setResults(prev => ({
          ...prev,
          tmdbResults: prev.tmdbResults.filter(m => m.id !== tmdbMovie.id)
        }));
        
        // Refresh search to show newly added movie in local results
        setTimeout(
          () =>
            performSearch(query, {
              byLocalResults,
              byMovies: byMoviesParam,
              byTVShows: byTVShowsParam
            }),
          500
        );
      } else {
        showError(data.error || 'Failed to add movie');
      }
    } catch (error) {
      console.error('❌ SearchResults: Error adding movie:', error);
      showError('Failed to add movie');
    } finally {
      setAddingMovieId(null);
    }
  };

  const formatYear = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).getFullYear().toString();
  };

  const formatRuntime = (minutes: number | null) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {notification.message}
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">App/search/page Search Results</h1>
          {query && (
            <p className="text-gray-600 mt-2">
              Results for: <span className="font-medium text-gray-900">&quot;{query}&quot;</span>
            </p>
          )}
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <SmartMovieSearch
            placeholder="Search for movies..."
            redirectToResults={true}
            className="max-w-2xl"
          />
        </div>

        <div className="flex gap-8">
          <SidebarNavigation links={sidebarLinks} title="Shortcuts" query={query} />
          <div className="flex-1 space-y-8">
            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Searching...</p>
              </div>
            )}

            {/* Results */}
            {!loading && query.trim().length >= 2 && (
              <div className="space-y-8">
                {/* Local Results */}
                {results.localResults.length > 0 && (
                  <LocalResultsSection
                    movies={results.localResults}
                    formatYear={formatYear}
                    formatRuntime={formatRuntime}
                    sectionId="local-results"
                  />
                )}

                {/* TMDB Results */}
                {results.tmdbResults.length > 0 && (
                  <TMDBResultsSection
                    movies={results.tmdbResults}
                    formatYear={formatYear}
                    addingMovieId={addingMovieId}
                    onAddMovie={handleAddMovie}
                    sectionId="movies"
                  />
                )}

                {/* Error State */}
                {results.error && (
                  <div className="text-center py-12">
                    <p className="text-red-600">{results.error}</p>
                  </div>
                )}

                {/* No Results */}
                {!results.error && results.localResults.length === 0 && results.tmdbResults.length === 0 && (
                  <div className="text-center py-12">
                    <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No movies found</h3>
                    <p className="text-gray-600">
                      No results found for &quot;{query}&quot;. Try a different search term.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Empty State */}
            {!loading && query.trim().length < 2 && (
              <div className="text-center py-12">
                <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Start searching</h3>
                <p className="text-gray-600">
                  Enter at least 2 characters to search for movies.
                </p>
              </div>
            )}

            <section id="tv-series" className="bg-white rounded-lg shadow-sm border border-dashed border-gray-300 p-6 text-center text-gray-600">
              TV Series shortcuts coming soon
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={<SearchResultsFallback />}>
      <SearchResultsPageContent />
    </Suspense>
  );
}
