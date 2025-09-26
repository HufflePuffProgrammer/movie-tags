-- Debug admin access and RLS policies
-- =====================================================

-- 1. Check current RLS policies on tags table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'tags'
ORDER BY policyname;

-- 2. Check what's in your current JWT token
SELECT 
  auth.uid() as user_id,
  auth.jwt() ->> 'email' as jwt_email,
  auth.jwt() ->> 'aud' as audience,
  auth.jwt() ->> 'role' as role,
  auth.jwt() as full_jwt;

-- 3. Test if you can select from tags (should work)
SELECT COUNT(*) as tag_count FROM public.tags;

-- 4. Test a simple update without RLS to see the actual error
-- (This will help us understand what's blocking the update)
ALTER TABLE public.tags DISABLE ROW LEVEL SECURITY;

-- Try to update a tag (replace ID 2 with an actual tag ID from your database)
UPDATE public.tags 
SET description = 'Test update - ' || NOW()::text 
WHERE id = 2;

-- Check if the update worked
SELECT id, name, description, created_at 
FROM public.tags 
WHERE id = 2;

-- Re-enable RLS
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
