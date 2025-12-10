# Database Setup Guide

This guide will help you set up the complete database schema for your CineFind application in Supabase.

## 📋 Prerequisites

1. A Supabase project created at [supabase.com](https://supabase.com)
2. Access to your Supabase SQL Editor
3. Your project's environment variables configured in `.env.local`

## 🚀 Quick Setup (Recommended)

### Run the Complete Schema

1. Open your Supabase project dashboard
2. Go to the **SQL Editor** (in the left sidebar)
3. Click **"New Query"**
4. Copy the entire contents of **`COMPLETE_SCHEMA.sql`** and paste it into the editor
5. Click **"Run"** to execute the script

This single file creates everything you need:

- ✅ All core tables (movies, profiles, tags, categories)
- ✅ User personalization tables (user_movie_tags, user_movie_categories, user_notes, user_tags)
- ✅ Blog posts table (movie_blog_posts) with SEO features
- ✅ Database indexes for performance
- ✅ Row Level Security (RLS) policies
- ✅ Functions and triggers
- ✅ Public blog posts view
- ✅ Sample categories and tags

## 📊 Database Schema Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CORE TABLES                              │
├─────────────────────────────────────────────────────────────────┤
│  profiles          │ User profiles (extends auth.users)        │
│  movies            │ Movie/TV show catalog from TMDB           │
│  categories        │ Admin-curated categories                  │
│  tags              │ Admin-curated tags for SEO                │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    USER DATA TABLES                             │
├─────────────────────────────────────────────────────────────────┤
│  user_movie_categories │ User → Category → Movie assignments   │
│  user_movie_tags       │ User → Tag → Movie assignments        │
│  user_notes            │ User notes/reviews for movies         │
│  user_tags             │ Custom user-created tags              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      BLOG POSTS                                 │
├─────────────────────────────────────────────────────────────────┤
│  movie_blog_posts      │ SEO-friendly blog posts               │
│  public_blog_posts_view│ View for public posts with movie data │
└─────────────────────────────────────────────────────────────────┘
```

## 📁 Schema Files

| File | Description |
|------|-------------|
| **`COMPLETE_SCHEMA.sql`** | ⭐ **Run this** - Complete schema with all tables |
| `complete-schema.sql` | Legacy - Core tables only |
| `blog-posts-schema.sql` | Blog posts table (included in COMPLETE) |
| `user-tags-notes-schema.sql` | User tags/notes (included in COMPLETE) |

## 🔐 Security Features

### Row Level Security (RLS)

All user data is protected by RLS policies:

| Table | Policy |
|-------|--------|
| `profiles` | Users can only modify their own profile |
| `user_movie_tags` | Users can only see/modify their own tags |
| `user_movie_categories` | Users can only see/modify their own categories |
| `user_notes` | Users can only see/modify their own notes |
| `user_tags` | Users can only see/modify their own custom tags |
| `movie_blog_posts` | Users own their posts; public posts visible to all |

### Public Data

| Table | Policy |
|-------|--------|
| `movies` | Readable by everyone, writable by authenticated users |
| `tags` | Readable by everyone, modifiable by admins only |
| `categories` | Readable by everyone, modifiable by admins only |

### Admin Access

Admins are determined by email pattern:
- Email contains "admin"
- Email is `testuser02@email.com`

## 🔄 Automatic Features

### Profile Creation
When a user signs up, a profile is automatically created via the `on_auth_user_created` trigger.

### Timestamp Updates
`updated_at` fields are automatically maintained by database triggers.

### Blog Post Published Date
When `is_public` changes from `false` to `true`, `published_at` is automatically set.

### Full-Text Search
Movies have a full-text search index on title, overview, and description.

## 📝 Key Tables Detail

### movies
```sql
id, title, description, release_date, poster_url, genre,
director, runtime_minutes, imdb_id, tmdb_id, overview,
created_at, updated_at
```

### movie_blog_posts
```sql
id, user_id, movie_id, slug, title, content, meta_description,
is_public, admin_approved, view_count, published_at,
created_at, updated_at
```

### tags
```sql
id, name, description, color, created_at, updated_at
```

### categories
```sql
id, name, description, color, created_at, updated_at
```

## 🛠️ Useful Queries

### Check Table Counts
```sql
SELECT 'movies' as table_name, COUNT(*) FROM public.movies
UNION ALL SELECT 'tags', COUNT(*) FROM public.tags
UNION ALL SELECT 'categories', COUNT(*) FROM public.categories
UNION ALL SELECT 'movie_blog_posts', COUNT(*) FROM public.movie_blog_posts;
```

### Check RLS Policies
```sql
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

### View Public Blog Posts
```sql
SELECT * FROM public.public_blog_posts_view;
```

## 🔧 Troubleshooting

### Common Issues

**Error: "relation does not exist"**
- Make sure you ran `COMPLETE_SCHEMA.sql` first

**Error: "permission denied"**
- Check that RLS policies are correctly applied
- Verify you're using the correct user UUID

**Blog posts not showing in public view**
- Check that `is_public = true` AND `admin_approved = true`

### Checking User Authentication
```sql
SELECT auth.uid(); -- Returns your user UUID when authenticated
```

## 🚀 After Setup

1. ✅ Test user registration and automatic profile creation
2. ✅ Add a movie from search and verify it appears in the database
3. ✅ Add tags/categories to a movie
4. ✅ Verify blog post is generated at `/blog/[slug]`
5. ✅ Check sitemap at `/sitemap.xml`
6. ✅ Test admin pages at `/admin`

## 📝 TypeScript Types

After modifying the schema, regenerate TypeScript types:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts
```

The schema is designed to be SEO-friendly and scalable for your movie tagging application!
