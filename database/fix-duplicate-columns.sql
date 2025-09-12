-- Fix duplicate columns in profiles table
-- This will consolidate display_name and user_name columns

-- Step 1: Check current table structure
SELECT 
    'Current profiles table structure:' as info,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Step 2: Check existing data to understand what we have
SELECT 
    'Sample of existing data:' as info,
    id,
    COALESCE(display_name, 'NULL') as display_name,
    COALESCE(user_name, 'NULL') as user_name,
    COALESCE(full_name, 'NULL') as full_name,
    email
FROM public.profiles 
LIMIT 5;

-- Step 3: Migrate data from display_name to user_name if needed
-- Update user_name with display_name where user_name is null
UPDATE public.profiles 
SET user_name = display_name 
WHERE user_name IS NULL AND display_name IS NOT NULL;

-- Step 4: Create full_name from display_name if full_name is missing
UPDATE public.profiles 
SET full_name = display_name 
WHERE full_name IS NULL AND display_name IS NOT NULL;

-- Step 5: Set defaults for any remaining NULL values
-- Set default user_name based on email if still null
UPDATE public.profiles 
SET user_name = split_part(email, '@', 1)
WHERE user_name IS NULL AND email IS NOT NULL;

-- Set default full_name if still null
UPDATE public.profiles 
SET full_name = COALESCE(user_name, 'User')
WHERE full_name IS NULL;

-- Step 6: Make sure user_name and full_name are not null
ALTER TABLE public.profiles ALTER COLUMN user_name SET NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN full_name SET NOT NULL;

-- Step 7: Drop the duplicate display_name column
ALTER TABLE public.profiles DROP COLUMN IF EXISTS display_name;

-- Step 8: Verify the final structure
SELECT 
    'Final profiles table structure:' as info,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Step 9: Show sample of cleaned data
SELECT 
    'Final data sample:' as info,
    id,
    user_name,
    full_name,
    email,
    created_at
FROM public.profiles 
ORDER BY created_at DESC
LIMIT 5;

-- Step 10: Update the trigger function to use correct column names
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.profiles (id, user_name, full_name, email, created_at, updated_at)
    VALUES (
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data->>'user_name',
            split_part(NEW.email, '@', 1),
            'user_' || substring(NEW.id::text, 1, 8)
        ),
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'display_name',
            'New User'
        ),
        NEW.email,
        NOW(),
        NOW()
    );
    RETURN NEW;
EXCEPTION
    WHEN unique_violation THEN
        -- Profile already exists, that's ok
        RETURN NEW;
    WHEN OTHERS THEN
        -- Log error but don't fail the signup
        RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Final verification
SELECT 'Database cleanup complete!' as status;
