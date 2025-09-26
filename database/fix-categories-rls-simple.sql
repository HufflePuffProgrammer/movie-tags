-- Simple fix for categories RLS - allow all authenticated users to manage categories
-- (You can restrict this later to specific users if needed)
-- =====================================================

-- Drop existing problematic policies
DROP POLICY IF EXISTS "categories_insert_authenticated" ON public.categories;
DROP POLICY IF EXISTS "categories_update_authenticated" ON public.categories;
DROP POLICY IF EXISTS "categories_admin_insert" ON public.categories;
DROP POLICY IF EXISTS "categories_admin_update" ON public.categories;
DROP POLICY IF EXISTS "categories_admin_delete" ON public.categories;

-- Simple approach: Allow all authenticated users to manage categories
-- (This is temporary - you can make it more restrictive later)

CREATE POLICY "categories_insert_authenticated" ON public.categories
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "categories_update_authenticated" ON public.categories
  FOR UPDATE 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "categories_delete_authenticated" ON public.categories
  FOR DELETE 
  USING (auth.role() = 'authenticated');

-- Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'categories'
ORDER BY policyname;
