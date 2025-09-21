-- Complete Sample Data for Movie Tags System
-- This script provides sample data for testing the tags and notes functionality
-- Run this AFTER setting up the schema and having users + movies in your database

-- =====================================================
-- PREDEFINED ADMIN TAGS (for the tags table)
-- =====================================================

-- Insert storytelling analysis tags
INSERT INTO public.tags (name, description, color) VALUES
  ('Premise', 'The basic concept or central idea of the movie', '#3B82F6'),
  ('Character', 'Character development, arcs, and personalities', '#10B981'),
  ('Dialogue', 'Quality and style of conversations and writing', '#8B5CF6'),
  ('Comedy', 'Humor, comedic timing, and funny elements', '#F59E0B'),
  ('Conflict', 'Central conflicts, tension, and dramatic elements', '#EF4444'),
  ('Midpoint', 'The crucial turning point in the story', '#EC4899'),
  ('Introduction', 'How characters and world are established', '#06B6D4'),
  ('Stakes', 'What characters stand to gain or lose', '#84CC16'),
  ('Goals', 'Character motivations and objectives', '#F97316'),
  ('Inciting Incident', 'The event that sets the story in motion', '#6366F1'),
  ('Escalation', 'How tension and conflict build throughout', '#DC2626'),
  ('Emotion', 'Emotional impact and character feelings', '#DB2777'),
  ('Pacing', 'Rhythm, timing, and flow of the narrative', '#059669'),
  ('Theme', 'Underlying messages and deeper meanings', '#7C3AED')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- SAMPLE USER TAGS (for user_tags table)
-- =====================================================

-- Template for user-created tags (uncomment and replace IDs when ready)
/*
-- Replace 'YOUR_USER_ID' with actual user UUID
-- Replace movie_id numbers with actual movie IDs

INSERT INTO public.user_tags (user_id, movie_id, tag_name, color) VALUES
    -- Movie 1 analysis
    ('YOUR_USER_ID', 1, 'Brilliant Opening', '#3B82F6'),
    ('YOUR_USER_ID', 1, 'Complex Protagonist', '#10B981'),
    ('YOUR_USER_ID', 1, 'Snappy Dialogue', '#8B5CF6'),
    ('YOUR_USER_ID', 1, 'High Stakes', '#84CC16'),
    ('YOUR_USER_ID', 1, 'Emotional Depth', '#DB2777'),
    
    -- Movie 2 analysis  
    ('YOUR_USER_ID', 2, 'Weak Setup', '#EF4444'),
    ('YOUR_USER_ID', 2, 'Flat Characters', '#DC2626'),
    ('YOUR_USER_ID', 2, 'Slow Pacing', '#991B1B'),
    
    -- Movie 3 analysis
    ('YOUR_USER_ID', 3, 'Great Comedy', '#F59E0B'),
    ('YOUR_USER_ID', 3, 'Perfect Timing', '#059669'),
    ('YOUR_USER_ID', 3, 'Strong Theme', '#7C3AED');
*/

-- =====================================================
-- SAMPLE USER NOTES (for user_notes table)
-- =====================================================

-- Template for user notes (uncomment and replace IDs when ready)
/*
INSERT INTO public.user_notes (user_id, movie_id, content) VALUES
    -- Movie 1 notes
    ('YOUR_USER_ID', 1, 'This film has one of the best opening sequences I''ve ever seen. The way it establishes the world and introduces the main character is masterful.'),
    ('YOUR_USER_ID', 1, 'The dialogue feels natural and serves multiple purposes - advancing plot, revealing character, and providing subtext.'),
    ('YOUR_USER_ID', 1, 'The midpoint twist completely changes the audience''s understanding of the protagonist''s motivations.'),
    
    -- Movie 2 notes
    ('YOUR_USER_ID', 2, 'The premise had potential but the execution falls flat. The characters never feel like real people.'),
    ('YOUR_USER_ID', 2, 'Pacing issues in the second act make it drag significantly.'),
    
    -- Movie 3 notes
    ('YOUR_USER_ID', 3, 'Excellent use of comedy to explore deeper themes about family and belonging.'),
    ('YOUR_USER_ID', 3, 'The character arcs are satisfying and feel earned by the end.');
*/

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check that tags were inserted
SELECT 'Admin Tags Count:' as info, COUNT(*) as count FROM public.tags;

-- View all admin tags
SELECT 'Admin Tags:' as info, name, color FROM public.tags ORDER BY name;

-- Template queries for checking user data (uncomment when you have real data)
/*
-- Check user tags
SELECT 'User Tags Count:' as info, COUNT(*) as count FROM public.user_tags;

-- Check user notes  
SELECT 'User Notes Count:' as info, COUNT(*) as count FROM public.user_notes;

-- View user tags for a specific user/movie
SELECT ut.tag_name, ut.color, ut.created_at 
FROM public.user_tags ut 
WHERE ut.user_id = 'YOUR_USER_ID' AND ut.movie_id = 1;

-- View user notes for a specific user/movie
SELECT un.content, un.created_at 
FROM public.user_notes un 
WHERE un.user_id = 'YOUR_USER_ID' AND un.movie_id = 1 
ORDER BY un.created_at DESC;
*/

RAISE NOTICE 'Sample data script completed. Admin tags inserted. Update user data templates with real IDs.';
