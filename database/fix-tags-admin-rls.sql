-- Fix RLS policies for tags table to allow admin operations
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "tags_admin_insert" ON public.tags;
DROP POLICY IF EXISTS "tags_admin_update" ON public.tags;
DROP POLICY IF EXISTS "tags_admin_delete" ON public.tags;

-- Allow admins to insert tags
-- Replace 'your-admin-email@example.com' with your actual admin email
CREATE POLICY "tags_admin_insert" ON public.tags
  FOR INSERT 
  WITH CHECK (
    auth.jwt() ->> 'email' IN (
      'wdrum@example.com',  -- Replace with your actual admin email
      'admin@yourdomain.com'  -- Add more admin emails as needed
      'testuser02@example.com'
    )
  );

-- Allow admins to update tags
CREATE POLICY "tags_admin_update" ON public.tags
  FOR UPDATE 
  USING (
    auth.jwt() ->> 'email' IN (
      'wdrum@example.com',  -- Replace with your actual admin email
      'admin@yourdomain.com'  -- Add more admin emails as needed
      'testuser02@example.com'
    )
  )
  WITH CHECK (
    auth.jwt() ->> 'email' IN (
      'wdrum@example.com',  -- Replace with your actual admin email
      'admin@yourdomain.com'  -- Add more admin emails as needed
      'testuser02@example.com'
    )
  );

-- Allow admins to delete tags
CREATE POLICY "tags_admin_delete" ON public.tags
  FOR DELETE 
  USING (
    auth.jwt() ->> 'email' IN (
      'wdrum@example.com',  -- Replace with your actual admin email
      'admin@yourdomain.com'  -- Add more admin emails as needed
      'testuser02@example.com'
    )
  );

-- Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'tags'
ORDER BY policyname;
