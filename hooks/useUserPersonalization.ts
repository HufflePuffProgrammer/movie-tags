'use client'

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';
import { Database } from '@/types/database';

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

interface NotificationState {
  type: 'success' | 'error';
  message: string;
}

export function useUserPersonalization(movieId: string, userId?: string) {
  const [userTags, setUserTags] = useState<UserTagWithDetails[]>([]);
  const [userCategories, setUserCategories] = useState<UserCategoryWithDetails[]>([]);
  const [userNotes, setUserNotes] = useState<UserNote[]>([]);
  const [notification, setNotification] = useState<NotificationState | null>(null);

  const fetchUserPersonalization = async () => {
    if (!userId || !movieId) return;

    try {
      const supabase = createClient();

      // Fetch user's categories for this movie
      const { data: userMovieCategories, error: userCategoriesError } = await supabase
        .from('user_movie_categories')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('user_id', userId)
        .eq('movie_id', parseInt(movieId));

      if (userCategoriesError) {
        console.error('Error fetching user categories:', userCategoriesError);
      } else {
        setUserCategories(userMovieCategories || []);
      }

      // Fetch user's tags for this movie
      const { data: userTags, error: userTagsError } = await supabase
        .from('user_movie_tags')
        .select(`
          *,
          tag:tags(*)
        `)
        .eq('user_id', userId)
        .eq('movie_id', parseInt(movieId));

      if (userTagsError) {
        console.error('Error fetching user tags:', userTagsError);
      } else {
        setUserTags(userTags || []);
      }

      // Fetch user's notes for this movie
      const { data: userNotes, error: userNotesError } = await supabase
        .from('user_notes')
        .select('*')
        .eq('user_id', userId)
        .eq('movie_id', parseInt(movieId))
        .order('created_at', { ascending: false });

      if (userNotesError) {
        console.error('Error fetching user notes:', userNotesError);
      } else {
        setUserNotes(userNotes || []);
      }
    } catch (error) {
      console.error('Error fetching user personalization:', error);
    }
  };

  useEffect(() => {
    fetchUserPersonalization();
  }, [movieId, userId]);

  // Tag operations
  const addTag = async (tag: Tag) => {
    if (!userId || !movieId) return;
    
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('user_movie_tags')
        .insert({
          user_id: userId,
          movie_id: parseInt(movieId),
          tag_id: tag.id
        } as any)
        .select(`
          *,
          tag:tags(*)
        `)
        .single();

      if (error) {
        console.error('Error adding tag:', error);
        if (error.code === '23505') { // Unique constraint violation
          setNotification({
            type: 'error',
            message: 'You have already added this tag to this movie.'
          });
        } else {
          setNotification({
            type: 'error',
            message: 'Failed to add tag. Please try again.'
          });
        }
      } else {
        // Refresh the user's tags (same pattern as categories)
        fetchUserPersonalization();
        setNotification({
          type: 'success',
          message: 'Tag added successfully!'
        });
      }
    } catch (error) {
      console.error('Error adding tag:', error);
      setNotification({
        type: 'error',
        message: 'Failed to add tag. Please try again.'
      });
    }
  };

  const removeTag = async (userMovieTagId: number) => {
    if (!userId) return;
    
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('user_movie_tags')
        .delete()
        .eq('id', userMovieTagId)
        .eq('user_id', userId); // Additional security check
      
      if (error) {
        console.error('Error removing tag:', error);
        setNotification({
          type: 'error',
          message: 'Failed to remove tag. Please try again.'
        });
      } else {
        // Update local state to remove the tag
        setUserTags(userTags.filter(userTag => userTag.id !== userMovieTagId));
        setNotification({
          type: 'success',
          message: 'Tag removed successfully!'
        });
      }
    } catch (error) {
      console.error('Error removing tag:', error);
      setNotification({
        type: 'error',
        message: 'Failed to remove tag. Please try again.'
      });
    }
  };

  // Category operations
  const addCategory = async (category: Category) => {
    if (!userId || !movieId) return;
    
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('user_movie_categories')
        .insert({
          user_id: userId,
          movie_id: parseInt(movieId),
          category_id: category.id
        } as any);

      if (error) {
        console.error('Error adding category:', error);
        // Handle specific error cases
        if (error.code === '23505') { // Unique constraint violation
          setNotification({
            type: 'error',
            message: 'You have already added this category to this movie.'
          });
        } else {
          setNotification({
            type: 'error',
            message: 'Failed to add category. Please try again.'
          });
        }
      } else {
        // Refresh the user's categories
        fetchUserPersonalization();
        setNotification({
          type: 'success',
          message: 'Category added successfully!'
        });
      }
    } catch (error) {
      console.error('Error adding category:', error);
      setNotification({
        type: 'error',
        message: 'Failed to add category. Please try again.'
      });
    }
  };

  const removeCategory = async (categoryId: number) => {
    if (!userId || !movieId) return;
    
    try {
      const supabase = createClient();
      
      // Delete the user_movie_category record
      const { error } = await supabase
        .from('user_movie_categories')
        .delete()
        .eq('id', categoryId)
        .eq('user_id', userId); // Additional security check
      
      if (error) {
        console.error('Error removing category:', error);
        setNotification({
          type: 'error',
          message: 'Failed to remove category. Please try again.'
        });
      } else {
        // Update local state to remove the category
        setUserCategories(userCategories.filter(category => category.id !== categoryId));
        setNotification({
          type: 'success',
          message: 'Category removed successfully!'
        });
      }
    } catch (error) {
      console.error('Error removing category:', error);
      setNotification({
        type: 'error',
        message: 'Failed to remove category. Please try again.'
      });
    }
  };

  // Note operations
  const addNote = async (content: string) => {
    if (!userId || !movieId) return;
    
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('user_notes')
        .insert({
          user_id: userId,
          movie_id: parseInt(movieId),
          content: content
        } as any)
        .select()
        .single();

      if (error) {
        console.error('Error adding note:', error);
        setNotification({
          type: 'error',
          message: 'Failed to add note. Please try again.'
        });
      } else {
        // Refresh the user's data (same pattern as tags and categories)
        fetchUserPersonalization();
        setNotification({
          type: 'success',
          message: 'Note added successfully!'
        });
      }
    } catch (error) {
      console.error('Error adding note:', error);
      setNotification({
        type: 'error',
        message: 'Failed to add note. Please try again.'
      });
    }
  };

  const removeNote = async (noteId: number) => {
    if (!userId) return;
    
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('user_notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', userId); // Additional security check
      
      if (error) {
        console.error('Error removing note:', error);
        setNotification({
          type: 'error',
          message: 'Failed to remove note. Please try again.'
        });
      } else {
        // Update local state to remove the note
        setUserNotes(userNotes.filter(note => note.id !== noteId));
        setNotification({
          type: 'success',
          message: 'Note removed successfully!'
        });
      }
    } catch (error) {
      console.error('Error removing note:', error);
      setNotification({
        type: 'error',
        message: 'Failed to remove note. Please try again.'
      });
    }
  };

  return {
    userTags,
    userCategories,
    userNotes,
    notification,
    setNotification,
    addTag,
    removeTag,
    addCategory,
    removeCategory,
    addNote,
    removeNote
  };
}
