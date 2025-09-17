'use client'

import { Search, Film, Star, Filter, User, LogOut } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";

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

export default function Home() {
  const { user, signOut, loading } = useAuth();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [moviesLoading, setMoviesLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('release_date');
  
  // Fetch movies from database
  useEffect(() => {
    async function fetchMovies() {
      try {
        const supabase = createClient();
        let query = supabase
          .from('movies')
          .select('*');
        
        // Add search filter if query exists
        if (searchQuery.trim()) {
          query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,director.ilike.%${searchQuery}%`);
        }
        
        // Add sorting
        if (sortBy === 'release_date') {
          query = query.order('release_date', { ascending: false });
        } else if (sortBy === 'title') {
          query = query.order('title', { ascending: true });
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching movies:', error);
        } else {
          setMovies(data || []);
        }
      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setMoviesLoading(false);
      }
    }
    
    fetchMovies();
  }, [searchQuery, sortBy]);
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Film className="w-8 h-8 text-yellow-500" />
              <h1 className="text-xl font-bold">CineFind</h1>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
  
              <a href="#" className="text-gray-300 hover:text-white font-medium">My Tags</a>
            </nav>

            {/* Search Bar */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search movies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 rounded-md bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:border-yellow-500 focus:outline-none"
                />
              </div>
              
              {loading ? (
                <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
              ) : user ? (
                <div className="flex items-center gap-3">
                  <Link 
                    href="/profile"
                    className="flex items-center gap-2 text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    <User className="w-5 h-5" />
                    <span className="text-sm">{user.email}</span>
                  </Link>
                  <button 
                    onClick={signOut}
                    className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link 
                    href="/login"
                    className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/signup"
                    className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-md font-medium transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">New Movies</h2>
          <p className="text-gray-600">Filter by category and tags.</p>
        </div>

        {/* Filters and Results */}
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className="w-44 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </h3>
              

              {/* Categories */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Categories</h4>
                <div className="space-y-2">
                  {['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Thriller'].map((category) => (
                    <label key={category} className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-yellow-500 focus:ring-yellow-500" />
                      <span className="ml-2 text-sm text-gray-600">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Tags */}
             
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Tags</h4>
                <div className="space-y-2">
                  {['Premise', 'Character', 'Dialogue', 'Horror', 'Sci-Fi', 'Thriller'].map((tags) => (
                    <label key={tags} className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-yellow-500 focus:ring-yellow-500" />
                      <span className="ml-2 text-sm text-gray-600">{tags}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Movie Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <span className="text-gray-600">
                  {moviesLoading ? 'Loading...' : `${movies.length} results`}
                </span>
              </div>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-700"
              >
                <option value="release_date">Sort by: Release Date</option>
                <option value="title">Sort by: Title</option>
              </select>
            </div>

            {/* Movie Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {moviesLoading ? (
                // Loading skeleton
                Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                    <div className="aspect-[2/3] bg-gray-200"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-2 w-2/3"></div>
                      <div className="flex items-center gap-2">
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
                  <Link 
                    key={movie.id} 
                    href={`/movie/${movie.id}`}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer block"
                  >
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
                        <Film className="w-10 h-10" />
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{movie.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown'} 
                        {movie.genre && ` • ${movie.genre}`}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
                          NEW
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm text-gray-600">
                            {movie.runtime_minutes ? `${movie.runtime_minutes}min` : 'Runtime TBD'}
                          </span>
                        </div>
                      </div>
                      {movie.director && (
                        <p className="text-xs text-gray-500 mt-2">Directed by {movie.director}</p>
                      )}
                    </div>
                  </Link>
                ))
              )}
            </div>

            {/* Load More */}
            <div className="text-center mt-8">
              <button className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-50 transition-colors">
                Load More Movies
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
