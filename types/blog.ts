export interface BlogPost {
  id: number;
  user_id: string;
  movie_id: number;
  slug: string;
  title: string;
  content: string | null;
  meta_description: string | null;
  is_public: boolean;
  admin_approved: boolean;
  view_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PublicBlogPost {
  id: number;
  slug: string;
  title: string;
  content: string | null;
  meta_description: string | null;
  view_count: number;
  published_at: string | null;
  updated_at: string;
  movie_id: number;
  user_id: string;
  movie_title: string;
  release_date: string | null;
  poster_url: string | null;
  director: string | null;
  runtime_minutes: number | null;
  genre: string | null;
  tmdb_id: number | null;
  imdb_id: string | null;
  overview: string | null;
  user_name: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

export interface BlogPostWithDetails extends BlogPost {
  movie: {
    title: string;
    release_date: string | null;
    poster_url: string | null;
    director: string | null;
    runtime_minutes: number | null;
    genre: string | null;
    tmdb_id: number | null;
    imdb_id: string | null;
    overview: string | null;
  };
  user: {
    user_name: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
  tags: Array<{
    id: number;
    name: string;
    color: string;
  }>;
  categories: Array<{
    id: number;
    name: string;
    color: string;
  }>;
  user_note: string | null;
}

