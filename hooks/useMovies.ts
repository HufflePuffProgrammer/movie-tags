'use client'

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';
import { Movie } from '@/types/movie';

export function useMovies(searchQuery: string, sortBy: string) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMovies() {
      try {
        const supabase = createClient();
        let query = supabase
          .from('movies')
          .select('*');
        
        // Add search filter if query exists
        if (searchQuery.trim()) {
          query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,director.ilike.%${searchQuery}%`);
        }
        
        // Add sorting
        if (sortBy === 'release_date') {
          query = query.order('release_date', { ascending: false });
        } else if (sortBy === 'title') {
          query = query.order('title', { ascending: true });
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching movies:', error);
        } else {
          setMovies(data || []);
        }
      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchMovies();
  }, [searchQuery, sortBy]);

  return { movies, loading };
}
