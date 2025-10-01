export interface Movie {
  id: number;
  title: string;
  description: string | null;
  overview: string | null; // TMDB overview field
  release_date: string | null;
  poster_url: string | null;
  genre: string | null;
  director: string | null;
  runtime_minutes: number | null;
  imdb_id: string | null;
  tmdb_id: number | null;
  created_at?: string;
  updated_at?: string;
}
