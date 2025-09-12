-- Debug and fix the signup issue
-- Run these queries one by one in your Supabase SQL Editor

-- 1. First, let's check if the profiles table exists and has the right structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 2. Check if the trigger exists
SELECT trigger_name, event_manipulation, action_timing, action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 3. Check RLS policies on profiles table
SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'profiles';

-- 4. Let's ensure RLS is enabled and policies are correct
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "users_can_view_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "users_can_update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "users_can_insert_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_self_access" ON public.profiles;

-- Create clean, simple RLS policies
CREATE POLICY "Enable read access for all users" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for users based on user_id" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users based on user_id" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 5. Make sure the trigger function has proper permissions
-- Recreate the trigger function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'New User'),
    NEW.email
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log the error (this will appear in Supabase logs)
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    -- Re-raise the exception to fail the signup if profile creation fails
    RAISE;
END;
$$;

-- 6. Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Test the function manually (replace with a test UUID)
-- DO $$
-- BEGIN
--   PERFORM public.handle_new_user();
-- END $$;
