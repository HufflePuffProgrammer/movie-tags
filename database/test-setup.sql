-- Test the database setup
-- Run these queries to verify everything is working

-- 1. Check if we can insert a test profile (this simulates what the trigger does)
-- Replace 'test-uuid-here' with an actual UUID if you want to test
-- INSERT INTO public.profiles (id, display_name, email) 
-- VALUES ('123e4567-e89b-12d3-a456-426614174000', 'Test User', 'test@example.com');

-- 2. Check current profiles
SELECT id, display_name, email, created_at FROM public.profiles;

-- 3. Check if RLS is working - this should only show profiles you own
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "123e4567-e89b-12d3-a456-426614174000"}';
SELECT * FROM public.profiles;
RESET ROLE;

-- 4. Verify the trigger function exists and is accessible
SELECT routine_name, routine_type, security_type
FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_name = 'handle_new_user';

-- 5. Check auth.users table structure (to see what data is available)
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'auth' AND table_name = 'users'
ORDER BY ordinal_position;
