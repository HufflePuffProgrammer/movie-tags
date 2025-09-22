-- Fix RLS policies to enable collaborative filtering
-- Allow everyone to READ user tagging data while keeping WRITE access restricted

-- =====================================================
-- DROP EXISTING RESTRICTIVE POLICIES
-- =====================================================

-- Drop existing user_movie_tags policies
DROP POLICY IF EXISTS "user_movie_tags_self_access" ON public.user_movie_tags;

-- Drop existing user_movie_categories policies
DROP POLICY IF EXISTS "user_movie_categories_select_own" ON public.user_movie_categories;
DROP POLICY IF EXISTS "user_movie_categories_insert_own" ON public.user_movie_categories;
DROP POLICY IF EXISTS "user_movie_categories_update_own" ON public.user_movie_categories;
DROP POLICY IF EXISTS "user_movie_categories_delete_own" ON public.user_movie_categories;

-- =====================================================
-- CREATE NEW COLLABORATIVE POLICIES
-- =====================================================

-- USER_MOVIE_TAGS: Everyone can read, only owners can modify
CREATE POLICY "user_movie_tags_public_read" ON public.user_movie_tags
  FOR SELECT USING (true);

CREATE POLICY "user_movie_tags_owner_write" ON public.user_movie_tags
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_movie_tags_owner_update" ON public.user_movie_tags
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "user_movie_tags_owner_delete" ON public.user_movie_tags
  FOR DELETE USING (auth.uid() = user_id);

-- USER_MOVIE_CATEGORIES: Everyone can read, only owners can modify
CREATE POLICY "user_movie_categories_public_read" ON public.user_movie_categories
  FOR SELECT USING (true);

CREATE POLICY "user_movie_categories_owner_write" ON public.user_movie_categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_movie_categories_owner_update" ON public.user_movie_categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "user_movie_categories_owner_delete" ON public.user_movie_categories
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- VERIFY POLICIES
-- =====================================================

-- Check that policies were created correctly
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('user_movie_tags', 'user_movie_categories')
ORDER BY tablename, policyname;
