'use client'

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';
import { Database } from '@/types/database';
import { Movie } from '@/types/movie';

type Category = Database['public']['Tables']['categories']['Row'];
type UserMovieCategory = Database['public']['Tables']['user_movie_categories']['Row'];
type Tag = Database['public']['Tables']['tags']['Row'];
type UserMovieTag = Database['public']['Tables']['user_movie_tags']['Row'];
type UserNote = Database['public']['Tables']['user_notes']['Row'];

interface UserCategoryWithDetails extends UserMovieCategory {
  category: Category;
}

interface UserTagWithDetails extends UserMovieTag {
  tag: Tag;
}

interface MovieActivity {
  movie: Movie;
  tags: UserTagWithDetails[];
  categories: UserCategoryWithDetails[];
  notes: UserNote[];
  lastActivity: string; // Most recent activity date
}

export function useUserActivity(userId?: string) {
  const [activities, setActivities] = useState<MovieActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMovies: 0,
    totalTags: 0,
    totalCategories: 0,
    totalNotes: 0
  });

  useEffect(() => {
    async function fetchUserActivity() {
      if (!userId) {
        setActivities([]);
        setLoading(false);
        return;
      }

      try {
        const supabase = createClient();

        // Get all movies the user has interacted with
        const movieIds = new Set<number>();

        // Fetch user's tags
        const { data: userTags } = await supabase
          .from('user_movie_tags')
          .select(`
            *,
            tag:tags(*)
          `)
          .eq('user_id', userId);

        userTags?.forEach((tag: UserTagWithDetails) => movieIds.add(tag.movie_id));

        // Fetch user's categories
        const { data: userCategories } = await supabase
          .from('user_movie_categories')
          .select(`
            *,
            category:categories(*)
          `)
          .eq('user_id', userId);

        userCategories?.forEach((cat: UserCategoryWithDetails) => movieIds.add(cat.movie_id));

        // Fetch user's notes
        const { data: userNotes } = await supabase
          .from('user_notes')
          .select('*')
          .eq('user_id', userId);

        userNotes?.forEach((note: UserNote) => movieIds.add(note.movie_id));

        // Fetch movie details for all interacted movies
        const movieIdsArray = Array.from(movieIds);
        if (movieIdsArray.length === 0) {
          setActivities([]);
          setLoading(false);
          return;
        }

        const { data: movies } = await supabase
          .from('movies')
          .select('*')
          .in('id', movieIdsArray);

        // Group activities by movie
        const movieActivities: MovieActivity[] = [];

        movies?.forEach((movie: Movie) => {
          const movieTags = userTags?.filter((tag: UserTagWithDetails) => tag.movie_id === movie.id) || [];
          const movieCategories = userCategories?.filter((cat: UserCategoryWithDetails) => cat.movie_id === movie.id) || [];
          const movieNotes = userNotes?.filter((note: UserNote) => note.movie_id === movie.id) || [];

          // Find the most recent activity date
          const allDates = [
            ...movieTags.map((t: UserTagWithDetails) => t.created_at),
            ...movieCategories.map((c: UserCategoryWithDetails) => c.created_at),
            ...movieNotes.map((n: UserNote) => n.created_at)
          ];
          
          const lastActivity = allDates.sort().reverse()[0] || new Date().toISOString();

          movieActivities.push({
            movie,
            tags: movieTags,
            categories: movieCategories,
            notes: movieNotes,
            lastActivity
          });
        });

        // Sort by most recent activity
        movieActivities.sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());

        setActivities(movieActivities);

        // Calculate stats
        setStats({
          totalMovies: movieActivities.length,
          totalTags: userTags?.length || 0,
          totalCategories: userCategories?.length || 0,
          totalNotes: userNotes?.length || 0
        });

      } catch (error) {
        console.error('Error fetching user activity:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserActivity();
  }, [userId]);

  return { activities, loading, stats };
}
