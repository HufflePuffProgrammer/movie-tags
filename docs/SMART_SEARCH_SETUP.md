# Smart Movie Search Setup Guide

This guide will help you set up the Smart Movie Search feature with TMDB integration.

## Overview

The Smart Movie Search feature provides:
- **Autocomplete search** with instant results from your local database
- **TMDB fallback** when movies aren't found locally
- **One-click movie addition** from TMDB to your local database
- **Keyboard navigation** support (arrow keys, enter, escape)
- **Rate limiting** to respect TMDB API limits

## Prerequisites

1. **TMDB API Account**: You need a free account at [The Movie Database](https://www.themoviedb.org/)
2. **Updated Database Schema**: Use `database/complete-schema.sql` for full functionality

## Step 1: Get TMDB API Key

1. Go to [TMDB](https://www.themoviedb.org/) and create a free account
2. Navigate to Settings > API
3. Request an API key (choose "Developer" option)
4. Fill out the application form (you can use your project details)
5. Once approved, copy your API key

## Step 2: Update Environment Variables

Add the TMDB API key to your `.env.local` file:

```bash
# Existing Supabase config...
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Add this for TMDB integration
TMDB_API_KEY=your-tmdb-api-key-here
```

## Step 3: Update Database Schema

If you haven't already, run the complete schema:

1. Go to your Supabase dashboard
2. Open SQL Editor
3. Run the contents of `database/complete-schema.sql`

This adds:
- `tmdb_id` field with unique constraint
- `overview` field for TMDB descriptions
- Full-text search index for better performance

## Step 4: Test the Feature

1. Start your development server: `npm run dev`
2. Go to the homepage
3. Start typing in the search box
4. You should see:
   - Local movies appear first (if any match)
   - TMDB results appear with "Add" buttons (if no local matches)

## How It Works

### Search Flow
1. **User types** → Debounced search (300ms delay)
2. **Local search first** → Query your Supabase database
3. **TMDB fallback** → If no local results, query TMDB API
4. **Filter duplicates** → Remove TMDB movies that already exist locally

### Adding Movies
1. **User clicks "Add"** → POST to `/api/add-movie`
2. **Insert to database** → Add movie with TMDB data
3. **Enrich data** → Fetch additional details (director, genre, runtime)
4. **Update UI** → Remove from TMDB results, show success message

### Rate Limiting
- TMDB free tier: 40 requests per 10 seconds
- Built-in rate limiting in the API route
- Graceful degradation if limits exceeded

## API Endpoints

### GET /api/search
- **Purpose**: Search local database and TMDB
- **Parameters**: `?query=movie+title`
- **Returns**: `{ localResults, tmdbResults, hasMore }`

### POST /api/add-movie
- **Purpose**: Add TMDB movie to local database
- **Body**: `{ tmdbMovie: TMDBMovieData }`
- **Returns**: `{ success, message, movie }`

## Customization

### Search Component Props
```tsx
<SmartMovieSearch
  placeholder="Custom placeholder..."
  onMovieSelect={(movie) => {
    // Handle local movie selection
  }}
  onMovieAdded={(movie) => {
    // Handle movie addition from TMDB
  }}
  showAddButton={true} // Show/hide TMDB add buttons
  className="custom-classes"
/>
```

### Styling
The component uses Tailwind CSS classes and follows your existing design system. Key classes:
- `focus:ring-yellow-500` - Matches your yellow theme
- `hover:bg-gray-50` - Consistent hover states
- `border-gray-200` - Matches existing borders

## Troubleshooting

### TMDB API Not Working
- Check your API key is correct
- Verify the key is in `.env.local` (not `.env`)
- Restart your development server after adding the key
- Check browser network tab for API errors

### Movies Not Appearing in Search
- Verify database schema is updated
- Check Supabase RLS policies allow reading movies
- Look for console errors in browser dev tools

### Duplicate Movies
- The system prevents duplicates using `tmdb_id` unique constraint
- If you see duplicates, check your database schema

### Rate Limiting Issues
- TMDB free tier has limits (40 requests per 10 seconds)
- The system includes basic rate limiting
- Consider upgrading TMDB plan for production use

## Production Considerations

1. **Caching**: Consider adding Redis caching for TMDB results
2. **Error Handling**: Add comprehensive error boundaries
3. **Analytics**: Track search queries and movie additions
4. **Performance**: Monitor API response times
5. **Security**: Validate all inputs and sanitize data

## Feature Extensions

The smart search system is designed to be extensible:

- **TV Shows**: Add TMDB TV show support
- **Bulk Import**: Allow importing multiple movies at once
- **Advanced Filters**: Add genre, year, rating filters to TMDB search
- **Recommendations**: Use TMDB's recommendation API
- **Images**: Cache movie posters locally
- **Metadata**: Store cast, crew, and detailed information

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify your environment variables
3. Test the API endpoints directly
4. Check Supabase logs for database errors
