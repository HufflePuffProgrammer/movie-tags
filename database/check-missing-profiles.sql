-- Check for users without profiles and create them
-- Run this in your Supabase SQL Editor

-- First, let's see which users exist without profiles
SELECT 
    'Users without profiles:' as info,
    u.id,
    u.email,
    u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ORDER BY u.created_at DESC;

-- Create profiles for users that don't have them
INSERT INTO public.profiles (id, display_name, email, created_at, updated_at)
SELECT 
    u.id,
    COALESCE(u.raw_user_meta_data->>'display_name', 'New User') as display_name,
    u.email,
    u.created_at,
    NOW() as updated_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Verify all users now have profiles
SELECT 
    'Verification - Users with profiles:' as info,
    COUNT(*) as users_with_profiles
FROM auth.users u
INNER JOIN public.profiles p ON u.id = p.id;

SELECT 
    'Verification - Users without profiles:' as info,
    COUNT(*) as users_without_profiles
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;
