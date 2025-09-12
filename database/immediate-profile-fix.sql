-- Immediate fix for missing profile issue
-- Run this to diagnose and fix the profile loading problem

-- Step 1: Check what users exist in auth.users
SELECT 
    'Users in auth.users:' as info,
    id,
    email,
    created_at
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- Step 2: Check what profiles exist
SELECT 
    'Profiles in public.profiles:' as info,
    id,
    COALESCE(user_name, 'NULL') as user_name,
    COALESCE(full_name, 'NULL') as full_name,
    COALESCE(display_name, 'NULL') as display_name,
    email
FROM public.profiles 
ORDER BY created_at DESC 
LIMIT 5;

-- Step 3: Find users without profiles
SELECT 
    'Users WITHOUT profiles:' as info,
    u.id,
    u.email,
    u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ORDER BY u.created_at DESC;

-- Step 4: Create profiles for users that don't have them
-- This will create a profile for each user missing one
INSERT INTO public.profiles (
    id, 
    user_name, 
    full_name, 
    email, 
    created_at, 
    updated_at
)
SELECT 
    u.id,
    COALESCE(
        u.raw_user_meta_data->>'user_name',
        split_part(u.email, '@', 1),
        'user_' || substring(u.id::text, 1, 8)
    ) as user_name,
    COALESCE(
        u.raw_user_meta_data->>'full_name',
        u.raw_user_meta_data->>'display_name',
        'New User'
    ) as full_name,
    u.email,
    u.created_at,
    NOW()
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Step 5: Verify all users now have profiles
SELECT 
    'Verification - All users should now have profiles:' as info,
    u.id,
    u.email,
    p.user_name,
    p.full_name
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC
LIMIT 5;

-- Step 6: Check for any remaining users without profiles
SELECT 
    'Remaining users without profiles (should be empty):' as info,
    COUNT(*) as count
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Final message
SELECT 'Profile creation complete! Try refreshing your profile page.' as final_status;
