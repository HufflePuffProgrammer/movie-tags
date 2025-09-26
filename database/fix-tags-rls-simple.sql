-- Simple fix for tags RLS - allow all authenticated users to manage tags
-- (You can restrict this later to specific users if needed)
-- =====================================================

-- Drop existing problematic policies
DROP POLICY IF EXISTS "tags_admin_insert" ON public.tags;
DROP POLICY IF EXISTS "tags_admin_update" ON public.tags;
DROP POLICY IF EXISTS "tags_admin_delete" ON public.tags;

-- Simple approach: Allow all authenticated users to manage tags
-- (This is temporary - you can make it more restrictive later)

CREATE POLICY "tags_insert_authenticated" ON public.tags
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "tags_update_authenticated" ON public.tags
  FOR UPDATE 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "tags_delete_authenticated" ON public.tags
  FOR DELETE 
  USING (auth.role() = 'authenticated');

-- Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'tags'
ORDER BY policyname;
