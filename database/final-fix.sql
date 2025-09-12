-- Final fix to match your exact database structure
-- Run this in your Supabase SQL Editor

-- First, let's see what trigger currently exists
SELECT trigger_name, event_manipulation, action_timing, action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Check the current function
SELECT routine_name, routine_definition 
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

-- Remove existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create the correct function for your exact table structure
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    user_display_name TEXT;
BEGIN
    -- Extract display_name from user metadata with multiple fallbacks
    user_display_name := COALESCE(
        NEW.raw_user_meta_data->>'display_name',
        NEW.raw_user_meta_data->>'full_name', 
        NEW.raw_user_meta_data->>'name',
        split_part(NEW.email, '@', 1),
        'New User'
    );
    
    -- Ensure we have a non-null display_name (required by your table)
    IF user_display_name IS NULL OR trim(user_display_name) = '' THEN
        user_display_name := 'New User';
    END IF;
    
    -- Insert with your exact table structure
    INSERT INTO public.profiles (
        id, 
        display_name, 
        email, 
        avatar_url, 
        bio, 
        created_at, 
        updated_at
    ) VALUES (
        NEW.id,
        user_display_name,
        NEW.email,
        NULL,  -- avatar_url starts as null
        NULL,  -- bio starts as null  
        NOW(),
        NOW()
    );
    
    RAISE LOG 'Created profile for user % with display_name: %', NEW.id, user_display_name;
    RETURN NEW;
    
EXCEPTION
    WHEN unique_violation THEN
        RAISE LOG 'Profile already exists for user: %', NEW.id;
        RETURN NEW;
    WHEN not_null_violation THEN
        RAISE LOG 'Not null violation for user %: %', NEW.id, SQLERRM;
        -- Try with guaranteed non-null values
        INSERT INTO public.profiles (id, display_name, email, created_at, updated_at)
        VALUES (NEW.id, 'New User', COALESCE(NEW.email, 'no-email'), NOW(), NOW())
        ON CONFLICT (id) DO NOTHING;
        RETURN NEW;
    WHEN OTHERS THEN
        RAISE LOG 'Error creating profile for user %: % (SQLSTATE: %)', NEW.id, SQLERRM, SQLSTATE;
        RAISE EXCEPTION 'Failed to create profile: %', SQLERRM;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Ensure proper RLS policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Clean existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.profiles;

-- Create working policies
CREATE POLICY "profiles_select_policy" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "profiles_insert_policy" ON public.profiles  
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_policy" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;

-- Test the setup
SELECT 
    'Trigger exists' as check_type,
    CASE WHEN COUNT(*) > 0 THEN '✓ YES' ELSE '✗ NO' END as status
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created'

UNION ALL

SELECT 
    'Function exists' as check_type,
    CASE WHEN COUNT(*) > 0 THEN '✓ YES' ELSE '✗ NO' END as status  
FROM information_schema.routines
WHERE routine_name = 'handle_new_user' AND routine_schema = 'public'

UNION ALL

SELECT 
    'RLS enabled' as check_type,
    CASE WHEN relrowsecurity THEN '✓ YES' ELSE '✗ NO' END as status
FROM pg_class 
WHERE relname = 'profiles' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
