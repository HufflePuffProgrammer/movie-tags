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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

