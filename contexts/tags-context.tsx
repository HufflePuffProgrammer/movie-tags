'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from 'react';
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

  const fetchTags = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Check localStorage cache first (unless forcing refresh)
      if (!forceRefresh) {
        const cached = localStorage.getItem('movie-tags');
        const cacheTime = localStorage.getItem('movie-tags-timestamp');
        
        // Use cache if less than 24 hours old (tags rarely change)
        if (cached && cacheTime && Date.now() - parseInt(cacheTime) < 24 * 60 * 60 * 1000) {
          const cachedTags = JSON.parse(cached);
          setTags(cachedTags);
          setLoading(false);
          console.log('Tags loaded from cache:', cachedTags.length);
          return;
        }
      }
      
      // Fetch from database
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from('tags')
        .select('*')
        .order('name');

      if (fetchError) {
        console.error('Error fetching tags:', fetchError);
        setError('Failed to load tags');
      } else {
        const tags = data || [];
        setTags(tags);
        
        // Cache the result
        localStorage.setItem('movie-tags', JSON.stringify(tags));
        localStorage.setItem('movie-tags-timestamp', Date.now().toString());
        
        console.log('Tags loaded from database and cached:', tags.length);
      }
    } catch (err) {
      console.error('Tags fetch error:', err);
      setError('Failed to load tags');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshTags = useCallback(async () => {
    await fetchTags(true); // Force refresh from database
  }, [fetchTags]);

  const searchTags = useCallback((query: string): Tag[] => {
    if (!query.trim()) return tags;
    
    const searchTerm = query.toLowerCase().trim();
    return tags.filter(tag => 
      tag.name.toLowerCase().includes(searchTerm) ||
      (tag.description && tag.description.toLowerCase().includes(searchTerm))
    );
  }, [tags]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const value = useMemo(() => ({
    tags,
    loading,
    error,
    refreshTags,
    searchTags
  }), [tags, loading, error, refreshTags, searchTags]);

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
