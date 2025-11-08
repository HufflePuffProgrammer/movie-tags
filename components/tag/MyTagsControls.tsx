'use client'

import { Search } from 'lucide-react';

interface MyTagsControlsProps {
  filterBy: 'all' | 'tags' | 'categories' | 'notes';
  sortBy: 'recent' | 'title' | 'year';
  notesFilter: string;
  onFilterChange: (filter: 'all' | 'tags' | 'categories' | 'notes') => void;
  onSortChange: (sort: 'recent' | 'title' | 'year') => void;
  onNotesFilterChange: (filter: string) => void;
}

export default function MyTagsControls({
  filterBy,
  sortBy,
  notesFilter,
  onFilterChange,
  onSortChange,
  onNotesFilterChange
}: MyTagsControlsProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-col gap-4">
        {/* First Row: Filter and Sort */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          {/* Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Filter:</label>
            <select 
              value={filterBy} 
              onChange={(e) => onFilterChange(e.target.value as 'all' | 'tags' | 'categories' | 'notes')}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm text-gray-900"
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
              onChange={(e) => onSortChange(e.target.value as 'recent' | 'title' | 'year')}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm text-gray-900"
            >
              <option value="recent">Most Recent</option>
              <option value="title">Movie Title</option>
              <option value="year">Release Year</option>
            </select>
          </div>
        </div>

        {/* Second Row: Notes Search */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Search Notes:</label>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={notesFilter}
              onChange={(e) => onNotesFilterChange(e.target.value)}
              placeholder="Search in your notes..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-yellow-500 focus:border-yellow-500 text-gray-900"
            />
          </div>
          {notesFilter && (
            <button
              onClick={() => onNotesFilterChange('')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
