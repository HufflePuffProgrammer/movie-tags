import { NextRequest, NextResponse } from 'next/server';
import { supabaseServerAnon } from '@/lib/supabase-server';

// This will trigger the supabase-server.ts debug logs immediately
console.log('🚀 API /search route loaded, supabase client ready:', !!supabaseServerAnon);

// TMDB API configuration
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const TMDB_BASE_URL_MOVIES = 'https://api.themoviedb.org/3/search/movie';
const TMDB_BASE_URL_TV_SHOWS = 'https://api.themoviedb.org/3/search/tv';
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
    const byLocalResults = searchParams.get('byLocalResults');
    const byMovies = searchParams.get('byMovies');
    const byTVShows = searchParams.get('byTVShows');

    if (!byMovies || byMovies.trim().length < 2) {
      console.log('❌ API /search: byMovies is empty');
    }
    if (!byTVShows || byTVShows.trim().length < 2) {
      console.log('❌ API /search: byTVShows is empty');
    }
    if (!query || query.trim().length < 2) {
      console.log('❌ API /search: Query too short, returning empty results');
      return NextResponse.json({ 
        localResults: [], 
        tmdbResults: [], 
        hasMore: false 
      });
    }
    //if byLocalResults is true, search local database first
    if (byLocalResults === 'true') {
      // Step 1: Search local database first

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
  
        localResults.map(m => ({ id: m.id, title: m.title, tmdb_id: m.tmdb_id }));
          

      return NextResponse.json({
        localResults,
        tmdbResults: [],
        hasMore: false
      });
    }
    

    if (!TMDB_API_KEY) {
      console.error('❌ API /search: TMDB API key not configured');
      return NextResponse.json({
        localResults: [],
        tmdbResults: [],
        hasMore: false,
        error: 'External search not available'
      });
    }

    let tmdbUrl: string;
    if (byTVShows === 'true' && byMovies !== 'true') {
      tmdbUrl = `${TMDB_BASE_URL_TV_SHOWS}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=1`;

    } else {
      tmdbUrl = `${TMDB_BASE_URL_MOVIES}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=1`;

    }

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
