'use client'

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';
import { Database } from '@/types/database';

type Category = Database['public']['Tables']['categories']['Row'];
type UserMovieCategory = Database['public']['Tables']['user_movie_categories']['Row'];

interface UserCategoryWithDetails extends UserMovieCategory {
  category: Category;
}

interface UserTag {
  id: number;
  tag_name: string;
  color?: string;
}

interface UserNote {
  id: number;
  content: string;
  created_at: string;
}

interface NotificationState {
  type: 'success' | 'error';
  message: string;
}

export function useUserPersonalization(movieId: string, userId?: string) {
  const [userTags, setUserTags] = useState<UserTag[]>([]);
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

      // Keep mock data for tags and notes for now (will implement later)
      setUserTags([
        { id: 1, tag_name: 'male rear nudity', color: 'bg-blue-100 text-blue-800' },
        { id: 2, tag_name: 'cat', color: 'bg-green-100 text-green-800' },
        { id: 3, tag_name: 'new york city', color: 'bg-purple-100 text-purple-800' },
        { id: 4, tag_name: 'male nudity', color: 'bg-red-100 text-red-800' },
        { id: 5, tag_name: 'psychological thriller', color: 'bg-orange-100 text-orange-800' }
      ]);

      setUserNotes([
        { 
          id: 1, 
          content: 'Great character development and unexpected plot twists. The cinematography really captures the gritty atmosphere of 90s NYC.',
          created_at: '2024-01-15T10:30:00Z'
        }
      ]);
    } catch (error) {
      console.error('Error fetching user personalization:', error);
    }
  };

  useEffect(() => {
    fetchUserPersonalization();
  }, [movieId, userId]);

  // Tag operations
  const addTag = async (tagName: string) => {
    // Mock implementation - will be replaced with Supabase call
    const newTagObj: UserTag = {
      id: Date.now(),
      tag_name: tagName,
      color: 'bg-blue-100 text-blue-800'
    };
    
    setUserTags([...userTags, newTagObj]);
  };

  const removeTag = async (tagId: number) => {
    setUserTags(userTags.filter(tag => tag.id !== tagId));
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
    const newNoteObj: UserNote = {
      id: Date.now(),
      content: content,
      created_at: new Date().toISOString()
    };
    
    setUserNotes([...userNotes, newNoteObj]);
  };

  const removeNote = async (noteId: number) => {
    setUserNotes(userNotes.filter(note => note.id !== noteId));
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
