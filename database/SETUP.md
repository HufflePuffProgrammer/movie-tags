# Quick Database Setup Guide

## Step 1: Set up your environment variables

Create a `.env.local` file in your project root with:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace with your actual Supabase project values from Settings > API.

## Step 2: Run the database schema

1. Go to your Supabase dashboard
2. Click on "SQL Editor" in the sidebar
3. Click "New Query"
4. Copy and paste the entire contents of `database/complete-schema.sql` (recommended) or `database/simple-schema.sql` (basic setup)
5. Click "Run" to execute

This will create:
- `profiles` table (user profiles)
- `movies` table (movie catalog)
- `categories` table (admin-curated categories)
- `tags` table (admin-curated tags)
- `user_movie_categories` table (user's movie categorizations)
- `user_movie_tags` table (user's movie tags)
- `user_notes` table (user's movie notes)
- Automatic profile creation trigger
- Row Level Security policies for all tables

## Step 3: Add sample data (optional)

1. Create another "New Query" in SQL Editor
2. Copy and paste the contents of `database/sample-data.sql` (includes categories, tags, and movies)
3. Click "Run" to add sample movies

## Step 4: Test the setup

Run this query in SQL Editor to verify:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name IN ('profiles', 'movies');

-- Check if trigger exists
SELECT trigger_name FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

You should see both tables and the trigger listed.

## Troubleshooting

If you get "Database error saving new user":

1. **Check if schema is set up**: Run the verification query above
2. **Check RLS policies**: Make sure the profiles table has the right policies
3. **Check user metadata**: The signup form should pass `user_name` and `full_name`

## Testing Authentication

1. Try signing up with a new email
2. Check the `auth.users` table for the new user
3. Check the `profiles` table for the auto-created profile
