'use client'

import Link from 'next/link';
import { Film } from 'lucide-react';

interface MyTagsEmptyStateProps {
  notesFilter: string;
  filterBy: 'all' | 'tags' | 'categories' | 'notes';
  onClearNotesFilter: () => void;
  onClearFilter: () => void;
}

export default function MyTagsEmptyState({ 
  notesFilter, 
  filterBy, 
  onClearNotesFilter, 
  onClearFilter 
}: MyTagsEmptyStateProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
      <Film className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      {notesFilter ? (
        <>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Notes Found</h3>
          <p className="text-gray-600 mb-6">
            No notes contain &quot;{notesFilter}&quot;. Try a different search term or clear the filter.
          </p>
          <button
            onClick={onClearNotesFilter}
            className="inline-flex items-center px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md font-medium"
          >
            Clear Search
          </button>
        </>
      ) : filterBy !== 'all' ? (
        <>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Movies Match Filter</h3>
          <p className="text-gray-600 mb-6">
            No movies found with the selected filter. Try changing the filter or add more tags to your movies.
          </p>
          <button
            onClick={onClearFilter}
            className="inline-flex items-center px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md font-medium"
          >
            Show All Movies
          </button>
        </>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
