'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { Movie } from '@/types/movie';

export function useMovieData(movieId: string) {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchMovieDetails = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .eq('id', movieId)
        .single();

      if (error) {
        console.error('Error fetching movie:', error);
        router.push('/');
      } else {
        setMovie(data);
      }
    } catch (error) {
      console.error('Error fetching movie:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (movieId) {
      fetchMovieDetails();
    }
  }, [movieId]);

  return { movie, loading };
}
