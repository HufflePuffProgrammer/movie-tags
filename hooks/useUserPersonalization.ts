'use client'

import { useState, useEffect, useMemo, useCallback } from 'react';
import { createClient } from '@/lib/supabase-client';
import { Database } from '@/types/database';
import { useNotification } from './useNotification';
import { PersonalizationService } from '@/lib/services/personalization-service';


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

export function useUserPersonalization(movieId: string, userId?: string) {
  const [userTags, setUserTags] = useState<UserTagWithDetails[]>([]);
  const [userCategories, setUserCategories] = useState<UserCategoryWithDetails[]>([]);
  const [userNotes, setUserNotes] = useState<UserNote[]>([]);
  const { notification, showSuccess, showError, setNotification } = useNotification();

  // ✅ Create Supabase client once at hook level
  const supabase = useMemo(() => createClient(), []);
  const service = useMemo(() => new PersonalizationService(supabase), [supabase]);

  // ✅ Wrap in useCallback with proper dependencies
  const fetchUserPersonalization = useCallback(async () => {
    if (!userId || !movieId) return;

    try {
      // Fetch user's categories for this movie
      const { data: userMovieCategories, error: userCategoriesError } = await service.getUserCategories(userId, parseInt(movieId));

      if (userCategoriesError) {
        console.error('Error fetching user categories:', userCategoriesError);
      } else {
        setUserCategories(userMovieCategories || []);
      }

      // Fetch user's tags for this movie
      const { data: userTags, error: userTagsError } = await service.getUserTags(userId, parseInt(movieId));
      
      if (userTagsError) {
        console.error('Error fetching user tags:', userTagsError);
      } else {
        setUserTags(userTags || []);
      }

      // Fetch user's notes for this movie
      const { data: userNotes, error: userNotesError } = await service.getUserNotes(userId, parseInt(movieId));

      if (userNotesError) {
        console.error('Error fetching user notes:', userNotesError);
      } else {
        setUserNotes(userNotes || []);
      }
    } catch (error) {
      console.error('Error fetching user personalization:', error);
    }
  }, [userId, movieId, service]);

  useEffect(() => {
    fetchUserPersonalization();
  }, [fetchUserPersonalization]);

  // Tag operations
  const addTag = async (tag: Tag) => {
    if (!userId || !movieId) return;
    
    // Create optimistic tag
    const optimisticTag: UserTagWithDetails = {
      id: Date.now(), // Temporary ID
      user_id: userId,
      movie_id: parseInt(movieId),
      tag_id: tag.id,
      tag,
      created_at: new Date().toISOString()
    };
    
    // Optimistically update UI
    setUserTags(prevTags => [...prevTags, optimisticTag]);
    
    try {
      const { data, error } = await service.addTag(userId, parseInt(movieId), tag.id);

      if (error) {
      // Rollback on error
      setUserTags(prevTags => prevTags.filter(t => t.id !== optimisticTag.id));
      
        console.error('Error adding tag:', error);
        if (error.code === '23505') { // Unique constraint violation
          showError('You have already added this tag to this movie.');
        } else {
          showError('Failed to add tag. Please try again.');
        }
      } else {
        // Refresh the user's tags (same pattern as categories)
        // Replace temporary tag with real data
        setUserTags(prevTags => 
          prevTags.map(t => t.id === optimisticTag.id ? data : t)
        );
        showSuccess('Tag added successfully!');
      }
    } catch (error) {
      // Rollback on error
      setUserTags(prevTags => prevTags.filter(t => t.id !== optimisticTag.id));
      console.error('Error adding tag:', error);
      showError('Failed to add tag. Please try again.');
    }
  };

  const removeTag = async (userMovieTagId: number) => {
    if (!userId) return;
    
    try {
      const { error } = await service.removeTag(userMovieTagId, userId);
      
      if (error) {
        console.error('Error removing tag:', error);
        showError('Failed to remove tag. Please try again.');
      } else {
        // Update local state to remove the tag
        setUserTags(userTags.filter(userTag => userTag.id !== userMovieTagId));
        showSuccess( 'Tag removed successfully!');
      }
    } catch (error) {
      console.error('Error removing tag:', error);
      showError( 'Failed to remove tag. Please try again.');
    }
  };

  // Category operations
  const addCategory = async (category: Category) => {
    if (!userId || !movieId) return;
    
    // Create optimistic category
    const optimisticCategory: UserCategoryWithDetails = {
      id: Date.now(), // Temporary ID
      user_id: userId,
      movie_id: parseInt(movieId),
      category_id: category.id,
      category,
      created_at: new Date().toISOString()
    };
    
    // Optimistically update UI
    setUserCategories(prevCategories => [...prevCategories, optimisticCategory]);
    
    try {
      const { data, error } = await service.addCategory(userId, parseInt(movieId), category.id);

      if (error) {
        // Rollback on error
        setUserCategories(prevCategories => 
          prevCategories.filter(c => c.id !== optimisticCategory.id)
        );
        
        console.error('Error adding category:', error);
        // Handle specific error cases
        if (error.code === '23505') { // Unique constraint violation
          showError('You have already added this category to this movie.');
        } else {
          showError('Failed to add category. Please try again.');
        }
      } else {
        // Replace temporary category with real data
        setUserCategories(prevCategories => 
          prevCategories.map(c => c.id === optimisticCategory.id ? data : c)
        );       
        showSuccess('Category added successfully!');
      }
    } catch (error) {
      // Rollback on error
      setUserCategories(prevCategories => 
        prevCategories.filter(c => c.id !== optimisticCategory.id)
      );
      
      console.error('Error adding category:', error);
      showError('Failed to add category. Please try again.');
    }
  };

  const removeCategory = async (categoryId: number) => {
    if (!userId || !movieId) return;
    
    try {
      const { error } = await service.removeCategory(categoryId, userId);
      
      if (error) {
        console.error('Error removing category:', error);
        showError('Failed to remove category. Please try again.');

      } else {
        // Update local state to remove the category
        setUserCategories(userCategories.filter(category => category.id !== categoryId));
        showSuccess('Category removed successfully!');

      }
    } catch (error) {
      console.error('Error removing category:', error);
      showError('Failed to remove category. Please try again.');
    }
  };

  // Note operations
  const addNote = async (content: string) => {
    if (!userId || !movieId) return;
    
    // Create optimistic note
    const optimisticNote: UserNote = {
      id: Date.now(), // Temporary ID
      user_id: userId,
      movie_id: parseInt(movieId),
      content: content,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Optimistically update UI (add to beginning since notes are ordered by created_at desc)
    setUserNotes(prevNotes => [optimisticNote, ...prevNotes]);
    
    try {
      const { data, error } = await service.addNote(userId, parseInt(movieId), content);
      
      if (error) {
        // Rollback on error
        setUserNotes(prevNotes => prevNotes.filter(n => n.id !== optimisticNote.id));
        
        console.error('Error adding note:', error);
        showError('Failed to add note. Please try again.');

      } else {
        // Replace temporary note with real data
        setUserNotes(prevNotes => 
          prevNotes.map(n => n.id === optimisticNote.id ? data : n)
        );
        showSuccess('Note added successfully!');

      }
    } catch (error) {
      // Rollback on error
      setUserNotes(prevNotes => prevNotes.filter(n => n.id !== optimisticNote.id));
      
      console.error('Error adding note:', error);
      showError('Failed to add note. Please try again.');

    }
  };

  const removeNote = async (noteId: number) => {
    if (!userId) return;
    
    try {
      const { error } = await service.removeNote(noteId, userId);
      
      if (error) {
        console.error('Error removing note:', error);
        showError('Failed to remove note. Please try again.');

      } else {
        // Update local state to remove the note
        setUserNotes(userNotes.filter(note => note.id !== noteId));
        showSuccess('Note removed successfully!');

      }
    } catch (error) {
      console.error('Error removing note:', error);
      showError('Failed to remove note. Please try again.');

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
