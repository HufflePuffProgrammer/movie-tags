'use client'

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';
import { Movie } from '@/types/movie';

interface UseMoviesFilters {
  searchQuery: string;
  sortBy: string;
  categoryIds: number[];
  tagIds: number[];
}

export function useMovies({ searchQuery, sortBy, categoryIds, tagIds }: UseMoviesFilters) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMovies() {
      try {
        const supabase = createClient();
        
        // If no filters are applied, get all movies
        if (categoryIds.length === 0 && tagIds.length === 0) {
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
        } else {
          // When filters are applied, we need to get movies that match the criteria
          let movieIds: number[] = [];
          
          // Get movies by categories
          if (categoryIds.length > 0) {
            const { data: categoryMovies } = await supabase
              .from('user_movie_categories')
              .select('movie_id')
              .in('category_id', categoryIds);
            
            const categoryMovieIds = categoryMovies?.map((cm: any) => cm.movie_id) || [];
            movieIds = categoryMovieIds;
          }
          
          // Get movies by tags
          if (tagIds.length > 0) {
            const { data: tagMovies } = await supabase
              .from('user_movie_tags')
              .select('movie_id')
              .in('tag_id', tagIds);
            
            const tagMovieIds = tagMovies?.map((tm: any) => tm.movie_id) || [];
            
            if (categoryIds.length > 0) {
              // If both category and tag filters, get intersection
              movieIds = movieIds.filter(id => tagMovieIds.includes(id));
            } else {
              movieIds = tagMovieIds;
            }
          }
          
          // Remove duplicates
          movieIds = [...new Set(movieIds)];
          
          if (movieIds.length === 0) {
            setMovies([]);
          } else {
            // Get the actual movie data
            let query = supabase
              .from('movies')
              .select('*')
              .in('id', movieIds);
            
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
              console.error('Error fetching filtered movies:', error);
            } else {
              setMovies(data || []);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchMovies();
  }, [searchQuery, sortBy, categoryIds, tagIds]);

  return { movies, loading };
}
