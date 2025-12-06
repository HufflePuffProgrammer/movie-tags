export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_name: string
          full_name: string
          email: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          user_name: string
          full_name: string
          email?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_name?: string
          full_name?: string
          email?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      movies: {
        Row: {
          id: number
          title: string
          description: string | null
          release_date: string | null
          poster_url: string | null
          genre: string | null
          director: string | null
          runtime_minutes: number | null
          imdb_id: string | null
          tmdb_id: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          title: string
          description?: string | null
          release_date?: string | null
          poster_url?: string | null
          genre?: string | null
          director?: string | null
          runtime_minutes?: number | null
          imdb_id?: string | null
          tmdb_id?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          title?: string
          description?: string | null
          release_date?: string | null
          poster_url?: string | null
          genre?: string | null
          director?: string | null
          runtime_minutes?: number | null
          imdb_id?: string | null
          tmdb_id?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: number
          name: string
          description: string | null
          color: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          color?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          color?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_movie_categories: {
        Row: {
          id: number
          user_id: string
          movie_id: number
          category_id: number
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          movie_id: number
          category_id: number
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          movie_id?: number
          category_id?: number
          created_at?: string
        }
      }
      tags: {
        Row: {
          id: number
          name: string
          description: string | null
          color: string
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          color?: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          color?: string
          created_at?: string
        }
      }
      user_movie_tags: {
        Row: {
          id: number
          user_id: string
          movie_id: number
          tag_id: number
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          movie_id: number
          tag_id: number
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          movie_id?: number
          tag_id?: number
          created_at?: string
        }
      }
      user_notes: {
        Row: {
          id: number
          user_id: string
          movie_id: number
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          movie_id: number
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          movie_id?: number
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      movie_blog_posts: {
        Row: {
          id: number
          user_id: string
          movie_id: number
          slug: string
          title: string
          content: string | null
          meta_description: string | null
          is_public: boolean
          admin_approved: boolean
          view_count: number
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          movie_id: number
          slug: string
          title: string
          content?: string | null
          meta_description?: string | null
          is_public?: boolean
          admin_approved?: boolean
          view_count?: number
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          movie_id?: number
          slug?: string
          title?: string
          content?: string | null
          meta_description?: string | null
          is_public?: boolean
          admin_approved?: boolean
          view_count?: number
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      public_blog_posts_view: {
        Row: {
          id: number
          slug: string
          title: string
          content: string | null
          meta_description: string | null
          view_count: number
          published_at: string | null
          updated_at: string
          movie_id: number
          user_id: string
          movie_title: string
          release_date: string | null
          poster_url: string | null
          director: string | null
          runtime_minutes: number | null
          genre: string | null
          tmdb_id: number | null
          imdb_id: string | null
          overview: string | null
          user_name: string | null
          full_name: string | null
          avatar_url: string | null
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

