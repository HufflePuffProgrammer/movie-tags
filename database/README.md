# Database Setup Guide

This guide will help you set up the complete database schema for your CineFind application in Supabase.

## 📋 Prerequisites

1. A Supabase project created at [supabase.com](https://supabase.com)
2. Access to your Supabase SQL Editor
3. Your project's environment variables configured in `.env.local`

## 🚀 Setup Steps

### Step 1: Run the Main Schema

1. Open your Supabase project dashboard
2. Go to the **SQL Editor** (in the left sidebar)
3. Click **"New Query"**
4. Copy the entire contents of `schema.sql` and paste it into the editor
5. Click **"Run"** to execute the script

This will create:
- ✅ All core tables (movies, tags, categories, profiles)
- ✅ User personalization tables (user_movie_tags, user_movie_categories, user_movie_notes)
- ✅ Database indexes for performance
- ✅ Row Level Security (RLS) policies
- ✅ Helpful functions and triggers
- ✅ Automatic profile creation on user signup

### Step 2: Add Sample Data (Optional)

1. Create another **"New Query"** in the SQL Editor
2. Copy the contents of `sample-data.sql` and paste it
3. Click **"Run"** to populate with sample movies, tags, and categories

This will add:
- 🎬 20 sample movies (mix of recent hits and classics)
- 🏷️ 19 useful tags (mood, quality, context, personal)
- 📂 10 movie categories (Action, Comedy, Drama, etc.)

### Step 3: Verify the Setup

Run this query to check your tables:

```sql
-- Check table counts
SELECT 
  'movies' as table_name, COUNT(*) as count FROM public.movies
UNION ALL
SELECT 'tags' as table_name, COUNT(*) as count FROM public.tags
UNION ALL
SELECT 'categories' as table_name, COUNT(*) as count FROM public.categories;
```

You should see:
- movies: 20 rows
- tags: 19 rows  
- categories: 10 rows

## 🔐 Security Features

### Row Level Security (RLS)
All user data is protected by RLS policies:

- **user_movie_tags**: Users can only see/modify their own tags
- **user_movie_categories**: Users can only see/modify their own categories  
- **user_movie_notes**: Users can only see/modify their own notes
- **profiles**: Users can only see/modify their own profile

### Public Data
These tables are readable by everyone (but only admins can modify):
- **movies**: Public movie catalog
- **tags**: Available tags for users to choose from
- **categories**: Available categories for users to choose from

## 🔄 Automatic Features

### Profile Creation
When a user signs up, a profile is automatically created in the `profiles` table using the trigger `on_auth_user_created`. The profile includes:
- **display_name**: Required field (defaults to 'User' if not provided)
- **email**: Cached from auth.users for quick lookups
- **avatar_url**: Optional profile picture URL
- **bio**: Optional biography (max 500 characters)

### Timestamp Updates  
The `updated_at` fields are automatically maintained by database triggers.

### Full-Text Search
Movies have full-text search capability through the `search_movies()` function.

## 🛠️ Useful Queries

### Search Movies
```sql
SELECT * FROM search_movies('batman');
```

### Get User's Movie Data
```sql
SELECT * FROM get_user_movie_data('user-uuid-here', 1);
```

### Check RLS Policies
```sql
SELECT schemaname, tablename, policyname, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

## 📊 Database Schema Overview

```
Core Tables:
├── movies (public catalog)
├── tags (admin-curated)  
├── categories (admin-curated)
└── profiles (user extensions)

User Data Tables:
├── user_movie_tags (many-to-many)
├── user_movie_categories (one-to-many)
└── user_movie_notes (one-to-one)
```

## 🔧 Troubleshooting

### Common Issues

**Error: "relation does not exist"**
- Make sure you ran `schema.sql` first before `sample-data.sql`

**Error: "permission denied"**  
- Check that RLS policies are correctly applied
- Verify you're using the correct user UUID

**No data showing for authenticated users**
- Check that `auth.uid()` returns the expected UUID
- Verify the user has actually created tags/categories/notes

### Checking User Authentication
```sql
SELECT auth.uid(); -- Should return your user UUID when authenticated
```

### Manual Profile Creation
If automatic profile creation isn't working:
```sql
INSERT INTO public.profiles (id, display_name) 
VALUES (auth.uid(), 'Your Display Name');
```

## 🎯 Next Steps

After setting up the database:

1. ✅ Test user registration and automatic profile creation
2. ✅ Try adding some personal tags to movies  
3. ✅ Test the search functionality
4. ✅ Verify RLS is working by trying to access other users' data
5. ✅ Start building your API endpoints to interact with this data

## 📝 Schema Modifications

If you need to modify the schema later:

1. Always backup your data first
2. Test changes on a development database
3. Use migrations for production changes
4. Update the TypeScript types in `types/database.ts`

The schema is designed to be flexible and scalable for your movie tagging application!
