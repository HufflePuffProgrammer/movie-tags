-- Fix RLS policies for tags using user ID instead of email
-- =====================================================

-- Drop existing admin policies
DROP POLICY IF EXISTS "tags_admin_insert" ON public.tags;
DROP POLICY IF EXISTS "tags_admin_update" ON public.tags;
DROP POLICY IF EXISTS "tags_admin_delete" ON public.tags;

-- Option 1: Use specific user ID (replace with your actual user ID)
-- Get your user ID by running: SELECT auth.uid();

CREATE POLICY "tags_admin_insert" ON public.tags
  FOR INSERT 
  WITH CHECK (
    auth.uid() IN (
      'your-user-id-here'::uuid  -- Replace with your actual user ID
    )
  );

CREATE POLICY "tags_admin_update" ON public.tags
  FOR UPDATE 
  USING (
    auth.uid() IN (
      'your-user-id-here'::uuid  -- Replace with your actual user ID
    )
  )
  WITH CHECK (
    auth.uid() IN (
      'your-user-id-here'::uuid  -- Replace with your actual user ID
    )
  );

CREATE POLICY "tags_admin_delete" ON public.tags
  FOR DELETE 
  USING (
    auth.uid() IN (
      'your-user-id-here'::uuid  -- Replace with your actual user ID
    )
  );

-- Option 2: Alternative using auth.users table join
-- (Uncomment these if Option 1 doesn't work)

/*
CREATE POLICY "tags_admin_insert_v2" ON public.tags
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND email = 'testuser02@email.com'
    )
  );

CREATE POLICY "tags_admin_update_v2" ON public.tags
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND email = 'testuser02@email.com'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND email = 'testuser02@email.com'
    )
  );

CREATE POLICY "tags_admin_delete_v2" ON public.tags
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND email = 'testuser02@email.com'
    )
  );
*/

-- Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'tags'
ORDER BY policyname;
