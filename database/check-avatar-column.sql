-- Check if avatar_url column exists in profiles table
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check current profiles data
SELECT 
    id,
    user_name,
    full_name,
    email,
    avatar_url,
    bio,
    created_at,
    updated_at
FROM profiles;

-- Test if we can update avatar_url (replace 'your-user-id' with actual user ID)
-- UPDATE profiles 
-- SET avatar_url = 'https://test-avatar.com/test.jpg', 
--     updated_at = NOW()
-- WHERE id = 'your-user-id';

-- Check RLS policies for profiles table
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
WHERE tablename = 'profiles';
