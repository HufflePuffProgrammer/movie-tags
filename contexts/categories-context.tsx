'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (fetchError) {
        console.error('Error fetching categories:', fetchError);
        setError('Failed to load categories');
      } else {
        setCategories(data || []);
        console.log('Categories loaded:', data?.length || 0);
      }
    } catch (err) {
      console.error('Categories fetch error:', err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const refreshCategories = async () => {
    await fetchCategories();
  };

  const searchCategories = (query: string): Category[] => {
    if (!query.trim()) return categories;
    
    const searchTerm = query.toLowerCase().trim();
    return categories.filter(category => 
      category.name.toLowerCase().includes(searchTerm) ||
      (category.description && category.description.toLowerCase().includes(searchTerm))
    );
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const value: CategoriesContextType = {
    categories,
    loading,
    error,
    refreshCategories,
    searchCategories
  };

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
