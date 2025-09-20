'use client'

import { useState } from "react";
import { useMovies } from "@/hooks/useMovies";
import Header from "@/components/Header";
import FiltersSidebar from "@/components/FiltersSidebar";
import MovieGrid from "@/components/MovieGrid";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('release_date');
  
  const { movies, loading } = useMovies(searchQuery, sortBy);
  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        searchQuery={searchQuery} 
        onSearchChange={setSearchQuery} 
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">New Movies</h2>
          <p className="text-gray-600">Filter by category and tags.</p>
        </div>

        {/* Filters and Results */}
        <div className="flex gap-8">
          <FiltersSidebar />
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
