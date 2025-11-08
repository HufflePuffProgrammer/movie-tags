'use client'

import { Filter } from 'lucide-react';
import { useCategories } from '@/contexts/categories-context';
import { useTags } from '@/contexts/tags-context';

interface FiltersSidebarProps {
  selectedCategories: number[];
  selectedTags: number[];
  onCategoryChange: (categoryIds: number[]) => void;
  onTagChange: (tagIds: number[]) => void;
  className?: string;
}

export default function FiltersSidebar({ 
  selectedCategories,
  selectedTags,
  onCategoryChange,
  onTagChange,
  className = "" 
}: FiltersSidebarProps) {
  const { categories, loading: categoriesLoading } = useCategories();
  const { tags, loading: tagsLoading } = useTags();

  const handleCategoryToggle = (categoryId: number) => {
    if (selectedCategories.includes(categoryId)) {
      onCategoryChange(selectedCategories.filter(id => id !== categoryId));
    } else {
      onCategoryChange([...selectedCategories, categoryId]);
    }
  };

  const handleTagToggle = (tagId: number) => {
    if (selectedTags.includes(tagId)) {
      onTagChange(selectedTags.filter(id => id !== tagId));
    } else {
      onTagChange([...selectedTags, tagId]);
    }
  };

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
            {categoriesLoading ? (
              <div className="text-sm text-gray-500">Loading categories...</div>
            ) : (
              categories.map((category) => (
                <label key={category.id} className="flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={selectedCategories.includes(category.id)}
                    onChange={() => handleCategoryToggle(category.id)}
                    className="rounded border-gray-300 text-yellow-500 focus:ring-yellow-500" 
                  />
                  <span className="ml-2 text-sm text-gray-600">{category.name}</span>
                </label>
              ))
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-700 mb-3">Tags</h4>
          <div className="space-y-2">
            {tagsLoading ? (
              <div className="text-sm text-gray-500">Loading tags...</div>
            ) : (
              tags.map((tag) => (
                <label key={tag.id} className="flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={selectedTags.includes(tag.id)}
                    onChange={() => handleTagToggle(tag.id)}
                    className="rounded border-gray-300 text-yellow-500 focus:ring-yellow-500" 
                  />
                  <div className="flex items-center ml-2">
                    <span className="text-sm text-gray-600">{tag.name}</span>
                    <div 
                      className="w-3 h-3 rounded-full ml-2"
                      style={{ backgroundColor: tag.color }}
                    />
                  </div>
                </label>
              ))
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

