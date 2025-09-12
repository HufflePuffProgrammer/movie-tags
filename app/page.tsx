'use client'

import { Search, Film, Star, Filter, User, LogOut } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";

export default function Home() {
  const { user, signOut, loading } = useAuth();
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
              <a href="#" className="text-gray-300 hover:text-white font-medium">Movies</a>
              <a href="#" className="text-gray-300 hover:text-white font-medium">Categories</a>
              <a href="#" className="text-gray-300 hover:text-white font-medium">My Tags</a>
            </nav>

            {/* Search Bar */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search movies..."
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
          <p className="text-gray-600">Find your next movie to watch. Filter by genre, release year, or your personal tags.</p>
        </div>

        {/* Filters and Results */}
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </h3>
              
              {/* Release Year */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Release Year</h4>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1920"
                    max="2025"
                    defaultValue="2000"
                    className="flex-1"
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>1920</span>
                  <span>2025</span>
                </div>
              </div>

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

              {/* My Tags */}
              <div>
                <h4 className="font-medium text-gray-700 mb-3">My Tags</h4>
                {user ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500 mb-2">Your personal tags:</p>
                    <div className="space-y-1">
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-yellow-500 focus:ring-yellow-500" />
                        <span className="ml-2 text-sm text-gray-600">Favorites</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-yellow-500 focus:ring-yellow-500" />
                        <span className="ml-2 text-sm text-gray-600">Watch Later</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-yellow-500 focus:ring-yellow-500" />
                        <span className="ml-2 text-sm text-gray-600">Rewatchable</span>
                      </label>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    <Link href="/login" className="text-yellow-600 hover:text-yellow-500">
                      Sign in
                    </Link>{' '}
                    to use your personal tags
                  </p>
                )}</div>
            </div>
          </aside>

          {/* Movie Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <span className="text-gray-600">61 results</span>
              </div>
              <select className="border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-700">
                <option>Sort by: Release Date</option>
                <option>Sort by: Title</option>
                <option>Sort by: Rating</option>
              </select>
            </div>

            {/* Movie Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Sample Movie Cards */}
              {[
                { title: "The Dark Knight", year: "2008", rating: "94", genre: "Action", poster: "/api/placeholder/200/300" },
                { title: "Inception", year: "2010", rating: "87", genre: "Sci-Fi", poster: "/api/placeholder/200/300" },
                { title: "Parasite", year: "2019", rating: "96", genre: "Thriller", poster: "/api/placeholder/200/300" },
                { title: "Dune", year: "2021", rating: "85", genre: "Sci-Fi", poster: "/api/placeholder/200/300" },
                { title: "Everything Everywhere All at Once", year: "2022", rating: "95", genre: "Comedy", poster: "/api/placeholder/200/300" },
                { title: "Top Gun: Maverick", year: "2022", rating: "78", genre: "Action", poster: "/api/placeholder/200/300" },
              ].map((movie, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-[2/3] bg-gray-200 relative">
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      <Film className="w-12 h-12" />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">{movie.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{movie.year} • {movie.genre}</p>
                    <div className="flex items-center gap-2">
                      <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                        {movie.rating}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm text-gray-600">CineFind Score</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
