'use client'

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import TagAutocomplete from './TagAutocomplete';
import { Database } from '@/types/database';

type Tag = Database['public']['Tables']['tags']['Row'];
type UserMovieTag = Database['public']['Tables']['user_movie_tags']['Row'];

interface UserTagWithDetails extends UserMovieTag {
  tag: Tag;
}

interface TagsSectionProps {
  tags: UserTagWithDetails[];
  onAddTag: (tag: Tag) => Promise<void>;
  onRemoveTag: (userMovieTagId: number) => Promise<void>;
}

export default function TagsSection({ tags, onAddTag, onRemoveTag }: TagsSectionProps) {
  const [showAddTag, setShowAddTag] = useState(false);

  const handleAddTag = async (tag: Tag) => {
    await onAddTag(tag);
    setShowAddTag(false);
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-800">Tags</h3>
        <button
          onClick={() => setShowAddTag(true)}
          className="flex items-center gap-1 text-yellow-600 hover:text-yellow-700 text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Tag
        </button>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map((userTag) => (
          <span
            key={userTag.id}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium text-white"
            style={{
              backgroundColor: userTag.tag?.color || '#3B82F6'
            }}
          >
            {userTag.tag?.name}
            <button
              onClick={() => onRemoveTag(userTag.id)}
              className="ml-1 hover:bg-black/10 rounded-full p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        {tags.length > 5 && (
          <button className="text-yellow-600 hover:text-yellow-700 text-sm font-medium">
            +{tags.length - 5} more
          </button>
        )}
      </div>

      {showAddTag && (
        <div className="space-y-3 mb-4">
          <TagAutocomplete
            onSelect={handleAddTag}
            excludeIds={tags.map(userTag => userTag.tag_id)}
            placeholder="Type to search storytelling tags..."
          />
          <button
            onClick={() => setShowAddTag(false)}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
