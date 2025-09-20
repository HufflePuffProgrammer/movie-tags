'use client'

import { Filter } from 'lucide-react';

interface FiltersSidebarProps {
  // We can add filter state props here later when implementing actual filtering
  className?: string;
}

export default function FiltersSidebar({ className = "" }: FiltersSidebarProps) {
  return (
    <aside className={`w-44 flex-shrink-0 ${className}`}>
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
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300 text-yellow-500 focus:ring-yellow-500" 
                />
                <span className="ml-2 text-sm text-gray-600">{category}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-700 mb-3">Tags</h4>
          <div className="space-y-2">
            {['Premise', 'Character', 'Dialogue', 'Horror', 'Sci-Fi', 'Thriller'].map((tag) => (
              <label key={tag} className="flex items-center">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300 text-yellow-500 focus:ring-yellow-500" 
                />
                <span className="ml-2 text-sm text-gray-600">{tag}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
