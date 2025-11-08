'use client'

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTags } from '@/contexts/tags-context';
import { Database } from '@/types/database';

type Tag = Database['public']['Tables']['tags']['Row'];

interface TagAutocompleteProps {
  onSelect: (tag: Tag) => void;
  excludeIds?: number[];
  placeholder?: string;
  className?: string;
}

export default function TagAutocomplete({ 
  onSelect, 
  excludeIds = [], 
  placeholder = "Type to search tags...",
  className = ""
}: TagAutocompleteProps) {
  const { loading, searchTags } = useTags();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter out excluded tags and search
   const filteredTags = searchTags(query).filter(tag => !excludeIds.includes(tag.id));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleInputBlur = () => {
    // Delay closing to allow click on suggestions
    setTimeout(() => setIsOpen(false), 200);
  };

  const handleTagSelect = (tag: Tag) => {
    onSelect(tag);
    setQuery('');
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredTags.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredTags[highlightedIndex]) {
          handleTagSelect(filteredTags[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  if (loading) {
    return (
      <div className={`relative ${className}`}>
        <input
          type="text"
          placeholder="Loading tags..."
          disabled
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
        />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500 text-gray-900"
          autoComplete="off"
        />
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          <div ref={listRef}>
            {filteredTags.length === 0 ? (
              <div className="px-3 py-2 text-gray-500 text-sm">
                {query.trim() ? 'No tags found' : 'Start typing to search...'}
              </div>
            ) : (
              filteredTags.map((tag, index) => (
                <div
                  key={tag.id}
                  onClick={() => handleTagSelect(tag)}
                  className={`px-3 py-2 cursor-pointer flex items-center justify-between hover:bg-gray-50 ${
                    index === highlightedIndex ? 'bg-yellow-50 border-l-2 border-yellow-500' : ''
                  }`}
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{tag.name}</div>
                    {tag.description && (
                      <div className="text-xs text-gray-500 line-clamp-1 mt-1">
                        {tag.description}
                      </div>
                    )}
                  </div>
                  <div 
                    className="w-4 h-4 rounded-full ml-2 flex-shrink-0"
                    style={{ backgroundColor: tag.color }}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
