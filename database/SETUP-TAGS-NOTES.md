# User Tags and Notes Database Setup

This guide will help you set up the database tables for user-created tags and notes functionality.

## Prerequisites

- You should have already run the main `schema.sql` file
- You should have a working Supabase project
- You should have the main categories functionality working

## Step 1: Run the Schema

Execute the following SQL script in your Supabase SQL Editor:

```sql
-- Copy and paste the contents of user-tags-notes-schema.sql
```

Or simply run the `user-tags-notes-schema.sql` file in your Supabase SQL Editor.

## Step 2: Verify Tables

After running the schema, verify that the following tables were created:

1. **user_tags**
   - `id` (BIGINT, PRIMARY KEY)
   - `user_id` (UUID, REFERENCES auth.users)
   - `movie_id` (BIGINT, REFERENCES movies)
   - `tag_name` (TEXT)
   - `color` (TEXT, hex color code)
   - `created_at` (TIMESTAMPTZ)

2. **user_notes**
   - `id` (BIGINT, PRIMARY KEY)
   - `user_id` (UUID, REFERENCES auth.users)
   - `movie_id` (BIGINT, REFERENCES movies)
   - `content` (TEXT)
   - `created_at` (TIMESTAMPTZ)
   - `updated_at` (TIMESTAMPTZ)

## Step 3: Test the Functionality

1. **Sign in** to your application
2. **Navigate** to any movie detail page
3. **Add a tag** by clicking "Add Tag" and typing a tag name
4. **Add a note** by clicking "Add Note" and writing some content
5. **Remove tags/notes** by clicking the X button
6. **Refresh the page** to verify data persistence

## Features

### Tags
- ✅ Create custom tags for movies
- ✅ Random color assignment
- ✅ Prevent duplicate tags per movie per user
- ✅ Real-time UI updates
- ✅ Success/error notifications

### Notes
- ✅ Create multiple notes per movie
- ✅ Chronological ordering (newest first)
- ✅ Real-time UI updates
- ✅ Success/error notifications

## Security

- **Row Level Security (RLS)** is enabled on both tables
- Users can only access their own tags and notes
- All operations are secured with user ID checks

## Database Functions

The schema includes helper functions:

- `get_user_movie_tags(user_uuid, movie_id)` - Get all tags for a user's movie
- `get_user_movie_notes(user_uuid, movie_id)` - Get all notes for a user's movie

## Troubleshooting

### Common Issues

1. **"Failed to add tag/note"**
   - Check that RLS policies are properly set
   - Verify user is authenticated
   - Check browser console for detailed errors

2. **Tags/notes not showing**
   - Verify the tables were created successfully
   - Check that data exists in the database
   - Ensure user ID matches between auth and database

3. **Duplicate tag error**
   - This is expected behavior - users cannot add the same tag twice to a movie
   - The unique constraint prevents duplicates

### Debugging Queries

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_tags', 'user_notes');

-- View user's tags for a specific movie
SELECT * FROM user_tags 
WHERE user_id = 'YOUR_USER_ID' 
AND movie_id = YOUR_MOVIE_ID;

-- View user's notes for a specific movie
SELECT * FROM user_notes 
WHERE user_id = 'YOUR_USER_ID' 
AND movie_id = YOUR_MOVIE_ID;
```

## Next Steps

With tags and notes working, you might want to:

1. Add tag-based filtering to the movie search
2. Implement note editing functionality
3. Add tag suggestions based on popular tags
4. Create tag analytics and statistics
5. Add export functionality for user data
