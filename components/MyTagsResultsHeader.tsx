'use client'

interface MyTagsResultsHeaderProps {
  filteredCount: number;
  totalCount: number;
  notesFilter: string;
}

export default function MyTagsResultsHeader({ 
  filteredCount, 
  totalCount, 
  notesFilter 
}: MyTagsResultsHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <p className="text-sm text-gray-600">
        Showing {filteredCount} of {totalCount} movies
        {notesFilter && (
          <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
            Notes: &quot;{notesFilter}&quot;
          </span>
        )}
      </p>
    </div>
  );
}
