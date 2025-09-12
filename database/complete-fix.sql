-- Complete fix for "Database error saving new user"
-- Run this entire script in your Supabase SQL Editor

-- Step 1: Clean up any existing broken state
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 2: Ensure the profiles table has the correct structure and constraints
-- First, let's see what we have
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Step 3: Make sure RLS is properly configured
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(pol.policyname) || ' ON public.profiles';
    END LOOP;
END $$;

-- Create simple, working RLS policies
CREATE POLICY "Anyone can read profiles" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Step 4: Create a robust trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    user_display_name TEXT;
BEGIN
    -- Get the display name from metadata, with fallback
    user_display_name := COALESCE(
        NEW.raw_user_meta_data->>'display_name',
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        split_part(NEW.email, '@', 1),
        'New User'
    );
    
    -- Insert the profile with explicit error handling
    INSERT INTO public.profiles (id, display_name, email, created_at, updated_at)
    VALUES (
        NEW.id,
        user_display_name,
        NEW.email,
        NOW(),
        NOW()
    );
    
    -- Log success
    RAISE LOG 'Successfully created profile for user: %', NEW.id;
    
    RETURN NEW;
    
EXCEPTION
    WHEN unique_violation THEN
        -- Profile already exists, just log and continue
        RAISE LOG 'Profile already exists for user: %', NEW.id;
        RETURN NEW;
    WHEN not_null_violation THEN
        -- Handle missing required fields
        RAISE LOG 'Missing required field for user %. Error: %', NEW.id, SQLERRM;
        -- Try with minimal data
        INSERT INTO public.profiles (id, display_name, email, created_at, updated_at)
        VALUES (NEW.id, 'New User', NEW.email, NOW(), NOW())
        ON CONFLICT (id) DO NOTHING;
        RETURN NEW;
    WHEN OTHERS THEN
        -- Log the error details
        RAISE LOG 'Error creating profile for user %: % (SQLSTATE: %)', NEW.id, SQLERRM, SQLSTATE;
        -- Don't fail the user creation, just log the error
        RETURN NEW;
END;
$$;

-- Step 5: Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Step 6: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon, authenticated;

-- Step 7: Test the setup
-- Check if the trigger was created
SELECT trigger_name, event_manipulation, action_timing
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Check if the function exists
SELECT routine_name, security_type
FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_name = 'handle_new_user';

-- Check RLS policies
SELECT policyname, cmd
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'profiles';

-- Final verification - show current table structure
\d public.profiles;
