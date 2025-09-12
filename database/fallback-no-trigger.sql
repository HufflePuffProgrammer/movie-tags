-- Fallback approach: Disable the trigger and handle profile creation manually
-- Use this if the trigger approach keeps failing

-- Step 1: Remove the problematic trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 2: Ensure RLS allows manual profile creation
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(pol.policyname) || ' ON public.profiles';
    END LOOP;
END $$;

-- Create permissive policies for manual creation
CREATE POLICY "Enable all operations for authenticated users" ON public.profiles
    FOR ALL USING (true) WITH CHECK (true);

-- Step 3: Create a function for manual profile creation (optional)
CREATE OR REPLACE FUNCTION public.create_profile_for_user(
    user_id UUID,
    user_display_name TEXT,
    user_email TEXT
)
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.create_profile_for_user(UUID, TEXT, TEXT) TO authenticated;
