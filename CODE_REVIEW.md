# Code Review Report - Movie Tags Application

**Date:** November 18, 2025  
**Reviewer:** AI Code Reviewer  
**Files Reviewed:**
- `app/api/search/route.ts`
- `app/api/add-movie/route.ts`
- `app/api/test-env/route.ts`
- `contexts/auth-context.tsx`
- `hooks/useUserPersonalization.ts`

---

## 🚨 Critical Issues

### 1. **app/api/search/route.ts** - Unused Code & Dead Logic

**Location:** Lines 78-79  
**Severity:** Critical  
**Issue:** Dead code that serves no purpose

```typescript
localResults.map(m => ({ id: m.id, title: m.title, tmdb_id: m.tmdb_id }));
```

**Problem:** This mapping operation creates an array but never assigns it or uses it.  
**Fix:** Remove it entirely.

---

**Location:** Lines 47-52  
**Severity:** Medium  
**Issue:** Misleading logs that don't affect execution

```typescript
if (!byMovies || byMovies.trim().length < 2) {
  console.log('❌ API /search: byMovies is empty');
}
if (!byTVShows || byTVShows.trim().length < 2) {
  console.log('❌ API /search: byTVShows is empty');
}
```

**Problem:** These logs run but don't actually stop execution. This is misleading because they suggest validation is happening when it isn't.  
**Fix:** Either remove these logs or add proper validation logic.

---

### 2. **hooks/useUserPersonalization.ts** - Missing useEffect Dependencies

**Location:** Lines 88-90  
**Severity:** Critical  
**Issue:** Severe React Hook violation

```typescript
useEffect(() => {
  fetchUserPersonalization();
}, [movieId, userId]);
```

**Problem:** `fetchUserPersonalization` is not memoized and will be recreated on every render, potentially causing infinite loops or stale closures. React's exhaustive-deps ESLint rule should be catching this.

**Fix Option 1 (Quick):**
```typescript
useEffect(() => {
  fetchUserPersonalization();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [movieId, userId]);
```

**Fix Option 2 (Better):**
```typescript
const fetchUserPersonalization = useCallback(async () => {
  if (!userId || !movieId) return;

  try {
    const supabase = createClient();
    // ... existing code
  } catch (error) {
    console.error('Error fetching user personalization:', error);
  }
}, [userId, movieId]);

useEffect(() => {
  fetchUserPersonalization();
}, [fetchUserPersonalization]);
```

--- DONE

### 3. **hooks/useUserPersonalization.ts** - Multiple Supabase Client Instantiations

**Location:** Throughout the hook  
**Severity:** Critical (Performance)  
**Issue:** Every operation creates a new Supabase client

```typescript
const supabase = createClient(); // Called in addTag, removeTag, addCategory, etc.
```

**Problem:** Creates unnecessary overhead. Each function call creates a new client instance.

**Fix:**
```typescript
export function useUserPersonalization(movieId: string, userId?: string) {
  const supabase = useMemo(() => createClient(), []); // Create once
  
  const [userTags, setUserTags] = useState<UserTagWithDetails[]>([]);
  // ... rest of hook uses the same supabase instance
}
```

---

## ⚠️ High-Priority Issues

### 4. **app/api/search/route.ts** - SQL Injection Risk

**Location:** Line 68  
**Severity:** High (Security)  
**Issue:** Unsafe string interpolation in SQL query

```typescript
.or(`title.ilike.%${query}%,overview.ilike.%${query}%,description.ilike.%${query}%,director.ilike.%${query}%`)
```

**Problem:** While Supabase may sanitize this, it's better practice to escape special SQL LIKE characters.

**Fix:**
```typescript
const escapeQuery = (str: string) => str.replace(/[%_]/g, '\\$&');
const escapedQuery = escapeQuery(query);

.or(`title.ilike.%${escapedQuery}%,overview.ilike.%${escapedQuery}%,description.ilike.%${escapedQuery}%,director.ilike.%${escapedQuery}%`)
```

**Better Alternative:** Use Supabase's `.textSearch()` if full-text search is enabled in your database.

--- DONE

### 5. **app/api/search/route.ts** - Hardcoded Limits & Magic Numbers

**Location:** Lines 70, 130  
**Severity:** Medium  
**Issue:** Hardcoded pagination limits

```typescript
.limit(10);  // Why 10?
const tmdbMovies: TMDBMovie[] = tmdbData.results?.slice(0, 5) || [];  // Why 5?
```

**Fix:**
```typescript
// Add to top of file
const LOCAL_SEARCH_LIMIT = 10;
const TMDB_RESULTS_LIMIT = 5;
const TMDB_REQUEST_TIMEOUT = 5000;

// Then use throughout:
.limit(LOCAL_SEARCH_LIMIT);
const tmdbMovies: TMDBMovie[] = tmdbData.results?.slice(0, TMDB_RESULTS_LIMIT) || [];
```

--- DONE

### 6. **All API Routes** - Missing Request Validation

**Location:** All API routes  
**Severity:** High (Security)  
**Issue:** None of the API routes validate:
- Request body size
- Request rate limiting
- Input sanitization
- CORS headers (if needed)

**Example Fix for add-movie/route.ts:**
```typescript
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate body exists and is object
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body' }, 
        { status: 400 }
      );
    }
    
    const { tmdbMovie }: { tmdbMovie: TMDBMovieData } = body;

    // Validate required fields
    if (!tmdbMovie || !tmdbMovie.id || !tmdbMovie.title) {
      return NextResponse.json(
        { error: 'Invalid movie data provided' },
        { status: 400 }
      );
    }

    // Validate string lengths
    if (tmdbMovie.title?.length > 500) {
      return NextResponse.json(
        { error: 'Title too long (max 500 characters)' }, 
        { status: 400 }
      );
    }

    if (tmdbMovie.overview?.length > 5000) {
      return NextResponse.json(
        { error: 'Overview too long (max 5000 characters)' }, 
        { status: 400 }
      );
    }

    // ... rest of logic
  } catch (error) {
    // Handle JSON parse errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    console.error('Add movie API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---
DONE!!!
### 7. **contexts/auth-context.tsx** - Error Handling Missing

**Location:** Lines 43-53, 56-62  
**Severity:** High  
**Issue:** Sign-up and sign-in don't handle errors centrally

```typescript
const signUp = async (email: string, password: string, displayName?: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName || 'User',
      }
    }
  })
  return { data, error } // Just returns, doesn't handle
}
```

**Problem:** Consumers must remember to check for errors. Better to throw or handle centrally.

**Fix:**
```typescript
const signUp = async (email: string, password: string, displayName?: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName || 'User',
        }
      }
    });
    
    if (error) {
      console.error('Sign up error:', error);
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Sign up error:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error occurred')
    };
  }
}

const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('Sign in error:', error);
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Sign in error:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error occurred')
    };
  }
}
```

--- DONE

## 📊 Performance & Best Practices

### 8. **hooks/useUserPersonalization.ts** - Excessive Re-fetching

**Location:** Throughout the hook (addTag, addCategory, addNote, etc.)  
**Severity:** Medium (Performance)  
**Issue:** After every add/remove operation, the entire personalization data is re-fetched

```typescript
// In addTag, addCategory, addNote
fetchUserPersonalization(); // Fetches ALL data (tags, categories, notes)
```

**Problem:** Wasteful network requests. If user adds a tag, you refetch tags, categories, AND notes.

**Fix - Optimistic Updates:**
```typescript
const addTag = async (tag: Tag) => {
  if (!userId || !movieId) return;
  
  try {
    const supabase = createClient();
    
    // Create optimistic tag
    const optimisticTag: UserTagWithDetails = {
      id: Date.now(), // Temporary ID
      user_id: userId,
      movie_id: parseInt(movieId),
      tag_id: tag.id,
      tag,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Optimistically update UI
    setUserTags(prevTags => [...prevTags, optimisticTag]);
    
    const { data, error } = await supabase
      .from('user_movie_tags')
      .insert({
        user_id: userId,
        movie_id: parseInt(movieId),
        tag_id: tag.id
      } as any)
      .select(`
        *,
        tag:tags(*)
      `)
      .single();

    if (error) {
      // Rollback on error
      setUserTags(prevTags => prevTags.filter(t => t.id !== optimisticTag.id));
      
      if (error.code === '23505') {
        setNotification({
          type: 'error',
          message: 'You have already added this tag to this movie.'
        });
      } else {
        setNotification({
          type: 'error',
          message: 'Failed to add tag. Please try again.'
        });
      }
    } else {
      // Replace temporary tag with real data
      setUserTags(prevTags => 
        prevTags.map(t => t.id === optimisticTag.id ? data : t)
      );
      
      setNotification({
        type: 'success',
        message: 'Tag added successfully!'
      });
    }
  } catch (error) {
    // Rollback on error
    setUserTags(prevTags => prevTags.filter(t => t.id !== optimisticTag.id));
    
    console.error('Error adding tag:', error);
    setNotification({
      type: 'error',
      message: 'Failed to add tag. Please try again.'
    });
  }
};
```

--- DONE

### 9. **app/api/add-movie/route.ts** - Blocking Enrichment

**Location:** Lines 83-90  
**Severity:** Medium (Performance)  
**Issue:** Enrichment blocks response

```typescript
if (process.env.TMDB_API_KEY) {
  try {
    await enrichMovieData(newMovie.id, tmdbMovie.id);
  } catch (error) {
    console.warn('Failed to enrich movie data:', error);
  }
}
```

**Problem:** The `await` means the user waits 5+ seconds for enrichment before getting a response.

**Fix Options:**

**Option A - Add Timeout Protection:**
```typescript
if (process.env.TMDB_API_KEY) {
  try {
    await Promise.race([
      enrichMovieData(newMovie.id, tmdbMovie.id),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Enrichment timeout')), 3000)
      )
    ]);
  } catch (error) {
    console.warn('Failed to enrich movie data:', error);
  }
}
```

**Option B - Fire and Forget (Recommended):**
```typescript
// Return response immediately
const response = NextResponse.json({
  success: true,
  message: `"${tmdbMovie.title}" has been added to your library.`,
  movie: newMovie
});

// Enrich in background (don't await)
if (process.env.TMDB_API_KEY) {
  enrichMovieData(newMovie.id, tmdbMovie.id).catch(error => {
    console.warn('Failed to enrich movie data:', error);
  });
}

return response;
```

**Option C - Make it Optional:**
```typescript
// Add query parameter support
const { searchParams } = new URL(request.url);
const shouldEnrich = searchParams.get('enrich') === 'true';

if (shouldEnrich && process.env.TMDB_API_KEY) {
  try {
    await enrichMovieData(newMovie.id, tmdbMovie.id);
  } catch (error) {
    console.warn('Failed to enrich movie data:', error);
  }
}
```

--- DONE

### 10. **app/api/search/route.ts** - Inconsistent Error Response Format

**Location:** Throughout the file  
**Severity:** Medium  
**Issue:** Different error responses have different shapes

```typescript
// Line 55 - No error field
return NextResponse.json({ 
  localResults: [], 
  tmdbResults: [], 
  hasMore: false 
});

// Line 91 - Has error field
return NextResponse.json({
  localResults: [],
  tmdbResults: [],
  hasMore: false,
  error: 'External search not available'
});

// Line 171 - Has error field AND different status
return NextResponse.json({
  localResults: [],
  tmdbResults: [],
  hasMore: false,
  error: 'Search temporarily unavailable'
}, { status: 500 });
```

**Fix - Standardize Response Interface:**
```typescript
// Add to top of file
interface SearchResponse {
  localResults: LocalMovie[];
  tmdbResults: TMDBMovie[];
  hasMore: boolean;
  error?: string;
  errorCode?: 'QUERY_TOO_SHORT' | 'TMDB_UNAVAILABLE' | 'SERVER_ERROR';
}

// Helper function
function createSearchResponse(
  localResults: LocalMovie[] = [],
  tmdbResults: TMDBMovie[] = [],
  hasMore: boolean = false,
  error?: string,
  errorCode?: SearchResponse['errorCode']
): SearchResponse {
  return {
    localResults,
    tmdbResults,
    hasMore,
    ...(error && { error }),
    ...(errorCode && { errorCode })
  };
}

// Then use throughout:
if (!query || query.trim().length < 2) {
  console.log('❌ API /search: Query too short');
  return NextResponse.json(
    createSearchResponse([], [], false, 'Query must be at least 2 characters', 'QUERY_TOO_SHORT')
  );
}

if (!TMDB_API_KEY) {
  console.error('❌ API /search: TMDB API key not configured');
  return NextResponse.json(
    createSearchResponse([], [], false, 'External search not available', 'TMDB_UNAVAILABLE')
  );
}
```

---

## 🎨 Code Organization & Architecture

### 11. **Extract Notification Logic to Separate Hook**

**Current Issue:** Notification pattern is repeated across `useUserPersonalization`  
**Recommendation:** Extract to reusable hook

**Create: `hooks/useNotification.ts`**
```typescript
import { useState } from 'react';

interface NotificationState {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

export function useNotification() {
  const [notification, setNotification] = useState<NotificationState | null>(null);
  
  const showSuccess = (message: string) => {
    setNotification({ type: 'success', message });
  };
  
  const showError = (message: string) => {
    setNotification({ type: 'error', message });
  };
  
  const showInfo = (message: string) => {
    setNotification({ type: 'info', message });
  };
  
  const showWarning = (message: string) => {
    setNotification({ type: 'warning', message });
  };
  
  const clearNotification = () => setNotification(null);
  
  return { 
    notification, 
    showSuccess, 
    showError, 
    showInfo, 
    showWarning, 
    clearNotification,
    setNotification // Keep for backward compatibility
  };
}
```

**Then in `useUserPersonalization`:**
```typescript
export function useUserPersonalization(movieId: string, userId?: string) {
  const [userTags, setUserTags] = useState<UserTagWithDetails[]>([]);
  const [userCategories, setUserCategories] = useState<UserCategoryWithDetails[]>([]);
  const [userNotes, setUserNotes] = useState<UserNote[]>([]);
  const { notification, showSuccess, showError, setNotification } = useNotification();

  // ... rest of hook

  const addTag = async (tag: Tag) => {
    // ... logic
    if (error) {
      showError('Failed to add tag. Please try again.');
    } else {
      showSuccess('Tag added successfully!');
    }
  };
}
```

---

### 12. **Extract Database Operations to Service Layer**

**Current Issue:** All Supabase operations are embedded in hooks  
**Recommendation:** Create service layer for better separation of concerns

**Create: `lib/services/personalization-service.ts`**
```typescript
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

type Category = Database['public']['Tables']['categories']['Row'];
type Tag = Database['public']['Tables']['tags']['Row'];

export class PersonalizationService {
  constructor(private supabase: SupabaseClient) {}
  
  // Tag operations
  async getUserTags(userId: string, movieId: number) {
    return this.supabase
      .from('user_movie_tags')
      .select(`
        *,
        tag:tags(*)
      `)
      .eq('user_id', userId)
      .eq('movie_id', movieId);
  }
  
  async addTag(userId: string, movieId: number, tagId: number) {
    return this.supabase
      .from('user_movie_tags')
      .insert({
        user_id: userId,
        movie_id: movieId,
        tag_id: tagId
      })
      .select(`
        *,
        tag:tags(*)
      `)
      .single();
  }
  
  async removeTag(tagId: number, userId: string) {
    return this.supabase
      .from('user_movie_tags')
      .delete()
      .eq('id', tagId)
      .eq('user_id', userId);
  }
  
  // Category operations
  async getUserCategories(userId: string, movieId: number) {
    return this.supabase
      .from('user_movie_categories')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('user_id', userId)
      .eq('movie_id', movieId);
  }
  
  async addCategory(userId: string, movieId: number, categoryId: number) {
    return this.supabase
      .from('user_movie_categories')
      .insert({
        user_id: userId,
        movie_id: movieId,
        category_id: categoryId
      });
  }
  
  async removeCategory(categoryId: number, userId: string) {
    return this.supabase
      .from('user_movie_categories')
      .delete()
      .eq('id', categoryId)
      .eq('user_id', userId);
  }
  
  // Note operations
  async getUserNotes(userId: string, movieId: number) {
    return this.supabase
      .from('user_notes')
      .select('*')
      .eq('user_id', userId)
      .eq('movie_id', movieId)
      .order('created_at', { ascending: false });
  }
  
  async addNote(userId: string, movieId: number, content: string) {
    return this.supabase
      .from('user_notes')
      .insert({
        user_id: userId,
        movie_id: movieId,
        content: content
      })
      .select()
      .single();
  }
  
  async removeNote(noteId: number, userId: string) {
    return this.supabase
      .from('user_notes')
      .delete()
      .eq('id', noteId)
      .eq('user_id', userId);
  }
}
```

**Then simplify `useUserPersonalization`:**
```typescript
import { createClient } from '@/lib/supabase-client';
import { PersonalizationService } from '@/lib/services/personalization-service';

export function useUserPersonalization(movieId: string, userId?: string) {
  const supabase = useMemo(() => createClient(), []);
  const service = useMemo(() => new PersonalizationService(supabase), [supabase]);
  
  // ... state declarations

  const addTag = async (tag: Tag) => {
    if (!userId || !movieId) return;
    
    try {
      const { data, error } = await service.addTag(userId, parseInt(movieId), tag.id);
      
      if (error) {
        handleTagError(error);
      } else {
        fetchUserPersonalization();
        showSuccess('Tag added successfully!');
      }
    } catch (error) {
      console.error('Error adding tag:', error);
      showError('Failed to add tag. Please try again.');
    }
  };
  
  // ... other methods
}
```

---

### 13. **Extract TMDB Configuration to Separate File**

**Current Issue:** TMDB constants are duplicated across files  
**Recommendation:** Centralize configuration

**Create: `lib/tmdb-config.ts`**
```typescript
export const TMDB_CONFIG = {
  API_KEY: process.env.TMDB_API_KEY,
  BASE_URL: 'https://api.themoviedb.org/3',
  IMAGE_BASE_URL: 'https://image.tmdb.org/t/p/w500',
  TIMEOUT: 5000,
  
  ENDPOINTS: {
    SEARCH_MOVIES: '/search/movie',
    SEARCH_TV: '/search/tv',
    MOVIE_DETAILS: (id: number) => `/movie/${id}`,
  },
  
  buildUrl: (endpoint: string, params: Record<string, string> = {}) => {
    const url = new URL(`${TMDB_CONFIG.BASE_URL}${endpoint}`);
    url.searchParams.append('api_key', TMDB_CONFIG.API_KEY || '');
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
    return url.toString();
  },
  
  buildImageUrl: (path: string | null, size: 'w500' | 'w780' | 'original' = 'w500') => {
    if (!path) return null;
    return `https://image.tmdb.org/t/p/${size}${path}`;
  }
} as const;

// Type-safe TMDB fetch helper
export async function fetchTMDB<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = TMDB_CONFIG.buildUrl(endpoint, params);
  
  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' },
    signal: AbortSignal.timeout(TMDB_CONFIG.TIMEOUT)
  });

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
```

**Then in search route:**
```typescript
import { TMDB_CONFIG, fetchTMDB } from '@/lib/tmdb-config';

export async function GET(request: NextRequest) {
  // ... validation

  if (!TMDB_CONFIG.API_KEY) {
    return NextResponse.json(createSearchResponse(
      [], [], false, 'External search not available', 'TMDB_UNAVAILABLE'
    ));
  }

  const endpoint = byTVShows === 'true' && byMovies !== 'true' 
    ? TMDB_CONFIG.ENDPOINTS.SEARCH_TV 
    : TMDB_CONFIG.ENDPOINTS.SEARCH_MOVIES;

  try {
    const tmdbData = await fetchTMDB<{ results: TMDBMovie[]; total_pages: number }>(
      endpoint,
      { query, page: '1' }
    );
    
    // ... process results
  } catch (error) {
    console.error('TMDB fetch error:', error);
    // ... handle error
  }
}
```

---

## 🐛 Minor Issues

### 14. **Unused Variables and Imports**

**app/api/search/route.ts:**
- Line 10: `TMDB_BASE_URL` defined but not used (line 9)
- Line 5: Excessive debug logging in production

**Fix:**
```typescript
// Remove unused constant
// const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Make logging conditional
if (process.env.NODE_ENV === 'development') {
  console.log('🚀 API /search route loaded, supabase client ready:', !!supabaseServerAnon);
}
```

---

### 15. **Commented-Out Code**

**app/api/search/route.ts - Lines 22-36**  
**Issue:** Large block of commented interface

```typescript
/* place holder for local movie
interface LocalMovie {
  id: number;
  title: string;
  description: string | null;
  overview: string | null;
  release_date: string | null;
  poster_url: string | null;
  director: string | null;
  genre: string | null;
  runtime_minutes: number | null;
  tmdb_id: number | null;
  created_at: string;
}
*/
```

**Fix:** Remove commented code. If needed, it's in git history. Or move to a proper types file.

---

### 16. **Inconsistent Logging Levels**

**Issue:** Some functions have extensive logging, others have none.

**Recommendation:** Use a proper logging library or create a logger utility:

**Create: `lib/logger.ts`**
```typescript
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const shouldLog = (level: LogLevel): boolean => {
  if (process.env.NODE_ENV === 'production') {
    return level === 'error' || level === 'warn';
  }
  return true;
};

export const logger = {
  debug: (...args: any[]) => {
    if (shouldLog('debug')) console.log('🐛', ...args);
  },
  info: (...args: any[]) => {
    if (shouldLog('info')) console.log('ℹ️', ...args);
  },
  warn: (...args: any[]) => {
    if (shouldLog('warn')) console.warn('⚠️', ...args);
  },
  error: (...args: any[]) => {
    if (shouldLog('error')) console.error('❌', ...args);
  },
  api: (route: string, message: string, data?: any) => {
    if (shouldLog('debug')) {
      console.log(`🔌 [${route}]`, message, data || '');
    }
  }
};
```

**Usage:**
```typescript
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  logger.api('/search', 'Received request', { query });
  // ... logic
  logger.error('Search API error:', error);
}
```

---

### 17. **Type Safety Issues**

**hooks/useUserPersonalization.ts - Lines 105, 190, 272**  
**Issue:** Using `as any` to bypass type checking

```typescript
.insert({
  user_id: userId,
  movie_id: parseInt(movieId),
  tag_id: tag.id
} as any)
```

**Fix:** Define proper insert types from your database schema:

```typescript
type UserMovieTagInsert = Database['public']['Tables']['user_movie_tags']['Insert'];
type UserMovieCategoryInsert = Database['public']['Tables']['user_movie_categories']['Insert'];
type UserNoteInsert = Database['public']['Tables']['user_notes']['Insert'];

// Then use:
.insert({
  user_id: userId,
  movie_id: parseInt(movieId),
  tag_id: tag.id
} satisfies UserMovieTagInsert)
```

Or update your database types to have proper insert types that accept the values you're passing.

---

### 18. **Missing Error Boundary Context**

**Issue:** No global error boundary or error tracking

**Recommendation:** Add error boundary to catch React errors:

**Create: `components/ErrorBoundary.tsx`**
```typescript
'use client'

import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    // TODO: Send to error tracking service (Sentry, etc.)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-600 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Use in layout:**
```typescript
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

---

## 📝 Recommended Refactoring Plan

### Priority 1 (Critical - Do Now)
✅ **Week 1:**
1. Fix `useUserPersonalization` useEffect dependencies
2. Remove dead code from search route (lines 78-79)
3. Add error handling to auth context
4. Extract Supabase client instantiation to hook level
5. Remove commented code blocks

**Estimated Time:** 2-3 hours  
**Risk Level:** Low  
**Impact:** High (prevents bugs)

---

### Priority 2 (High - This Week)
✅ **Week 1-2:**
1. Standardize API error responses across all routes
2. Add input validation to all API routes
3. Escape SQL LIKE special characters in search
4. Replace hardcoded limits with named constants
5. Fix type safety issues (remove `as any`)

**Estimated Time:** 4-6 hours  
**Risk Level:** Medium  
**Impact:** High (security & consistency)

---

### Priority 3 (Medium - Next Sprint)
✅ **Week 2-3:**
1. Implement optimistic updates in personalization hook
2. Extract notification logic to separate hook
3. Create service layer for database operations
4. Extract TMDB configuration to separate file
5. Add timeout protection to movie enrichment
6. Create logger utility and standardize logging

**Estimated Time:** 8-10 hours  
**Risk Level:** Medium  
**Impact:** Medium (performance & maintainability)

---

### Priority 4 (Low - Technical Debt)
✅ **Week 3-4:**
1. Add rate limiting to API routes
2. Add error boundary component
3. Add JSDoc comments to public APIs
4. Consider implementing request caching
5. Add API response type definitions
6. Set up error tracking service integration

**Estimated Time:** 6-8 hours  
**Risk Level:** Low  
**Impact:** Low-Medium (polish & observability)

---

## ✅ What's Done Well

### Positive Aspects of Current Codebase:

1. **Good Separation of Concerns**
   - Hooks handle data fetching and business logic
   - Components handle presentation
   - Clean component/hook/context structure

2. **Consistent Naming Conventions**
   - Clear, descriptive function names
   - Consistent file naming patterns
   - Good use of TypeScript interfaces

3. **Error Logging**
   - Good console logging for debugging
   - Helpful emoji prefixes for log filtering
   - Detailed error context in logs

4. **Type Safety**
   - Strong TypeScript usage throughout
   - Database types properly generated
   - Good interface definitions

5. **Security Considerations**
   - User ID checks before deletions
   - Proper auth context implementation
   - Server-side API key handling

6. **User Experience**
   - Unique constraint handling (prevents duplicates)
   - Notification system for user feedback
   - Loading states implemented

7. **Code Organization**
   - Logical file structure
   - Modular components
   - Clear API route organization

---

## 📚 Additional Recommendations

### Testing Strategy

Consider adding tests for:
1. API routes (unit tests with mocked Supabase)
2. Hooks (React Testing Library)
3. Auth context behavior
4. Error scenarios

**Example test structure:**
```typescript
// tests/api/search.test.ts
import { GET } from '@/app/api/search/route';

describe('Search API', () => {
  it('returns empty results for short queries', async () => {
    const request = new NextRequest('http://localhost/api/search?query=a');
    const response = await GET(request);
    const data = await response.json();
    
    expect(data.tmdbResults).toEqual([]);
    expect(data.localResults).toEqual([]);
  });
});
```

---

### Performance Monitoring

Consider adding:
1. **Supabase query performance monitoring**
2. **TMDB API rate limit tracking**
3. **Client-side performance metrics** (Web Vitals)
4. **Error rate monitoring**

---

### Documentation

Add documentation for:
1. **API route documentation** (request/response formats)
2. **Hook usage examples**
3. **Database schema documentation**
4. **Environment variable requirements**

---

## 🔗 Quick Reference Links

### Files Reviewed:
- `app/api/search/route.ts` - Main search endpoint
- `app/api/add-movie/route.ts` - Movie addition endpoint
- `app/api/test-env/route.ts` - Environment test endpoint
- `contexts/auth-context.tsx` - Authentication context
- `hooks/useUserPersonalization.ts` - User data management hook

### Key Issues Summary:
- **3 Critical** issues requiring immediate attention
- **4 High-priority** issues affecting security/reliability
- **3 Performance** issues affecting user experience
- **6 Code organization** improvements for maintainability
- **5 Minor** issues for polish

---

## 📞 Next Steps

1. **Review this document** with your team
2. **Prioritize issues** based on your timeline
3. **Create GitHub issues** for tracking
4. **Implement fixes** following the priority order
5. **Add tests** as you refactor
6. **Update documentation** as needed

---

**End of Code Review**  
*Generated: November 18, 2025*

