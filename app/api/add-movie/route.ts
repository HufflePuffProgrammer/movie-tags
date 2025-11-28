import { NextRequest, NextResponse } from 'next/server';
import { supabaseServerAnon } from '@/lib/supabase-server';
import { logger } from '@/lib/logger';
import { Movie } from '@/types/movie';

interface TMDBMovieData {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  poster_path: string | null;
  vote_average: number;
  genre_ids: number[];
  runtime?: number;
}

interface AddMovieResponse {
  success: boolean;
  message?: string;
  error?: string;
  movie?: Movie;
  errorCode?: 'INVALID_REQUEST_BODY' | 'INVALID_MOVIE_DATA' | 'TITLE_TOO_LONG' | 'OVERVIEW_TOO_LONG' | 'MOVIE_ALREADY_EXISTS' | 'INTERNAL_SERVER_ERROR';
}

// Helper function
function createAddMovieResponse(
  success: boolean,
  messageOrError?: string,
  errorCode?: AddMovieResponse['errorCode'],
  movie?: Movie
): AddMovieResponse {
  return {
    success,
    ...(success && messageOrError && { message: messageOrError }),
    ...(!success && messageOrError && { error: messageOrError }),
    ...(errorCode && { errorCode }),
    ...(movie && { movie })
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate body exists and is object
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        createAddMovieResponse(false, 'Invalid request body', 'INVALID_REQUEST_BODY'), 
        { status: 400 }
      );
    }
    
    const { tmdbMovie }: { tmdbMovie: TMDBMovieData } = body;

    logger.api('/add-movie', 'Received request to add movie:', {
      tmdbId: tmdbMovie?.id,
      title: tmdbMovie?.title,
      overview: tmdbMovie?.overview?.substring(0, 100) + '...',
      releaseDate: tmdbMovie?.release_date
    });

    // Validate required fields
    if (!tmdbMovie || !tmdbMovie.id || !tmdbMovie.title) {
      return NextResponse.json(
        createAddMovieResponse(false, 'Invalid movie data provided', 'INVALID_MOVIE_DATA'), 
        { status: 400 }
      );
    }

    // Validate string lengths
    if (tmdbMovie.title?.length > 500) {
      return NextResponse.json(
        createAddMovieResponse(false, 'Title too long (max 500 characters)', 'TITLE_TOO_LONG'), 
        { status: 400 }
      );
    }

    if (tmdbMovie.overview?.length > 5000) {
      return NextResponse.json(
        createAddMovieResponse(false, 'Overview too long (max 5000 characters)', 'OVERVIEW_TOO_LONG'), 
        { status: 400 }
      );
    }
    // Check if movie already exists
    logger.info('API /add-movie: Checking if movie already exists with TMDB ID:', tmdbMovie.id);
    const { data: existingMovie } = await supabaseServerAnon
      .from('movies')
      .select('id, title')
      .eq('tmdb_id', tmdbMovie.id)
      .single();

    if (existingMovie) {
      logger.info('API /add-movie: Movie already exists:', existingMovie);
      return NextResponse.json(
        createAddMovieResponse(false, 'Movie already exists in database', 'MOVIE_ALREADY_EXISTS'), 
        { status: 400 }
      );   
    }

    // Prepare movie data for insertion
    const movieData = {
      title: tmdbMovie.title,
      overview: tmdbMovie.overview || null,
      release_date: tmdbMovie.release_date || null,
      poster_url: tmdbMovie.poster_path || null,
      tmdb_id: tmdbMovie.id,
      runtime_minutes: tmdbMovie.runtime || null,
      // We could fetch additional details from TMDB here if needed
    };

    logger.info('API /add-movie: Inserting movie data:', movieData);

    // Insert the movie
    const { data: newMovie, error: insertError } = await supabaseServerAnon
      .from('movies')
      .insert([movieData])
      .select()
      .single();

    if (insertError) {
      logger.error('API /add-movie: Error inserting movie:', insertError);
      return NextResponse.json(
        createAddMovieResponse(false, 'Failed to add movie to database', 'INTERNAL_SERVER_ERROR'), 
        { status: 500 }
      );
    }

    logger.info('API /add-movie: Movie inserted successfully:', newMovie);

    // Enrich in background (don't await) - fire and forget
    if (process.env.TMDB_API_KEY) {
      enrichMovieData(newMovie.id, tmdbMovie.id).catch(error => {
        logger.warn('Failed to enrich movie data:', error);
      });
    }

    // Return response immediately (don't wait for enrichment)
    return NextResponse.json(
      createAddMovieResponse(true, `"${tmdbMovie.title}" has been added to your library.`, undefined, newMovie)
    );
  } catch (error) {
    // Handle JSON parse errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        createAddMovieResponse(false, 'Invalid JSON in request body', 'INVALID_REQUEST_BODY'),
        { status: 400 }
      );
    }
    
    logger.error('Add movie API error:', error);
    return NextResponse.json(
      createAddMovieResponse(false, 'Internal server error', 'INTERNAL_SERVER_ERROR'), 
      { status: 500 }
    );
  }
}

// Helper function to enrich movie data with additional TMDB details
async function enrichMovieData(movieId: number, tmdbId: number) {
  const TMDB_API_KEY = process.env.TMDB_API_KEY;
  const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

  if (!TMDB_API_KEY) return;

  try {
    // Fetch detailed movie information
    const detailsResponse = await fetch(
      `${TMDB_BASE_URL}/movie/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=credits`,
      { signal: AbortSignal.timeout(5000) }
    );

    if (!detailsResponse.ok) return;

    const details: {
      credits?: { crew?: Array<{ job?: string; name?: string }> };
      genres?: Array<{ name?: string }>;
      runtime?: number | null;
      tagline?: string | null;
    } = await detailsResponse.json();
    
    // Extract director from credits
    const director = details.credits?.crew?.find(
      (person) => person.job === 'Director'
    )?.name;

    // Extract primary genre
    const primaryGenre = details.genres?.[0]?.name;

    // Update the movie with enriched data
    await supabaseServerAnon
      .from('movies')
      .update({
        director: director || null,
        genre: primaryGenre || null,
        runtime_minutes: details.runtime || null,
        description: details.tagline || null, // Use tagline as description
      })
      .eq('id', movieId);

  } catch (error) {
    logger.warn('Movie enrichment failed:', error);
  }
}
