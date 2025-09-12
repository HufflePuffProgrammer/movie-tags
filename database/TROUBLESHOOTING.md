# Troubleshooting Signup 500 Error

## The Problem
Getting a 500 Internal Server Error when signing up means the Supabase server encountered an error, likely in the database trigger that creates the profile.

## Step-by-Step Fix

### Step 1: Run the Debug Script
1. Go to your Supabase dashboard → SQL Editor
2. Copy and paste the contents of `database/debug-and-fix.sql`
3. Run it section by section (each comment block)

### Step 2: Check the Results
After running the debug script, you should see:

**Profiles table structure:**
```
column_name    | data_type | is_nullable
id            | uuid      | NO
display_name  | text      | NO  
email         | text      | YES
avatar_url    | text      | YES
bio           | text      | YES
created_at    | timestamp | NO
updated_at    | timestamp | NO
```

**Trigger exists:**
```
trigger_name: on_auth_user_created
```

**RLS policies:**
Should show 3 policies for profiles table (read, insert, update)

### Step 3: Test Manually
Run this in SQL Editor to test profile creation:
```sql
INSERT INTO public.profiles (id, display_name, email) 
VALUES ('123e4567-e89b-12d3-a456-426614174000', 'Test User', 'test@example.com');
```

If this fails, you'll see the exact error.

### Step 4: Check Supabase Logs
1. Go to your Supabase dashboard → Logs
2. Look for recent errors around the time you tried to sign up
3. Look for messages containing "handle_new_user" or "profiles"

### Step 5: Try Signup Again
1. Try signing up with a new email
2. Check browser console for detailed error information
3. Check Supabase logs for server-side errors

## Common Issues & Fixes

### Issue 1: "duplicate key value violates unique constraint"
**Cause:** Email already exists in profiles table
**Fix:** Use a different email or delete the existing profile

### Issue 2: "null value in column display_name violates not-null constraint"
**Cause:** The trigger isn't receiving the display_name properly
**Fix:** Check that the signup form is sending the data correctly

### Issue 3: "permission denied for table profiles"
**Cause:** RLS policies are too restrictive
**Fix:** The debug script fixes the RLS policies

### Issue 4: "function public.handle_new_user() does not exist"
**Cause:** The trigger function wasn't created properly
**Fix:** The debug script recreates the function

## Verification Steps

After running the fixes, verify:

1. **Trigger function exists:**
   ```sql
   SELECT routine_name FROM information_schema.routines 
   WHERE routine_name = 'handle_new_user';
   ```

2. **Trigger is active:**
   ```sql
   SELECT trigger_name FROM information_schema.triggers 
   WHERE trigger_name = 'on_auth_user_created';
   ```

3. **RLS policies are correct:**
   ```sql
   SELECT policyname FROM pg_policies 
   WHERE tablename = 'profiles';
   ```

## Still Having Issues?

If you're still getting 500 errors:

1. **Check the exact error message** in browser dev tools → Network tab → click on the failed request → Response
2. **Check Supabase logs** for server-side error details
3. **Try a simpler approach** - disable the trigger temporarily and create profiles manually
4. **Contact support** with the specific error messages from logs

## Test Commands

```sql
-- Test profile creation
INSERT INTO profiles (id, display_name, email) 
VALUES (gen_random_uuid(), 'Test', 'test@test.com');

-- Test RLS
SELECT * FROM profiles; -- Should work

-- Clean up test
DELETE FROM profiles WHERE email = 'test@test.com';
```
