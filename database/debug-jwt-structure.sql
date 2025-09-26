-- Debug JWT token structure to find the correct email field
-- =====================================================

-- Check the full JWT structure
SELECT 
  auth.uid() as user_id,
  auth.jwt() as full_jwt_token;

-- Try different possible email fields
SELECT 
  auth.jwt() ->> 'email' as jwt_email,
  auth.jwt() ->> 'user_email' as jwt_user_email,
  (auth.jwt() ->> 'user_metadata')::jsonb ->> 'email' as metadata_email,
  (auth.jwt() ->> 'app_metadata')::jsonb ->> 'email' as app_metadata_email,
  (auth.jwt() ->> 'raw_user_meta_data')::jsonb ->> 'email' as raw_metadata_email;

-- Check if there's a users table we can join with
SELECT 
  u.email as users_table_email,
  u.id as users_table_id
FROM auth.users u 
WHERE u.id = auth.uid();

-- Alternative: Check if we can use user ID instead of email for admin check
SELECT auth.uid() as current_user_id;
