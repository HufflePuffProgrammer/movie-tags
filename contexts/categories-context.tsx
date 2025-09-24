'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase-client';
import { Database } from '@/types/database';

type Category = Database['public']['Tables']['categories']['Row'];

interface CategoriesContextType {
  categories: Category[];
  loading: boolean;
  error: string | null;
  refreshCategories: () => Promise<void>;
  searchCategories: (query: string) => Category[];
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Check localStorage cache first (unless forcing refresh)
      if (!forceRefresh) {
        const cached = localStorage.getItem('movie-categories');
        const cacheTime = localStorage.getItem('movie-categories-timestamp');
        
        // Use cache if less than 24 hours old (categories rarely change)
        if (cached && cacheTime && Date.now() - parseInt(cacheTime) < 24 * 60 * 60 * 1000) {
          const cachedCategories = JSON.parse(cached);
          setCategories(cachedCategories);
          setLoading(false);
          console.log('Categories loaded from cache:', cachedCategories.length);
          return;
        }
      }
      
      // Fetch from database
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (fetchError) {
        console.error('Error fetching categories:', fetchError);
        setError('Failed to load categories');
      } else {
        const categories = data || [];
        setCategories(categories);
        
        // Cache the result
        localStorage.setItem('movie-categories', JSON.stringify(categories));
        localStorage.setItem('movie-categories-timestamp', Date.now().toString());
        
        console.log('Categories loaded from database and cached:', categories.length);
      }
    } catch (err) {
      console.error('Categories fetch error:', err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshCategories = useCallback(async () => {
    await fetchCategories(true); // Force refresh from database
  }, [fetchCategories]);

  const searchCategories = useCallback((query: string): Category[] => {
    if (!query.trim()) return categories;
    
    const searchTerm = query.toLowerCase().trim();
    return categories.filter(category => 
      category.name.toLowerCase().includes(searchTerm) ||
      (category.description && category.description.toLowerCase().includes(searchTerm))
    );
  }, [categories]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const value = useMemo(() => ({
    categories,
    loading,
    error,
    refreshCategories,
    searchCategories
  }), [categories, loading, error, refreshCategories, searchCategories]);

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoriesContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoriesProvider');
  }
  return context;
}
