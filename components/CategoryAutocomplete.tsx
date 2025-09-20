'use client'

import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { useCategories } from '@/contexts/categories-context';
import { Database } from '@/types/database';

type Category = Database['public']['Tables']['categories']['Row'];

interface CategoryAutocompleteProps {
  onSelect: (category: Category) => void;
  excludeIds?: number[];
  placeholder?: string;
  className?: string;
}

export default function CategoryAutocomplete({ 
  onSelect, 
  excludeIds = [], 
  placeholder = "Type to search categories...",
  className = ""
}: CategoryAutocompleteProps) {
  const { categories, loading, searchCategories } = useCategories();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter out excluded categories and search
  const availableCategories = categories.filter(cat => !excludeIds.includes(cat.id));
  const filteredCategories = searchCategories(query).filter(cat => !excludeIds.includes(cat.id));

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

  const handleCategorySelect = (category: Category) => {
    onSelect(category);
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
          prev < filteredCategories.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredCategories[highlightedIndex]) {
          handleCategorySelect(filteredCategories[highlightedIndex]);
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
          placeholder="Loading categories..."
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
          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
          autoComplete="off"
        />
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          <div ref={listRef}>
            {filteredCategories.length === 0 ? (
              <div className="px-3 py-2 text-gray-500 text-sm">
                {query.trim() ? 'No categories found' : 'Start typing to search...'}
              </div>
            ) : (
              filteredCategories.map((category, index) => (
                <div
                  key={category.id}
                  onClick={() => handleCategorySelect(category)}
                  className={`px-3 py-2 cursor-pointer flex items-center justify-between hover:bg-gray-50 ${
                    index === highlightedIndex ? 'bg-yellow-50 border-l-2 border-yellow-500' : ''
                  }`}
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{category.name}</div>
                    {category.description && (
                      <div className="text-xs text-gray-500 line-clamp-1 mt-1">
                        {category.description}
                      </div>
                    )}
                  </div>
                  <div 
                    className="w-4 h-4 rounded-full ml-2 flex-shrink-0"
                    style={{ backgroundColor: category.color }}
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
