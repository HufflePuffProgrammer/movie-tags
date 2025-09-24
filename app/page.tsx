'use client'

import { useState } from "react";
import { Search, X } from "lucide-react";
import { useMovies } from "@/hooks/useMovies";
import Header from "@/components/Header";
import FiltersSidebar from "@/components/FiltersSidebar";
import MovieGrid from "@/components/MovieGrid";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('release_date');
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  
  const { movies, loading } = useMovies({
    searchQuery,
    sortBy,
    categoryIds: selectedCategories,
    tagIds: selectedTags
  });
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">New Movies</h2>
          <p className="text-gray-600">Search and filter by category and tags.</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="max-w-2xl">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Search Movies
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, director, or description..."
                className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg text-sm focus:ring-yellow-500 focus:border-yellow-500 text-gray-900"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="mt-2 text-sm text-gray-600">
                Searching for: <span className="font-medium text-gray-900">&quot;{searchQuery}&quot;</span>
              </p>
            )}
          </div>
        </div>

        {/* Filters and Results */}
        <div className="flex gap-8">
          <FiltersSidebar 
            selectedCategories={selectedCategories}
            selectedTags={selectedTags}
            onCategoryChange={setSelectedCategories}
            onTagChange={setSelectedTags}
          />
          <MovieGrid 
            movies={movies}
            loading={loading}
            searchQuery={searchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        </div>
      </main>
    </div>
  );
}
