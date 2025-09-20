'use client'

import { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface UserTag {
  id: number;
  tag_name: string;
  color?: string;
}

interface TagsSectionProps {
  tags: UserTag[];
  onAddTag: (tagName: string) => Promise<void>;
  onRemoveTag: (tagId: number) => Promise<void>;
}

export default function TagsSection({ tags, onAddTag, onRemoveTag }: TagsSectionProps) {
  const [showAddTag, setShowAddTag] = useState(false);
  const [newTag, setNewTag] = useState('');

  const handleAddTag = async () => {
    if (!newTag.trim()) return;
    
    await onAddTag(newTag.trim());
    setNewTag('');
    setShowAddTag(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTag();
    }
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
        {tags.map((tag) => (
          <span
            key={tag.id}
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${tag.color || 'bg-blue-100 text-blue-800'}`}
          >
            {tag.tag_name}
            <button
              onClick={() => onRemoveTag(tag.id)}
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
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Enter tag name..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
            onKeyPress={handleKeyPress}
            autoFocus
          />
          <button
            onClick={handleAddTag}
            className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 font-medium"
          >
            Add
          </button>
          <button
            onClick={() => {setShowAddTag(false); setNewTag('');}}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
