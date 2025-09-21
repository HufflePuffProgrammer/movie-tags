-- Sample Tags Data
-- Predefined tags for movie analysis and storytelling elements
-- Run this script in your Supabase SQL Editor after setting up the main schema

-- Insert predefined tags for movie analysis
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

-- Verify the tags were inserted
SELECT COUNT(*) as total_tags FROM public.tags;
SELECT name, color FROM public.tags ORDER BY name;
