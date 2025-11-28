import { NextRequest, NextResponse } from 'next/server';
import { supabaseServerAnon } from '@/lib/supabase-server';
import { logger } from '@/lib/logger';
import { TMDB_CONFIG, fetchTMDB } from '@/lib/tmdb-config';

// This will trigger the supabase-server.ts debug logs immediately
if (process.env.NODE_ENV === 'development') {
  logger.debug('API /search route loaded, supabase client ready:', !!supabaseServerAnon);
}

// Constants
const LOCAL_SEARCH_LIMIT = 10;
const TMDB_RESULTS_LIMIT = 5;
interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  poster_path: string | null;
  vote_average: number;
  genre_ids: number[];
}

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
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query = searchParams.get('query');
    logger.api('/search', 'Received request with query:', { query });
    const byLocalResults = searchParams.get('byLocalResults');
    const byMovies = searchParams.get('byMovies');
    const byTVShows = searchParams.get('byTVShows');

    if (!byMovies || byMovies.trim().length < 2) {
      logger.error('API /search: byMovies is empty');
    }
    if (!byTVShows || byTVShows.trim().length < 2) {
      logger.error('API /search: byTVShows is empty');
    }
    if (!query || query.trim().length < 2) {
      logger.error('API /search: Query too short');
      return NextResponse.json(
        createSearchResponse([], [], false, 'Query must be at least 2 characters', 'QUERY_TOO_SHORT')
      );
    }
    //if byLocalResults is true, search local database first
    if (byLocalResults === 'true') {
      // Step 1: Search local database first
      // Escape special SQL LIKE characters to prevent injection
      const escapeQuery = (str: string) => str.replace(/[%_]/g, '\\$&');
      const escapedQuery = escapeQuery(query);

      const { data: localMovies, error: localError } = await supabaseServerAnon
        .from('movies')
        .select('*')
        .or(`title.ilike.%${escapedQuery}%,overview.ilike.%${escapedQuery}%,description.ilike.%${escapedQuery}%,director.ilike.%${escapedQuery}%`)
        .order('created_at', { ascending: false })
        .limit(LOCAL_SEARCH_LIMIT);


      if (localError) {
        logger.error('API /search: Local search error:', localError.message);
      }

      const localResults = localMovies || [];

      return NextResponse.json(
        createSearchResponse(localResults, [], false)
      );
    }
    


    if (!TMDB_CONFIG.API_KEY) {
      logger.error('API /search: TMDB API key not configured');
      return NextResponse.json(
        createSearchResponse([], [], false, 'External search not available', 'TMDB_UNAVAILABLE')
      );
    }
    
    const endpoint = byTVShows === 'true' && byMovies !== 'true' 
      ? TMDB_CONFIG.ENDPOINTS.SEARCH_TV 
      : TMDB_CONFIG.ENDPOINTS.SEARCH_MOVIES;

    // fetchTMDB already handles the request and returns parsed JSON
    const tmdbData = await fetchTMDB<{
      total_results: number;
      total_pages: number;
      results: TMDBMovie[];
    }>(endpoint, { query, page: '1' });

    // Filter out movies that already exist in our database
    const tmdbMovies: TMDBMovie[] = tmdbData.results?.slice(0, TMDB_RESULTS_LIMIT) || [];
      
      if (tmdbMovies.length > 0) {
        // Check which TMDB movies already exist in our database
        const tmdbIds = tmdbMovies.map(movie => movie.id);
        logger.info('API /search: Checking for existing movies with TMDB IDs:', tmdbIds);
        
        const { data: existingMovies } = await supabaseServerAnon
          .from('movies')
          .select('tmdb_id')
          .in('tmdb_id', tmdbIds);
        
        const existingTmdbIds = new Set(existingMovies?.map((m) => m.tmdb_id) || []);
        logger.info('API /search: Found existing TMDB IDs in database:', Array.from(existingTmdbIds));
        
        // Filter out movies that already exist
        const filteredTmdbMovies = tmdbMovies.filter(movie => !existingTmdbIds.has(movie.id));
        logger.info('API /search: After filtering duplicates, returning', filteredTmdbMovies.length, 'TMDB movies');
        
        // Add full poster URLs
        const tmdbResults = filteredTmdbMovies.map(movie => ({
          ...movie,
          poster_path: TMDB_CONFIG.buildImageUrl(movie.poster_path)
        }));

        return NextResponse.json(
          createSearchResponse([], tmdbResults, tmdbData.total_pages > 1)
        );
      }

      return NextResponse.json(
        createSearchResponse([], [], false)
      );
  } catch (error) {
    logger.error('Search API error:', error);
    
    return NextResponse.json(
      createSearchResponse([], [], false, 'Search temporarily unavailable', 'SERVER_ERROR'),
      { status: 500 }
    );
  }
}

// TODO: Consider re-introducing rate limiting if external API quotas become an issue.
