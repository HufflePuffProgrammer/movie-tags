'use client'

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Search, X, Plus, Calendar, Clock, Star, ExternalLink } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
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
  error?: string;
}

interface SmartMovieSearchProps {
  onMovieSelect?: (movie: LocalMovie) => void;
  onMovieAdded?: (movie: LocalMovie) => void;
  placeholder?: string;
  showAddButton?: boolean;
  className?: string;
  redirectToResults?: boolean; // New prop to control behavior
}

export default function SmartMovieSearch({
  onMovieSelect,
  onMovieAdded,
  placeholder = "Search movies...",
  showAddButton = true,
  className = "",
  redirectToResults = false
}: SmartMovieSearchProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>({
    localResults: [],
    tmdbResults: [],
    hasMore: false
  });
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [addingMovieId, setAddingMovieId] = useState<number | null>(null);
  const { notification, showSuccess, showError, setNotification } = useNotification();
  const searchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced search function
  const debouncedSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      console.log('🔍 SmartMovieSearch: Query too short, clearing results');
      setResults({ localResults: [], tmdbResults: [], hasMore: false });
      setIsOpen(false);
      return;
    }

    console.log('🔍 SmartMovieSearch: Starting search for:', searchQuery);
    setLoading(true);
    
    try {
      const searchUrl = `/api/search?byLocalResults=true&query=${encodeURIComponent(searchQuery)}&byMovies=wars123&byTVShows=glad123`;
      console.log('🌐 SmartMovieSearch: Calling API:', searchUrl);
      
      const response = await fetch(searchUrl);
      const data: SearchResults = await response.json();
      
      console.log('📥 SmartMovieSearch: API Response:', {
        localResultsCount: data.localResults?.length || 0,
        tmdbResultsCount: data.tmdbResults?.length || 0,
        hasMore: data.hasMore,
        error: data.error,
        localResults: data.localResults,
        tmdbResults: data.tmdbResults
      });
      
      setResults(data);
      setIsOpen(true);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('❌ SmartMovieSearch: Search error:', error);
      setResults({ 
        localResults: [], 
        tmdbResults: [], 
        hasMore: false, 
        error: 'Search failed' 
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle input changes with debouncing
  useEffect(() => {
    // Skip debounced search if we're in redirect mode
    if (redirectToResults) return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      debouncedSearch(query);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, debouncedSearch, redirectToResults]);

  // Handle search submission
  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (query.trim().length < 2) return;

    if (redirectToResults) {
      // Navigate to results page with query
      console.log('🔍 SmartMovieSearch: Redirecting to results page with query:', query);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (redirectToResults) {
      // In redirect mode, only handle Enter for search submission
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSearchSubmit();
      }
      return;
    }

    // Original dropdown navigation logic
    if (!isOpen) return;

    const totalResults = results.localResults.length + results.tmdbResults.length;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % totalResults);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev <= 0 ? totalResults - 1 : prev - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          if (selectedIndex < results.localResults.length) {
            handleLocalMovieSelect(results.localResults[selectedIndex]);
          } else {
            const tmdbIndex = selectedIndex - results.localResults.length;
            handleAddMovie(results.tmdbResults[tmdbIndex]);
          }
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle local movie selection
  const handleLocalMovieSelect = (movie: LocalMovie) => {
    console.log('🎬 SmartMovieSearch: Local movie selected:', {
      id: movie.id,
      title: movie.title,
      tmdbId: movie.tmdb_id,
      director: movie.director,
      releaseDate: movie.release_date
    });
    setQuery(movie.title);
    setIsOpen(false);
    onMovieSelect?.(movie);
  };

  // Handle adding TMDB movie to local database
  const handleAddMovie = async (tmdbMovie: TMDBMovie) => {
    if (!user) {
      console.log('❌ SmartMovieSearch: User not signed in, cannot add movie');
      showError('Please sign in to add movies');
      return;
    }

    console.log('➕ SmartMovieSearch: Adding TMDB movie to database:', {
      tmdbId: tmdbMovie.id,
      title: tmdbMovie.title,
      overview: tmdbMovie.overview?.substring(0, 100) + '...',
      releaseDate: tmdbMovie.release_date,
      posterPath: tmdbMovie.poster_path,
      voteAverage: tmdbMovie.vote_average
    });

    setAddingMovieId(tmdbMovie.id);
    
    try {
      const requestBody = { tmdbMovie };
      console.log('📤 SmartMovieSearch: Sending to /api/add-movie:', requestBody);
      
      const response = await fetch('/api/add-movie', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log('📥 SmartMovieSearch: Add movie response:', data);

      if (data.success) {
        console.log('✅ SmartMovieSearch: Movie added successfully:', data.movie);
        showSuccess(data.message);
        
        // Remove the added movie from TMDB results
        setResults(prev => ({
          ...prev,
          tmdbResults: prev.tmdbResults.filter(m => m.id !== tmdbMovie.id)
        }));

        // Trigger callback if provided
        onMovieAdded?.(data.movie);
        
        // Refresh search to show the newly added movie in local results
        console.log('🔄 SmartMovieSearch: Refreshing search to show newly added movie');
        setTimeout(() => debouncedSearch(query), 500);
      } else {
        console.log('❌ SmartMovieSearch: Failed to add movie:', data.error);
        showError(data.error || 'Failed to add movie');
      }
    } catch (error) {
      console.error('❌ SmartMovieSearch: Error adding movie:', error);
      showError('Failed to add movie');
    } finally {
      setAddingMovieId(null);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Clear notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const formatYear = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).getFullYear();
  };

  const formatRuntime = (minutes: number | null) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {notification.message}
        </div>
      )}

      {/* Search Input */}
      {redirectToResults ? (
        // Form mode for results page navigation
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            ref={searchRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg text-sm focus:ring-yellow-500 focus:border-yellow-500 text-gray-900"
          />
            <input type="hidden" name="byLocalResults" value="true" />
            <input type="hidden" name="byMovies" value="false" />
            <input type="hidden" name="byTVShows" value="false" />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                searchRef.current?.focus();
              }}
              className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <button
            type="submit"
            disabled={query.trim().length < 2}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Search className="w-5 h-5" />
          </button>
        </form>
      ) : (
        // Original dropdown mode
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            ref={searchRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => query.length >= 2 && setIsOpen(true)}
            placeholder={placeholder}
            className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg text-sm focus:ring-yellow-500 focus:border-yellow-500 text-gray-900"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setIsOpen(false);
                searchRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          {loading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500"></div>
            </div>
          )}
        </div>
      )}

      {/* Dropdown Results - Only show in dropdown mode */}
      {!redirectToResults && isOpen && (results.localResults.length > 0 || results.tmdbResults.length > 0 || results.error) && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {/* Local Results Section */}
          {results.localResults.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50 border-b">
                Your Library
              </div>
              {results.localResults.map((movie, index) => (
                <button
                  key={`local-${movie.id}`}
                  onClick={() => handleLocalMovieSelect(movie)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 flex items-center gap-3 ${
                    selectedIndex === index ? 'bg-yellow-50' : ''
                  }`}
                >
                  {movie.poster_url ? (
                    <Image
                      src={movie.poster_url}
                      alt={movie.title}
                      className="w-12 h-16 object-cover rounded flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-16 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center">
                      <Search className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">
                      {movie.title}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      {movie.release_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatYear(movie.release_date)}
                        </span>
                      )}
                      {movie.director && (
                        <span>• {movie.director}</span>
                      )}
                      {movie.runtime_minutes && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatRuntime(movie.runtime_minutes)}
                        </span>
                      )}
                    </div>
                    {(movie.overview || movie.description) && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {movie.overview || movie.description}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* TMDB Results Section */}
          {results.tmdbResults.length > 0 && showAddButton && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50 border-b">
                Add from TMDB
              </div>
              {results.tmdbResults.map((movie, index) => {
                const globalIndex = results.localResults.length + index;
                return (
                  <div
                    key={`tmdb-${movie.id}`}
                    className={`px-4 py-3 border-b border-gray-100 flex items-center gap-3 ${
                      selectedIndex === globalIndex ? 'bg-yellow-50' : ''
                    }`}
                  >
                    {movie.poster_path ? (
                      <Image
                        src={movie.poster_path}
                        alt={movie.title}
                        className="w-12 h-16 object-cover rounded flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-16 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center">
                        <Search className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">
                        {movie.title}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        {movie.release_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatYear(movie.release_date)}
                          </span>
                        )}
                        {movie.vote_average > 0 && (
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            {movie.vote_average.toFixed(1)}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-blue-600">
                          <ExternalLink className="w-3 h-3" />
                          TMDB
                        </span>
                      </div>
                      {movie.overview && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {movie.overview}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleAddMovie(movie)}
                      disabled={addingMovieId === movie.id}
                      className="flex items-center gap-1 px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                    >
                      {addingMovieId === movie.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Add
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Error State */}
          {results.error && (
            <div className="px-4 py-3 text-sm text-red-600 text-center">
              {results.error}
            </div>
          )}

          {/* No Results */}
          {!loading && !results.error && results.localResults.length === 0 && results.tmdbResults.length === 0 && query.length >= 2 && (
            <div className="px-4 py-8 text-center text-gray-500">
              <Search className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>No movies found for &quot;{query}&quot;</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
