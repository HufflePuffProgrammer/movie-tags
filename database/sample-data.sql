-- CineFind Sample Data
-- Run this after the main schema.sql to populate with sample data

-- =====================================================
-- SAMPLE CATEGORIES
-- =====================================================

INSERT INTO public.categories (name, description, color) VALUES
('Action', 'High-energy films with intense sequences', '#EF4444'),
('Comedy', 'Films designed to make you laugh', '#F59E0B'),
('Drama', 'Character-driven stories with emotional depth', '#8B5CF6'),
('Horror', 'Films designed to frighten and create suspense', '#1F2937'),
('Sci-Fi', 'Science fiction and futuristic themes', '#06B6D4'),
('Romance', 'Love stories and romantic relationships', '#EC4899'),
('Thriller', 'Suspenseful films that keep you on edge', '#DC2626'),
('Documentary', 'Non-fiction films about real subjects', '#059669'),
('Animation', 'Animated films for all ages', '#F97316'),
('Mystery', 'Films involving puzzles and unknown elements', '#7C3AED');

-- =====================================================
-- SAMPLE TAGS
-- =====================================================

INSERT INTO public.tags (name, description, color) VALUES
-- Mood/Experience Tags
('Feel Good', 'Uplifting movies that leave you happy', '#10B981'),
('Mind Bending', 'Complex plots that make you think', '#8B5CF6'),
('Emotional', 'Films that will make you cry', '#EF4444'),
('Funny', 'Genuinely hilarious movies', '#F59E0B'),
('Scary', 'Actually frightening horror films', '#1F2937'),
('Inspiring', 'Motivational and uplifting stories', '#059669'),

-- Quality Tags
('Masterpiece', 'Exceptional films that are must-watch', '#F59E0B'),
('Hidden Gem', 'Lesser-known but excellent films', '#8B5CF6'),
('Overrated', 'Popular films that don\'t live up to hype', '#6B7280'),
('Underrated', 'Great films that deserve more recognition', '#059669'),

-- Viewing Context Tags
('Date Night', 'Perfect for romantic evenings', '#EC4899'),
('Family Friendly', 'Safe to watch with kids', '#10B981'),
('Popcorn Flick', 'Fun, entertaining, not too serious', '#F97316'),
('Art House', 'Sophisticated, artistic cinema', '#7C3AED'),
('Binge Worthy', 'So good you\'ll watch it multiple times', '#EF4444'),

-- Personal Tags
('Favorites', 'Your all-time favorite films', '#F59E0B'),
('Watch Later', 'Movies you want to see', '#06B6D4'),
('Rewatchable', 'Films you can watch over and over', '#10B981'),
('Nostalgic', 'Movies that bring back memories', '#EC4899'),
('Guilty Pleasure', 'Films you love despite their flaws', '#F97316');

-- =====================================================
-- SAMPLE MOVIES
-- =====================================================

INSERT INTO public.movies (title, description, release_date, genre, director, runtime_minutes) VALUES
-- Recent Popular Films
('Everything Everywhere All at Once', 'A mind-bending multiverse adventure about a laundromat owner who must connect with parallel universe versions of herself to prevent a powerful being from destroying the multiverse.', '2022-03-25', 'Sci-Fi', 'Daniels', 139),

('Top Gun: Maverick', 'After thirty years, Maverick is still pushing the envelope as a top naval aviator, but must confront ghosts of his past when he leads TOP GUN''s elite graduates on a mission that demands the ultimate sacrifice.', '2022-05-27', 'Action', 'Joseph Kosinski', 131),

('The Batman', 'When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate the city''s hidden corruption and question his family''s involvement.', '2022-03-04', 'Action', 'Matt Reeves', 176),

('Dune', 'Paul Atreides, a brilliant and gifted young man born into a great destiny beyond his understanding, must travel to the most dangerous planet in the universe to ensure the future of his family and his people.', '2021-10-22', 'Sci-Fi', 'Denis Villeneuve', 155),

('Spider-Man: No Way Home', 'With Spider-Man''s identity now revealed, Peter asks Doctor Strange for help. When a spell goes wrong, dangerous foes from other worlds start to appear, forcing Peter to discover what it truly means to be Spider-Man.', '2021-12-17', 'Action', 'Jon Watts', 148),

-- Classic Films
('The Godfather', 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.', '1972-03-24', 'Drama', 'Francis Ford Coppola', 175),

('Pulp Fiction', 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.', '1994-10-14', 'Drama', 'Quentin Tarantino', 154),

('The Shawshank Redemption', 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.', '1994-09-23', 'Drama', 'Frank Darabont', 142),

('Inception', 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.', '2010-07-16', 'Sci-Fi', 'Christopher Nolan', 148),

('The Dark Knight', 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.', '2008-07-18', 'Action', 'Christopher Nolan', 152),

-- Comedy Classics
('Groundhog Day', 'A narcissistic, self-centered weatherman finds himself in a time loop on Groundhog Day.', '1993-02-12', 'Comedy', 'Harold Ramis', 101),

('The Grand Budapest Hotel', 'A writer encounters the owner of an aging high-class hotel, who tells him of his early years serving as a lobby boy in the hotel''s glorious years under an exceptional concierge.', '2014-03-28', 'Comedy', 'Wes Anderson', 99),

('Parasite', 'A poor family schemes to become employed by a wealthy family and infiltrate their household by posing as unrelated, highly qualified individuals.', '2019-05-30', 'Thriller', 'Bong Joon-ho', 132),

-- Horror Films
('Get Out', 'A young African-American visits his white girlfriend''s parents for the weekend, where his simmering uneasiness about their reception of him eventually reaches a boiling point.', '2017-02-24', 'Horror', 'Jordan Peele', 104),

('Hereditary', 'A grieving family is haunted by tragedy and disturbing secrets.', '2018-06-08', 'Horror', 'Ari Aster', 127),

-- Animated Films
('Spirited Away', 'During her family''s move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, and where humans are changed into beasts.', '2001-07-20', 'Animation', 'Hayao Miyazaki', 125),

('Toy Story', 'A cowboy doll is profoundly threatened and jealous when a new spaceman figure supplants him as top toy in a boy''s room.', '1995-11-22', 'Animation', 'John Lasseter', 81),

-- Recent Indies
('Minari', 'A Korean-American family moves to an Arkansas farm in search of their own American Dream.', '2020-12-11', 'Drama', 'Lee Isaac Chung', 115),

('Nomadland', 'A woman in her sixties, after losing everything in the Great Recession, embarks on a journey through the American West, living in a van and working seasonal jobs.', '2020-09-11', 'Drama', 'Chloé Zhao', 107),

('Sound of Metal', 'Metal drummer Ruben begins to lose his hearing. When a doctor tells him his condition will worsen, he thinks his career and life is over.', '2019-09-06', 'Drama', 'Darius Marder', 120);

-- =====================================================
-- ADMIN USER SETUP (Optional)
-- =====================================================

-- Note: You'll need to replace the UUID below with an actual user ID from your auth.users table
-- This is just an example of how you might set up an admin user

-- Example: INSERT INTO public.profiles (id, display_name) VALUES ('your-admin-user-uuid-here', 'Admin User');

-- =====================================================
-- SAMPLE USER INTERACTIONS (for testing)
-- =====================================================

-- Note: These are examples of how user data would look
-- You'll need actual user UUIDs from your auth.users table to use these

/*
-- Example user movie tags (replace user_id with actual UUID)
INSERT INTO public.user_movie_tags (user_id, movie_id, tag_id) VALUES
('user-uuid-here', 1, 1), -- Everything Everywhere All at Once -> Feel Good
('user-uuid-here', 1, 2), -- Everything Everywhere All at Once -> Mind Bending
('user-uuid-here', 3, 6), -- The Batman -> Inspiring
('user-uuid-here', 5, 15); -- Spider-Man -> Favorites

-- Example user movie categories (replace user_id with actual UUID)
INSERT INTO public.user_movie_categories (user_id, movie_id, category_id) VALUES
('user-uuid-here', 1, 5), -- Everything Everywhere All at Once -> Sci-Fi
('user-uuid-here', 2, 1), -- Top Gun: Maverick -> Action
('user-uuid-here', 3, 1); -- The Batman -> Action

-- Example user movie notes (replace user_id with actual UUID)
INSERT INTO public.user_movie_notes (user_id, movie_id, note) VALUES
('user-uuid-here', 1, 'Absolutely incredible film! The creativity and emotional depth blew me away. Michelle Yeoh is phenomenal.'),
('user-uuid-here', 6, 'The ultimate crime saga. Marlon Brando''s performance is legendary. A true masterpiece of cinema.'),
('user-uuid-here', 13, 'Bong Joon-ho created something truly special. The social commentary is brilliant and the thriller elements are perfect.');
*/
