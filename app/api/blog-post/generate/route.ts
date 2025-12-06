import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { logger } from '@/lib/logger';

interface GenerateBlogPostRequest {
  movieId: number;
  isPublic?: boolean;
}

/**
 * Generates a slug for the blog post
 * Format: movie-title-year-username
 */
function generateSlug(movieTitle: string, releaseYear: string, username: string): string {
  const cleanTitle = movieTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  const cleanUsername = username
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  return `${cleanTitle}-${releaseYear}-${cleanUsername}`;
}

/**
 * Generates external movie links
 */
function generateExternalLinks(tmdbId: number | null, imdbId: string | null) {
  return {
    tmdb: tmdbId ? `https://www.themoviedb.org/movie/${tmdbId}` : null,
    imdb: imdbId ? `https://www.imdb.com/title/${imdbId}` : null,
    metacritic: imdbId 
      ? `https://www.metacritic.com/movie/${imdbId.replace('tt', '')}` 
      : null,
    rottenTomatoes: null // RT doesn't have a predictable URL structure
  };
}

/**
 * Generates HTML content for the blog post
 */
function generateBlogContent(data: {
  movie: any;
  tags: any[];
  categories: any[];
  userNote: string | null;
  userName: string;
  fullName: string;
  externalLinks: any;
}): { html: string; metaDescription: string } {
  const { movie, tags, categories, userNote, userName, fullName, externalLinks } = data;
  
  const year = movie.release_date 
    ? new Date(movie.release_date).getFullYear() 
    : 'N/A';
  
  const runtime = movie.runtime_minutes 
    ? `${Math.floor(movie.runtime_minutes / 60)}h ${movie.runtime_minutes % 60}m`
    : 'N/A';

  // Generate meta description (for SEO)
  // Priority: User note (natural language) > Overview > Basic info
  const tagNames = tags.map(t => t.name).join(', ');
  const categoryNames = categories.map(c => c.name).join(', ');
  
  // Build tags and categories phrase
  const buildMetaPhrase = () => {
    const parts: string[] = [];
    if (categoryNames) parts.push(`Category: ${categoryNames}`);
    if (tagNames) parts.push(`Tags: ${tagNames}`);
    return parts.length > 0 ? ` ${parts.join('. ')}.` : '';
  };
  
  let metaDescription: string;
  
  if (userNote && userNote.trim().length > 20) {
    // Use user's note as primary - most natural language for SEO
    // Include category for context
    const categoryPrefix = categoryNames ? `[${categoryNames}] ` : '';
    const noteExcerpt = userNote.trim().substring(0, 100);
    metaDescription = `${movie.title} (${year}): ${categoryPrefix}${noteExcerpt}${userNote.length > 100 ? '...' : ''}`;
  } else if (movie.overview) {
    // Fall back to movie overview with tags and categories
    const metaPhrase = buildMetaPhrase();
    metaDescription = `${movie.title} (${year}) -${metaPhrase} ${movie.overview.substring(0, 80)}...`;
  } else {
    // Basic fallback with categories and tags
    const metaPhrase = buildMetaPhrase();
    metaDescription = `${movie.title} (${year})${movie.director ? ` directed by ${movie.director}` : ''}.${metaPhrase} Curated by ${fullName}.`;
  }

  // Generate HTML content
  const html = `
<article class="blog-post">
  <header class="blog-post-header">
    <h1>${movie.title}</h1>
    <div class="movie-metadata">
      <span class="year">${year}</span>
      ${movie.director ? `<span class="director">Directed by ${movie.director}</span>` : ''}
      ${movie.runtime_minutes ? `<span class="runtime">${runtime}</span>` : ''}
      ${movie.genre ? `<span class="genre">${movie.genre}</span>` : ''}
    </div>
    <div class="author">
      <p>Curated by ${fullName} (@${userName})</p>
    </div>
  </header>

  ${movie.poster_url ? `
  <div class="movie-poster">
    <img src="${movie.poster_url}" alt="${movie.title} poster" />
  </div>
  ` : ''}

  ${movie.overview ? `
  <section class="overview">
    <h2>Overview</h2>
    <p>${movie.overview}</p>
  </section>
  ` : ''}

  ${tags.length > 0 ? `
  <section class="tags">
    <h2>Tags</h2>
    <div class="tag-list">
      ${tags.map(tag => `
        <a href="/tags/${tag.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}" 
           class="tag" 
           style="background-color: ${tag.color}20; color: ${tag.color}; border-color: ${tag.color}">
          ${tag.name}
        </a>
      `).join('')}
    </div>
  </section>
  ` : ''}

  ${categories.length > 0 ? `
  <section class="categories">
    <h2>Categories</h2>
    <div class="category-list">
      ${categories.map(cat => `
        <span class="category" style="background-color: ${cat.color}20; color: ${cat.color}">
          ${cat.name}
        </span>
      `).join('')}
    </div>
  </section>
  ` : ''}

  ${userNote ? `
  <section class="user-review">
    <h2>${fullName}'s Review</h2>
    <blockquote>
      ${userNote}
    </blockquote>
  </section>
  ` : ''}

  <section class="external-links">
    <h2>External Links</h2>
    <div class="link-list">
      ${externalLinks.tmdb ? `<a href="${externalLinks.tmdb}" target="_blank" rel="noopener noreferrer" class="external-link">TMDB</a>` : ''}
      ${externalLinks.imdb ? `<a href="${externalLinks.imdb}" target="_blank" rel="noopener noreferrer" class="external-link">IMDb</a>` : ''}
      ${externalLinks.metacritic ? `<a href="${externalLinks.metacritic}" target="_blank" rel="noopener noreferrer" class="external-link">Metacritic</a>` : ''}
      ${externalLinks.rottenTomatoes ? `<a href="${externalLinks.rottenTomatoes}" target="_blank" rel="noopener noreferrer" class="external-link">Rotten Tomatoes</a>` : ''}
    </div>
  </section>

  <footer class="blog-post-footer">
    <p class="disclaimer">This post is a personal curation and may contain subjective opinions.</p>
  </footer>
</article>
  `.trim();

  return { html, metaDescription: metaDescription.substring(0, 160) };
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: GenerateBlogPostRequest = await request.json();
    const { movieId, isPublic = true } = body;

    if (!movieId) {
      return NextResponse.json(
        { success: false, error: 'Movie ID is required' },
        { status: 400 }
      );
    }

    logger.info(`Generating blog post for movie ${movieId}, user ${user.id}`);

    // 1. Fetch movie data
    const { data: movie, error: movieError } = await supabase
      .from('movies')
      .select('*')
      .eq('id', movieId)
      .single();

    if (movieError || !movie) {
      logger.error('Movie not found:', movieError);
      return NextResponse.json(
        { success: false, error: 'Movie not found' },
        { status: 404 }
      );
    }

    // 2. Fetch user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_name, full_name, avatar_url')
      .eq('id', user.id)
      .single();

    const userName = profile?.user_name || user.email?.split('@')[0] || 'anonymous';
    const fullName = profile?.full_name || userName;

    // 3. Fetch user's tags for this movie
    const { data: userTags } = await supabase
      .from('user_movie_tags')
      .select('tag_id, tags(id, name, color)')
      .eq('user_id', user.id)
      .eq('movie_id', movieId);

    const tags = userTags?.map(ut => (ut.tags as any)).filter(Boolean) || [];

    // 4. Fetch user's categories for this movie
    const { data: userCategories } = await supabase
      .from('user_movie_categories')
      .select('category_id, categories(id, name, color)')
      .eq('user_id', user.id)
      .eq('movie_id', movieId);

    const categories = userCategories?.map(uc => (uc.categories as any)).filter(Boolean) || [];

    // 5. Fetch user's note
    const { data: noteData } = await supabase
      .from('user_notes')
      .select('content')
      .eq('user_id', user.id)
      .eq('movie_id', movieId)
      .single();

    const userNote = noteData?.content || null;

    // 6. Generate slug
    const releaseYear = movie.release_date 
      ? new Date(movie.release_date).getFullYear().toString() 
      : 'unknown';
    const slug = generateSlug(movie.title, releaseYear, userName);

    // 7. Generate external links
    const externalLinks = generateExternalLinks(movie.tmdb_id, movie.imdb_id);

    // 8. Generate blog content
    const { html, metaDescription } = generateBlogContent({
      movie,
      tags,
      categories,
      userNote,
      userName,
      fullName,
      externalLinks
    });

    const title = `${movie.title} (${releaseYear}) - ${tags.map(t => t.name).join(', ') || 'Movie Review'}`;

    // 9. Upsert blog post
    const { data: blogPost, error: upsertError } = await supabase
      .from('movie_blog_posts')
      .upsert({
        user_id: user.id,
        movie_id: movieId,
        slug,
        title,
        content: html,
        meta_description: metaDescription,
        is_public: isPublic,
        admin_approved: true, // Auto-approved by default, admin can set to false to hide
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,movie_id'
      })
      .select()
      .single();

    if (upsertError) {
      logger.error('Error upserting blog post:', upsertError);
      return NextResponse.json(
        { success: false, error: 'Failed to create blog post' },
        { status: 500 }
      );
    }

    logger.info(`Blog post generated successfully: ${slug}`);

    return NextResponse.json({
      success: true,
      blogPost,
      message: 'Blog post generated successfully'
    });

  } catch (error) {
    logger.error('Error generating blog post:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

