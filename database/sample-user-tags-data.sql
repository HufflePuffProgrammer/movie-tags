-- Sample User Tags Data
-- This creates sample user-created tags based on your storytelling elements
-- Run this script AFTER you have users and movies in your database

-- Note: Replace 'YOUR_USER_ID' with an actual user ID from auth.users
-- Note: Replace movie_id values with actual movie IDs from your movies table

-- Sample user-created tags for storytelling analysis
-- These would be created by users as they analyze movies

DO $$
DECLARE
    sample_user_id UUID;
    sample_movie_id BIGINT;
BEGIN
    -- Get a sample user (replace with actual logic to get a real user)
    -- SELECT id INTO sample_user_id FROM auth.users LIMIT 1;
    
    -- Get a sample movie (replace with actual logic to get a real movie)
    -- SELECT id INTO sample_movie_id FROM public.movies LIMIT 1;
    
    -- For now, we'll just show the structure - uncomment and modify when you have real data
    
    /*
    -- Insert sample user tags
    INSERT INTO public.user_tags (user_id, movie_id, tag_name, color) VALUES
        (sample_user_id, sample_movie_id, 'Strong Premise', '#3B82F6'),
        (sample_user_id, sample_movie_id, 'Great Character Development', '#10B981'),
        (sample_user_id, sample_movie_id, 'Witty Dialogue', '#8B5CF6'),
        (sample_user_id, sample_movie_id, 'Perfect Pacing', '#059669'),
        (sample_user_id, sample_movie_id, 'Clear Theme', '#7C3AED');
    */
    
    RAISE NOTICE 'Sample user tags structure ready. Update with real user and movie IDs.';
END $$;

-- Alternative: Manual insert template (replace the IDs with real ones)
/*
INSERT INTO public.user_tags (user_id, movie_id, tag_name, color) VALUES
    ('YOUR_USER_ID_HERE', 1, 'Compelling Premise', '#3B82F6'),
    ('YOUR_USER_ID_HERE', 1, 'Strong Characters', '#10B981'),
    ('YOUR_USER_ID_HERE', 1, 'Sharp Dialogue', '#8B5CF6'),
    ('YOUR_USER_ID_HERE', 1, 'Good Pacing', '#059669'),
    ('YOUR_USER_ID_HERE', 1, 'Clear Theme', '#7C3AED'),
    ('YOUR_USER_ID_HERE', 2, 'Weak Premise', '#EF4444'),
    ('YOUR_USER_ID_HERE', 2, 'Flat Characters', '#DC2626'),
    ('YOUR_USER_ID_HERE', 2, 'Poor Dialogue', '#991B1B');
*/
