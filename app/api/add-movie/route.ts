import { NextRequest, NextResponse } from 'next/server';
import { supabaseServerAnon } from '@/lib/supabase-server';

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tmdbMovie }: { tmdbMovie: TMDBMovieData } = body;

    console.log('➕ API /add-movie: Received request to add movie:', {
      tmdbId: tmdbMovie?.id,
      title: tmdbMovie?.title,
      overview: tmdbMovie?.overview?.substring(0, 100) + '...',
      releaseDate: tmdbMovie?.release_date
    });

    if (!tmdbMovie || !tmdbMovie.id || !tmdbMovie.title) {
      console.log('❌ API /add-movie: Invalid movie data provided');
      return NextResponse.json(
        { error: 'Invalid movie data provided' },
        { status: 400 }
      );
    }

    // Check if movie already exists
    console.log('🔍 API /add-movie: Checking if movie already exists with TMDB ID:', tmdbMovie.id);
    const { data: existingMovie } = await supabaseServerAnon
      .from('movies')
      .select('id, title')
      .eq('tmdb_id', tmdbMovie.id)
      .single();

    if (existingMovie) {
      console.log('❌ API /add-movie: Movie already exists:', existingMovie);
      return NextResponse.json({
        success: false,
        error: 'Movie already exists in database',
        movie: existingMovie
      });
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

    console.log('💾 API /add-movie: Inserting movie data:', movieData);

    // Insert the movie
    const { data: newMovie, error: insertError } = await supabaseServerAnon
      .from('movies')
      .insert([movieData])
      .select()
      .single();

    if (insertError) {
      console.error('❌ API /add-movie: Error inserting movie:', insertError);
      return NextResponse.json(
        { error: 'Failed to add movie to database' },
        { status: 500 }
      );
    }

    console.log('✅ API /add-movie: Movie inserted successfully:', newMovie);

    // Optionally fetch additional movie details from TMDB
    if (process.env.TMDB_API_KEY) {
      try {
        await enrichMovieData(newMovie.id, tmdbMovie.id);
      } catch (error) {
        console.warn('Failed to enrich movie data:', error);
        // Don't fail the request if enrichment fails
      }
    }

    return NextResponse.json({
      success: true,
      message: `"${tmdbMovie.title}" has been added to your library.`,
      movie: newMovie
    });

  } catch (error) {
    console.error('Add movie API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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

    const details = await detailsResponse.json();
    
    // Extract director from credits
    const director = details.credits?.crew?.find(
      (person: any) => person.job === 'Director'
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
    console.warn('Movie enrichment failed:', error);
  }
}
