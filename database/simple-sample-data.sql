-- CineFind Simple Sample Data
-- Run this after the simple-schema.sql to populate with sample data

-- =====================================================
-- SAMPLE MOVIES
-- =====================================================

INSERT INTO public.movies (title, description, release_date, genre, director, runtime_minutes, imdb_id, tmdb_id) VALUES
-- Recent Popular Films
('Everything Everywhere All at Once', 'A mind-bending multiverse adventure about a laundromat owner who must connect with parallel universe versions of herself to prevent a powerful being from destroying the multiverse.', '2022-03-25', 'Sci-Fi', 'Daniels', 139, 'tt6710474', 545611),

('Top Gun: Maverick', 'After thirty years, Maverick is still pushing the envelope as a top naval aviator, but must confront ghosts of his past when he leads TOP GUN''s elite graduates on a mission that demands the ultimate sacrifice.', '2022-05-27', 'Action', 'Joseph Kosinski', 131, 'tt1745960', 361743),

('The Batman', 'When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate the city''s hidden corruption and question his family''s involvement.', '2022-03-04', 'Action', 'Matt Reeves', 176, 'tt1877830', 414906),

('Dune', 'Paul Atreides, a brilliant and gifted young man born into a great destiny beyond his understanding, must travel to the most dangerous planet in the universe to ensure the future of his family and his people.', '2021-10-22', 'Sci-Fi', 'Denis Villeneuve', 155, 'tt1160419', 438631),

('Spider-Man: No Way Home', 'With Spider-Man''s identity now revealed, Peter asks Doctor Strange for help. When a spell goes wrong, dangerous foes from other worlds start to appear, forcing Peter to discover what it truly means to be Spider-Man.', '2021-12-17', 'Action', 'Jon Watts', 148, 'tt10872600', 634649),

-- Classic Films
('The Godfather', 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.', '1972-03-24', 'Drama', 'Francis Ford Coppola', 175, 'tt0068646', 238),

('Pulp Fiction', 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.', '1994-10-14', 'Drama', 'Quentin Tarantino', 154, 'tt0110912', 680),

('The Shawshank Redemption', 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.', '1994-09-23', 'Drama', 'Frank Darabont', 142, 'tt0111161', 278),

('Inception', 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.', '2010-07-16', 'Sci-Fi', 'Christopher Nolan', 148, 'tt1375666', 27205),

('The Dark Knight', 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.', '2008-07-18', 'Action', 'Christopher Nolan', 152, 'tt0468569', 155),

-- Comedy Films
('Groundhog Day', 'A narcissistic, self-centered weatherman finds himself in a time loop on Groundhog Day.', '1993-02-12', 'Comedy', 'Harold Ramis', 101, 'tt0107048', 137),

('The Grand Budapest Hotel', 'A writer encounters the owner of an aging high-class hotel, who tells him of his early years serving as a lobby boy in the hotel''s glorious years under an exceptional concierge.', '2014-03-28', 'Comedy', 'Wes Anderson', 99, 'tt2278388', 120467),

-- Horror Films
('Get Out', 'A young African-American visits his white girlfriend''s parents for the weekend, where his simmering uneasiness about their reception of him eventually reaches a boiling point.', '2017-02-24', 'Horror', 'Jordan Peele', 104, 'tt5052448', 419430),

('Hereditary', 'A grieving family is haunted by tragedy and disturbing secrets.', '2018-06-08', 'Horror', 'Ari Aster', 127, 'tt7784604', 493922),

-- Animated Films
('Spirited Away', 'During her family''s move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, and where humans are changed into beasts.', '2001-07-20', 'Animation', 'Hayao Miyazaki', 125, 'tt0245429', 129),

('Toy Story', 'A cowboy doll is profoundly threatened and jealous when a new spaceman figure supplants him as top toy in a boy''s room.', '1995-11-22', 'Animation', 'John Lasseter', 81, 'tt0114709', 862);
