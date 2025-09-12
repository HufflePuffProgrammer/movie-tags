-- Check current auth settings and email validation
-- This will show you what email validation rules are active

-- Check if there are any email domain restrictions
SELECT 
    'Auth Settings Check' as info,
    'Check your Supabase dashboard -> Authentication -> Settings for email validation rules' as message;

-- You can also check recent auth attempts
-- (This might not work depending on your Supabase plan)
-- SELECT * FROM auth.audit_log_entries 
-- WHERE created_at > NOW() - INTERVAL '1 hour'
-- ORDER BY created_at DESC 
-- LIMIT 10;
