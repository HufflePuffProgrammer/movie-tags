-- Sample user tagging data for testing the filtering system
-- This creates sample user movie categories and tags so filtering works

-- First, let's check if we have any movies in the database
-- If not, we'll need to add some sample movies first

-- Insert some sample movies (only if they don't exist)
INSERT INTO public.movies (title, description, director, release_date, poster_url, rating) VALUES
('The Matrix', 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.', 'The Wachowskis', '1999-03-31', 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg', 'R'),
('Inception', 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.', 'Christopher Nolan', '2010-07-16', 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg', 'PG-13'),
('Pulp Fiction', 'The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.', 'Quentin Tarantino', '1994-10-14', 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg', 'R'),
('The Godfather', 'An organized crime dynastys aging patriarch transfers control of his clandestine empire to his reluctant son.', 'Francis Ford Coppola', '1972-03-24', 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg', 'R'),
('Forrest Gump', 'The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold from the perspective of an Alabama man with an IQ of 75.', 'Robert Zemeckis', '1994-07-06', 'https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg', 'PG-13')
ON CONFLICT (title) DO NOTHING;

-- Create some test users (using UUIDs that would exist in auth.users)
-- Note: In a real scenario, these would be actual authenticated users
-- For testing, we'll use placeholder UUIDs

-- Sample user movie categories (Blake Snyder categories)
-- Let's assume we have category IDs 1-10 for different Blake Snyder categories
INSERT INTO public.user_movie_categories (user_id, movie_id, category_id) VALUES
-- User 1 tagging movies
('11111111-1111-1111-1111-111111111111', 1, 1), -- The Matrix - Monster in the House
('11111111-1111-1111-1111-111111111111', 1, 3), -- The Matrix - Dude with a Problem
('11111111-1111-1111-1111-111111111111', 2, 2), -- Inception - Golden Fleece
('11111111-1111-1111-1111-111111111111', 3, 4), -- Pulp Fiction - Out of the Bottle
('11111111-1111-1111-1111-111111111111', 4, 5), -- The Godfather - Institutionalized

-- User 2 tagging movies
('22222222-2222-2222-2222-222222222222', 1, 2), -- The Matrix - Golden Fleece
('22222222-2222-2222-2222-222222222222', 2, 3), -- Inception - Dude with a Problem
('22222222-2222-2222-2222-222222222222', 3, 1), -- Pulp Fiction - Monster in the House
('22222222-2222-2222-2222-222222222222', 5, 6), -- Forrest Gump - Buddy Love

-- User 3 tagging movies
('33333333-3333-3333-3333-333333333333', 1, 4), -- The Matrix - Out of the Bottle
('33333333-3333-3333-3333-333333333333', 2, 1), -- Inception - Monster in the House
('33333333-3333-3333-3333-333333333333', 4, 2), -- The Godfather - Golden Fleece
('33333333-3333-3333-3333-333333333333', 5, 3)  -- Forrest Gump - Dude with a Problem
ON CONFLICT (user_id, movie_id, category_id) DO NOTHING;

-- Sample user movie tags (storytelling analysis tags)
-- Let's use the tag IDs from our tags table (1-14 for the storytelling tags)
INSERT INTO public.user_movie_tags (user_id, movie_id, tag_id) VALUES
-- User 1 tagging movies with storytelling elements
('11111111-1111-1111-1111-111111111111', 1, 1),  -- The Matrix - Premise
('11111111-1111-1111-1111-111111111111', 1, 2),  -- The Matrix - Character
('11111111-1111-1111-1111-111111111111', 1, 5),  -- The Matrix - Conflict
('11111111-1111-1111-1111-111111111111', 2, 1),  -- Inception - Premise
('11111111-1111-1111-1111-111111111111', 2, 6),  -- Inception - Midpoint
('11111111-1111-1111-1111-111111111111', 2, 13), -- Inception - Pacing
('11111111-1111-1111-1111-111111111111', 3, 3),  -- Pulp Fiction - Dialogue
('11111111-1111-1111-1111-111111111111', 3, 13), -- Pulp Fiction - Pacing
('11111111-1111-1111-1111-111111111111', 4, 2),  -- The Godfather - Character
('11111111-1111-1111-1111-111111111111', 4, 14), -- The Godfather - Theme

-- User 2 tagging movies
('22222222-2222-2222-2222-222222222222', 1, 12), -- The Matrix - Emotion
('22222222-2222-2222-2222-222222222222', 1, 8),  -- The Matrix - Stakes
('22222222-2222-2222-2222-222222222222', 2, 2),  -- Inception - Character
('22222222-2222-2222-2222-222222222222', 2, 11), -- Inception - Escalation
('22222222-2222-2222-2222-222222222222', 3, 4),  -- Pulp Fiction - Comedy
('22222222-2222-2222-2222-222222222222', 3, 14), -- Pulp Fiction - Theme
('22222222-2222-2222-2222-222222222222', 5, 2),  -- Forrest Gump - Character
('22222222-2222-2222-2222-222222222222', 5, 12), -- Forrest Gump - Emotion

-- User 3 tagging movies
('33333333-3333-3333-3333-333333333333', 1, 7),  -- The Matrix - Introduction
('33333333-3333-3333-3333-333333333333', 1, 10), -- The Matrix - Inciting Incident
('33333333-3333-3333-3333-333333333333', 2, 8),  -- Inception - Stakes
('33333333-3333-3333-3333-333333333333', 2, 9),  -- Inception - Goals
('33333333-3333-3333-3333-333333333333', 4, 8),  -- The Godfather - Stakes
('33333333-3333-3333-3333-333333333333', 4, 5),  -- The Godfather - Conflict
('33333333-3333-3333-3333-333333333333', 5, 7),  -- Forrest Gump - Introduction
('33333333-3333-3333-3333-333333333333', 5, 14)  -- Forrest Gump - Theme
ON CONFLICT (user_id, movie_id, tag_id) DO NOTHING;

-- Verify the data was inserted
SELECT 'Categories' as type, COUNT(*) as count FROM public.user_movie_categories
UNION ALL
SELECT 'Tags' as type, COUNT(*) as count FROM public.user_movie_tags
UNION ALL
SELECT 'Movies' as type, COUNT(*) as count FROM public.movies;
