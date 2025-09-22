'use client'

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';
import { Database } from '@/types/database';

type Category = Database['public']['Tables']['categories']['Row'];
type UserMovieCategory = Database['public']['Tables']['user_movie_categories']['Row'];
type Tag = Database['public']['Tables']['tags']['Row'];
type UserMovieTag = Database['public']['Tables']['user_movie_tags']['Row'];

interface UserCategoryWithDetails extends UserMovieCategory {
  category: Category;
}

interface UserTagWithDetails extends UserMovieTag {
  tag: Tag;
}

export function useMovieTagsAndCategories(movieId: string) {
  const [allCategories, setAllCategories] = useState<UserCategoryWithDetails[]>([]);
  const [allTags, setAllTags] = useState<UserTagWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMovieTagsAndCategories() {
      if (!movieId) return;

      try {
        const supabase = createClient();

        // Fetch ALL users' categories for this movie (public read now allowed)
        const { data: movieCategories, error: categoriesError } = await supabase
          .from('user_movie_categories')
          .select(`
            *,
            category:categories(*)
          `)
          .eq('movie_id', parseInt(movieId));

        if (categoriesError) {
          console.error('Error fetching movie categories:', categoriesError);
        } else {
          setAllCategories(movieCategories || []);
        }

        // Fetch ALL users' tags for this movie (public read now allowed)
        const { data: movieTags, error: tagsError } = await supabase
          .from('user_movie_tags')
          .select(`
            *,
            tag:tags(*)
          `)
          .eq('movie_id', parseInt(movieId));

        if (tagsError) {
          console.error('Error fetching movie tags:', tagsError);
        } else {
          setAllTags(movieTags || []);
        }
      } catch (error) {
        console.error('Error fetching movie tags and categories:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMovieTagsAndCategories();
  }, [movieId]);

  // Get unique categories (remove duplicates if multiple users tagged with same category)
  const uniqueCategories = allCategories.reduce((unique, item) => {
    const exists = unique.find(u => u.category.id === item.category.id);
    if (!exists) {
      unique.push(item);
    }
    return unique;
  }, [] as UserCategoryWithDetails[]);

  // Get unique tags (remove duplicates if multiple users tagged with same tag)
  const uniqueTags = allTags.reduce((unique, item) => {
    const exists = unique.find(u => u.tag.id === item.tag.id);
    if (!exists) {
      unique.push(item);
    }
    return unique;
  }, [] as UserTagWithDetails[]);

  return {
    categories: uniqueCategories,
    tags: uniqueTags,
    loading,
    totalCategoryTags: allCategories.length,
    totalTags: allTags.length
  };
}
