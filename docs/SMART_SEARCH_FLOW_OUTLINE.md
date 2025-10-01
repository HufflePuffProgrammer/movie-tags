# Smart Movie Search Flow Outline

## 🔄 **Complete Search Flow**

### 1. **User Input** 
```
User types "Inception" → Component debounces for 300ms → Triggers search
```

### 2. **Frontend Request**
```typescript
// SmartMovieSearch.tsx calls:
const response = await fetch(`/api/search?query=${encodeURIComponent(searchQuery)}`);
```

### 3. **Backend Processing** (`/api/search`)

#### Step 3A: **Local Database Search First**
```sql
-- Searches your Supabase database
SELECT * FROM movies 
WHERE title ILIKE '%Inception%' 
   OR overview ILIKE '%Inception%' 
   OR description ILIKE '%Inception%' 
   OR director ILIKE '%Inception%'
ORDER BY created_at DESC 
LIMIT 10;
```

#### Step 3B: **Decision Point**
```typescript
if (localResults.length > 0) {
  // ✅ Found local movies - return immediately
  return { localResults, tmdbResults: [], hasMore: false };
} else {
  // ❌ No local movies - proceed to TMDB
}
```

#### Step 3C: **TMDB API Call** (Only if no local results)
```typescript
// 🌐 External API call to TMDB
const tmdbResponse = await fetch(
  `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=Inception&page=1`
);

// Example TMDB Response:
{
  "results": [
    {
      "id": 27205,
      "title": "Inception",
      "overview": "Dom Cobb is a skilled thief...",
      "release_date": "2010-07-16",
      "poster_path": "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
      "vote_average": 8.4
    }
  ]
}
```

#### Step 3D: **Duplicate Filtering**
```typescript
// Check which TMDB movies already exist in our database
const existingMovies = await supabase
  .from('movies')
  .select('tmdb_id')
  .in('tmdb_id', [27205, 550, 680]); // TMDB IDs from results

// Filter out duplicates
const filteredTmdbMovies = tmdbMovies.filter(movie => 
  !existingTmdbIds.has(movie.id)
);
```

### 4. **Frontend Display**

#### Scenario A: **Local Results Found**
```
┌─────────────────────────────┐
│ 🏠 Your Library             │
├─────────────────────────────┤
│ [🎬] Inception (2010)       │
│      Christopher Nolan      │
│      "Dom Cobb is a..."     │
└─────────────────────────────┘
```

#### Scenario B: **TMDB Results (No Local)**
```
┌─────────────────────────────┐
│ ➕ Add from TMDB            │
├─────────────────────────────┤
│ [🎬] Inception (2010) [Add] │
│      ⭐ 8.4 • TMDB          │
│      "Dom Cobb is a..."     │
└─────────────────────────────┘
```

### 5. **Movie Addition Flow** (When user clicks "Add")

#### Step 5A: **Frontend Request**
```typescript
// SmartMovieSearch.tsx calls:
const response = await fetch('/api/add-movie', {
  method: 'POST',
  body: JSON.stringify({ 
    tmdbMovie: {
      id: 27205,
      title: "Inception",
      overview: "Dom Cobb is a skilled thief...",
      release_date: "2010-07-16",
      poster_path: "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg"
    }
  })
});
```

#### Step 5B: **Database Insertion** (`/api/add-movie`)
```sql
-- Insert into your Supabase database
INSERT INTO movies (
  title, overview, release_date, poster_url, tmdb_id
) VALUES (
  'Inception', 
  'Dom Cobb is a skilled thief...', 
  '2010-07-16',
  'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
  27205
);
```

#### Step 5C: **Data Enrichment** (Optional)
```typescript
// Fetch additional details from TMDB
const detailsResponse = await fetch(
  `https://api.themoviedb.org/3/movie/27205?api_key=${TMDB_API_KEY}&append_to_response=credits`
);

// Update movie with director, genre, runtime
UPDATE movies SET 
  director = 'Christopher Nolan',
  genre = 'Science Fiction',
  runtime_minutes = 148
WHERE tmdb_id = 27205;
```

## 🔧 **Without TMDB API Key**

### Current Behavior:
```typescript
if (!TMDB_API_KEY) {
  return {
    localResults: [], 
    tmdbResults: [], 
    hasMore: false,
    error: 'External search not available'
  };
}
```

### What Users See:
```
┌─────────────────────────────┐
│ 🔍 Search Movies            │
├─────────────────────────────┤
│ [Search: "Inception"]       │
├─────────────────────────────┤
│ ❌ External search not      │
│    available                │
└─────────────────────────────┘
```

## 🚀 **With TMDB API Key**

### 1. **Get API Key**
- Go to [TMDB](https://www.themoviedb.org/settings/api)
- Request free API key
- Add to `.env.local`: `TMDB_API_KEY=your-key-here`

### 2. **Full Experience**
```
User searches "Blade Runner" →
├─ Local DB: No results
├─ TMDB API: Returns 5 movies
├─ Display: Shows "Add" buttons
└─ User clicks "Add" → Movie saved to local DB
```

### 3. **Next Search**
```
User searches "Blade Runner" again →
├─ Local DB: Found! (from previous addition)
├─ TMDB API: Skipped (local results found)
└─ Display: Shows local movie instantly
```

## 📊 **API Rate Limits**

### TMDB Free Tier:
- **40 requests per 10 seconds**
- **1,000 requests per day**

### Built-in Protection:
```typescript
// Rate limiting logic in /api/search
const rateLimitStore = new Map();
function checkRateLimit(ip: string): boolean {
  // Tracks requests per IP
  // Prevents exceeding TMDB limits
}
```

## 🎯 **Key Benefits**

1. **⚡ Speed**: Local search is instant (< 50ms)
2. **🌐 Coverage**: Access to 1M+ movies via TMDB
3. **🔄 Growth**: Your database grows as users add movies
4. **💰 Cost**: Free TMDB tier handles most usage
5. **🛡️ Resilience**: Works even if TMDB is down (local-only)

## 🔍 **Testing Without API Key**

You can test the local search functionality immediately:
1. Add some movies via admin interface
2. Search for them - they'll appear instantly
3. TMDB fallback will show "External search not available"

Once you add the TMDB API key, the full experience activates automatically!
