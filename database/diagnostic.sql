-- Step-by-step diagnostic to find the root cause
-- Run each query separately and check the results

-- 1. Check if profiles table exists and structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 2. Check if trigger exists
SELECT 
    trigger_name, 
    event_manipulation, 
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 3. Check if function exists
SELECT 
    routine_name, 
    routine_type,
    security_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_name = 'handle_new_user';

-- 4. Check RLS policies
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    roles, 
    cmd, 
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'profiles';

-- 5. Test manual profile creation (this will show us the exact error)
-- Replace the UUID with a test value
DO $$
DECLARE
    test_user_id UUID := gen_random_uuid();
    test_email TEXT := 'test@example.com';
    test_display_name TEXT := 'Test User';
BEGIN
    RAISE NOTICE 'Testing profile creation...';
    
    INSERT INTO public.profiles (id, display_name, email, created_at, updated_at)
    VALUES (test_user_id, test_display_name, test_email, NOW(), NOW());
    
    RAISE NOTICE 'Profile creation successful!';
    
    -- Clean up the test
    DELETE FROM public.profiles WHERE id = test_user_id;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Profile creation failed: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
END $$;
