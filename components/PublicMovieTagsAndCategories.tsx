'use client'

import { Users, Tag as TagIcon } from 'lucide-react';
import { useMovieTagsAndCategories } from '@/hooks/useMovieTagsAndCategories';

interface PublicMovieTagsAndCategoriesProps {
  movieId: string;
}

export default function PublicMovieTagsAndCategories({ movieId }: PublicMovieTagsAndCategoriesProps) {
  const { categories, tags, loading, totalCategoryTags, totalTags } = useMovieTagsAndCategories(movieId);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (categories.length === 0 && tags.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-gray-500" />
          <h2 className="text-xl font-semibold text-gray-900">Community Tags & Categories</h2>
        </div>
        <p className="text-gray-500 text-center py-8">
          No one has tagged this movie yet. Be the first to add tags and categories!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-5 h-5 text-gray-600" />
        <h2 className="text-xl font-semibold text-gray-900">Community Tags & Categories</h2>
        <span className="text-sm text-gray-500">
          ({totalTags + totalCategoryTags} total tags from community)
        </span>
      </div>
      
      {/* Categories */}
      {categories.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center gap-2">
            <span>Blake Snyder Categories</span>
            <span className="text-sm text-gray-500">({categories.length} unique)</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((userCategory) => (
              <span
                key={userCategory.category.id}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
              >
                {userCategory.category.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center gap-2">
            <TagIcon className="w-4 h-4" />
            <span>Storytelling Analysis</span>
            <span className="text-sm text-gray-500">({tags.length} unique)</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((userTag) => (
              <span
                key={userTag.tag.id}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium text-white"
                style={{
                  backgroundColor: userTag.tag?.color || '#3B82F6'
                }}
              >
                {userTag.tag?.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          These tags and categories have been added by community members to help analyze this movie&apos;s storytelling elements.
        </p>
      </div>
    </div>
  );
}
