import { NextRequest, NextResponse } from 'next/server';
import { supabaseServerAnon } from '@/lib/supabase-server';

// This will trigger the supabase-server.ts debug logs immediately
console.log('🚀 API /search route loaded, supabase client ready:', !!supabaseServerAnon);

// TMDB API configuration
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  poster_path: string | null;
  vote_average: number;
  genre_ids: number[];
}
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
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    
    console.log('🔍 API /search: Received request with query:', query);
    
    if (!query || query.trim().length < 2) {
      console.log('❌ API /search: Query too short, returning empty results');
      return NextResponse.json({ 
        localResults: [], 
        tmdbResults: [], 
        hasMore: false 
      });
    }

    // Step 1: Search local database first
    console.log('🗄️ API /search: Searching local database for:', query);
    const { data: localMovies, error: localError } = await supabaseServerAnon
      .from('movies')
      .select('*')
      .or(`title.ilike.%${query}%,overview.ilike.%${query}%,description.ilike.%${query}%,director.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(10);

    if (localError) {
      console.error('❌ API /search: Local search error:', localError);
    }

    const localResults = localMovies || [];
    console.log('📊 API /search: Local database returned', localResults.length, 'movies:', 
      localResults.map(m => ({ id: m.id, title: m.title, tmdb_id: m.tmdb_id })));
    
    // Step 2: If we have local results, return them first
    if (localResults.length > 0) {
      console.log('✅ API /search: Found local results, returning without TMDB call');
      return NextResponse.json({
        localResults,
        tmdbResults: [],
        hasMore: false
      });
    }

    // Step 3: If no local results, search TMDB
    console.log('🌐 API /search: No local results, trying TMDB fallback');
    if (!TMDB_API_KEY) {
      console.error('❌ API /search: TMDB API key not configured');
      return NextResponse.json({
        localResults: [],
        tmdbResults: [],
        hasMore: false,
        error: 'External search not available'
      });
    }

    const tmdbUrl = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=1`;
    console.log('🌐 API /search: Calling TMDB API:', tmdbUrl.replace(TMDB_API_KEY!, '[API_KEY]'));
    
    const tmdbResponse = await fetch(tmdbUrl, {
      headers: {
        'Accept': 'application/json',
      },
      // Add timeout and error handling
      signal: AbortSignal.timeout(5000)
    });

    if (!tmdbResponse.ok) {
      console.error('❌ API /search: TMDB API error:', tmdbResponse.status, tmdbResponse.statusText);
      throw new Error(`TMDB API error: ${tmdbResponse.status}`);
    }

    const tmdbData: {
      total_results: number;
      total_pages: number;
      results?: TMDBMovie[];
    } = await tmdbResponse.json();
    console.log('📥 API /search: TMDB API returned:', {
      totalResults: tmdbData.total_results,
      totalPages: tmdbData.total_pages,
      resultsCount: tmdbData.results?.length || 0,
      firstFewTitles: tmdbData.results?.slice(0, 3).map((m) => m.title) || []
    });
    
    // Step 4: Filter out movies that already exist in our database
    const tmdbMovies: TMDBMovie[] = tmdbData.results?.slice(0, 5) || [];
    
    if (tmdbMovies.length > 0) {
      // Check which TMDB movies already exist in our database
      const tmdbIds = tmdbMovies.map(movie => movie.id);
      console.log('🔍 API /search: Checking for existing movies with TMDB IDs:', tmdbIds);
      
      const { data: existingMovies } = await supabaseServerAnon
        .from('movies')
        .select('tmdb_id')
        .in('tmdb_id', tmdbIds);
      
      const existingTmdbIds = new Set(existingMovies?.map((m) => m.tmdb_id) || []);
      console.log('📊 API /search: Found existing TMDB IDs in database:', Array.from(existingTmdbIds));
      
      // Filter out movies that already exist
      const filteredTmdbMovies = tmdbMovies.filter(movie => !existingTmdbIds.has(movie.id));
      console.log('✅ API /search: After filtering duplicates, returning', filteredTmdbMovies.length, 'TMDB movies');
      
      // Add full poster URLs
      const tmdbResults = filteredTmdbMovies.map(movie => ({
        ...movie,
        poster_path: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : null
      }));

      return NextResponse.json({
        localResults: [],
        tmdbResults,
        hasMore: tmdbData.total_pages > 1
      });
    }

    return NextResponse.json({
      localResults: [],
      tmdbResults: [],
      hasMore: false
    });

  } catch (error) {
    console.error('Search API error:', error);
    
    // Return partial results if possible
    return NextResponse.json({
      localResults: [],
      tmdbResults: [],
      hasMore: false,
      error: 'Search temporarily unavailable'
    }, { status: 500 });
  }
}

// TODO: Consider re-introducing rate limiting if external API quotas become an issue.
