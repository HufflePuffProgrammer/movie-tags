import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

type Category = Database['public']['Tables']['categories']['Row'];
type Tag = Database['public']['Tables']['tags']['Row'];

export class PersonalizationService {
  constructor(private supabase: SupabaseClient) {}
  
  // Tag operations
  async getUserTags(userId: string, movieId: number) {
    return this.supabase
      .from('user_movie_tags')
      .select(`
        *,
        tag:tags(*)
      `)
      .eq('user_id', userId)
      .eq('movie_id', movieId);
  }
  
  async addTag(userId: string, movieId: number, tagId: number) {
    return this.supabase
      .from('user_movie_tags')
      .insert({
        user_id: userId,
        movie_id: movieId,
        tag_id: tagId
      })
      .select(`
        *,
        tag:tags(*)
      `)
      .single();
  }
  
  async removeTag(tagId: number, userId: string) {
    return this.supabase
      .from('user_movie_tags')
      .delete()
      .eq('id', tagId)
      .eq('user_id', userId);
  }
  
  // Category operations
  async getUserCategories(userId: string, movieId: number) {
    return this.supabase
      .from('user_movie_categories')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('user_id', userId)
      .eq('movie_id', movieId);
  }
  
  async addCategory(userId: string, movieId: number, categoryId: number) {
    return this.supabase
      .from('user_movie_categories')
      .insert({
        user_id: userId,
        movie_id: movieId,
        category_id: categoryId
      })
      .select(`
        *,
        category:categories(*)
      `)
      .single();
  }
  
  async removeCategory(categoryId: number, userId: string) {
    return this.supabase
      .from('user_movie_categories')
      .delete()
      .eq('id', categoryId)
      .eq('user_id', userId);
  }
  
  // Note operations
  async getUserNotes(userId: string, movieId: number) {
    return this.supabase
      .from('user_notes')
      .select('*')
      .eq('user_id', userId)
      .eq('movie_id', movieId)
      .order('created_at', { ascending: false });
  }
  
  async addNote(userId: string, movieId: number, content: string) {
    return this.supabase
      .from('user_notes')
      .insert({
        user_id: userId,
        movie_id: movieId,
        content: content
      })
      .select()
      .single();
  }
  
  async removeNote(noteId: number, userId: string) {
    return this.supabase
      .from('user_notes')
      .delete()
      .eq('id', noteId)
      .eq('user_id', userId);
  }
}