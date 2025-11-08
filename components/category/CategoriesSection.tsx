'use client'

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import CategoryAutocomplete from './CategoryAutocomplete';
import { Database } from '@/types/database';

type Category = Database['public']['Tables']['categories']['Row'];
type UserMovieCategory = Database['public']['Tables']['user_movie_categories']['Row'];

interface UserCategoryWithDetails extends UserMovieCategory {
  category: Category;
}

interface CategoriesSectionProps {
  categories: UserCategoryWithDetails[];
  onAddCategory: (category: Category) => Promise<void>;
  onRemoveCategory: (categoryId: number) => Promise<void>;
}

export default function CategoriesSection({ 
  categories, 
  onAddCategory, 
  onRemoveCategory 
}: CategoriesSectionProps) {
  const [showAddCategory, setShowAddCategory] = useState(false);

  const handleAddCategory = async (category: Category) => {
    await onAddCategory(category);
    setShowAddCategory(false);
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-800">Categories</h3>
        <button
          onClick={() => setShowAddCategory(true)}
          className="flex items-center gap-1 text-yellow-600 hover:text-yellow-700 text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map((userCategory) => (
          <span
            key={userCategory.id}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium"
            style={{
              backgroundColor: userCategory.category?.color + '20',
              color: userCategory.category?.color,
              border: `1px solid ${userCategory.category?.color}40`
            }}
          >
            {userCategory.category?.name}
            <button
              onClick={() => onRemoveCategory(userCategory.id)}
              className="ml-1 hover:bg-black/10 rounded-full p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>

      {showAddCategory && (
        <div className="space-y-3 mb-4">
          <CategoryAutocomplete
            onSelect={handleAddCategory}
            excludeIds={categories.map(uc => uc.category_id)}
            placeholder="Type to search Blake Snyder categories..."
          />
          <button
            onClick={() => setShowAddCategory(false)}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
