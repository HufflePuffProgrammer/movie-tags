-- Emergency fix: Disable trigger and enable email confirmation without profile creation
-- This will allow signups to work while we debug the profile issue

-- Step 1: Remove the problematic trigger completely
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 2: Make profiles table more permissive temporarily
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Step 3: Create a simple function that won't fail
CREATE OR REPLACE FUNCTION public.create_user_profile(
    user_id UUID,
    user_email TEXT,
    user_display_name TEXT DEFAULT 'New User'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name, email, created_at, updated_at)
    VALUES (user_id, user_display_name, user_email, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        email = EXCLUDED.email,
        updated_at = NOW();
END;
$$;

-- Step 4: Test the function
SELECT public.create_user_profile(
    gen_random_uuid(), 
    'test@example.com', 
    'Test User'
);

-- Clean up test
DELETE FROM public.profiles WHERE email = 'test@example.com';

-- Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create simple policies
DROP POLICY IF EXISTS "profiles_policy" ON public.profiles;
CREATE POLICY "profiles_policy" ON public.profiles 
    FOR ALL USING (true) WITH CHECK (true);
