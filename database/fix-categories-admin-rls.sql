-- Fix RLS policies for categories table to allow admin operations
-- =====================================================

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "categories_insert_authenticated" ON public.categories;
DROP POLICY IF EXISTS "categories_update_authenticated" ON public.categories;
DROP POLICY IF EXISTS "categories_admin_insert" ON public.categories;
DROP POLICY IF EXISTS "categories_admin_update" ON public.categories;
DROP POLICY IF EXISTS "categories_admin_delete" ON public.categories;

-- Allow admins to insert categories
-- Replace with your actual admin email or user ID
CREATE POLICY "categories_admin_insert" ON public.categories
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND email = 'testuser02@email.com'  -- Replace with your admin email
    )
  );

-- Allow admins to update categories
CREATE POLICY "categories_admin_update" ON public.categories
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND email = 'testuser02@email.com'  -- Replace with your admin email
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND email = 'testuser02@email.com'  -- Replace with your admin email
    )
  );

-- Allow admins to delete categories
CREATE POLICY "categories_admin_delete" ON public.categories
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND email = 'testuser02@email.com'  -- Replace with your admin email
    )
  );

-- Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'categories'
ORDER BY policyname;
