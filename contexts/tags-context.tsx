'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient } from '@/lib/supabase-client';
import { Database } from '@/types/database';

type Tag = Database['public']['Tables']['tags']['Row'];

interface TagsContextType {
  tags: Tag[];
  loading: boolean;
  error: string | null;
  refreshTags: () => Promise<void>;
  searchTags: (query: string) => Tag[];
}

const TagsContext = createContext<TagsContextType | undefined>(undefined);

export function TagsProvider({ children }: { children: ReactNode }) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTags = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from('tags')
        .select('*')
        .order('name');

      if (fetchError) {
        console.error('Error fetching tags:', fetchError);
        setError('Failed to load tags');
      } else {
        setTags(data || []);
        console.log('Tags loaded:', data?.length || 0);
      }
    } catch (err) {
      console.error('Tags fetch error:', err);
      setError('Failed to load tags');
    } finally {
      setLoading(false);
    }
  };

  const refreshTags = async () => {
    await fetchTags();
  };

  const searchTags = (query: string): Tag[] => {
    if (!query.trim()) return tags;
    
    const searchTerm = query.toLowerCase().trim();
    return tags.filter(tag => 
      tag.name.toLowerCase().includes(searchTerm) ||
      (tag.description && tag.description.toLowerCase().includes(searchTerm))
    );
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const value: TagsContextType = {
    tags,
    loading,
    error,
    refreshTags,
    searchTags
  };

  return (
    <TagsContext.Provider value={value}>
      {children}
    </TagsContext.Provider>
  );
}

export function useTags() {
  const context = useContext(TagsContext);
  if (context === undefined) {
    throw new Error('useTags must be used within a TagsProvider');
  }
  return context;
}
