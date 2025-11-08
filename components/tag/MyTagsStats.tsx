'use client'

import { BarChart3 } from 'lucide-react';

interface MyTagsStatsProps {
  stats: {
    totalMovies: number;
    totalTags: number;
    totalCategories: number;
    totalNotes: number;
  };
}

export default function MyTagsStats({ stats }: MyTagsStatsProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5" />
        Your Movie Analysis Stats
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-yellow-600">{stats.totalMovies}</div>
          <div className="text-sm text-gray-600">Movies Tagged</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">{stats.totalTags}</div>
          <div className="text-sm text-gray-600">Story Tags</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600">{stats.totalCategories}</div>
          <div className="text-sm text-gray-600">Categories</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-600">{stats.totalNotes}</div>
          <div className="text-sm text-gray-600">Notes</div>
        </div>
      </div>
    </div>
  );
}
