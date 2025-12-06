import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Eye, Calendar, Clock, User } from 'lucide-react';
import { supabaseServerAnon } from '@/lib/supabase-server';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

// Generate metadata for SEO
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { data: post } = await supabaseServerAnon
    .from('public_blog_posts_view')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (!post) {
    return {
      title: 'Blog Post Not Found',
    };
  }

  return {
    title: post.title,
    description: post.meta_description || post.overview,
    openGraph: {
      title: post.title,
      description: post.meta_description || post.overview,
      images: post.poster_url ? [post.poster_url] : [],
      type: 'article',
      publishedTime: post.published_at,
      modifiedTime: post.updated_at,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.meta_description || post.overview,
      images: post.poster_url ? [post.poster_url] : [],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  // Fetch the blog post
  const { data: post, error } = await supabaseServerAnon
    .from('public_blog_posts_view')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (error || !post) {
    notFound();
  }

  // Increment view count (fire and forget)
  supabaseServerAnon
    .from('movie_blog_posts')
    .update({ view_count: post.view_count + 1 })
    .eq('slug', params.slug)
    .then(() => {});

  // Fetch tags for this movie/user combination
  const { data: tags } = await supabaseServerAnon
    .from('user_movie_tags')
    .select('tag_id, tags(id, name, color)')
    .eq('user_id', post.user_id)
    .eq('movie_id', post.movie_id);

  const movieTags = tags?.map(t => (t.tags as any)).filter(Boolean) || [];

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatRuntime = (minutes: number | null) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Schema.org structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.meta_description || post.overview,
            image: post.poster_url,
            datePublished: post.published_at,
            dateModified: post.updated_at,
            author: {
              '@type': 'Person',
              name: post.full_name || post.user_name,
            },
            about: {
              '@type': 'Movie',
              name: post.movie_title,
              director: post.director,
              datePublished: post.release_date,
              genre: post.genre,
            },
          }),
        }}
      />

      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Article Header */}
          <div className="p-8 border-b border-gray-200">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.movie_title}</h1>
            
            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
              {post.release_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(post.release_date).getFullYear()}</span>
                </div>
              )}
              {post.runtime_minutes && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatRuntime(post.runtime_minutes)}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{post.view_count} views</span>
              </div>
            </div>

            {/* Author */}
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">
                  Curated by <span className="font-medium text-gray-900">{post.full_name || post.user_name}</span>
                </p>
                {post.published_at && (
                  <p className="text-xs text-gray-500">
                    Published on {formatDate(post.published_at)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Movie Poster */}
          {post.poster_url && (
            <div className="relative w-full aspect-[16/9] bg-gray-100">
              <Image
                src={post.poster_url}
                alt={`${post.movie_title} poster`}
                fill
                className="object-contain"
                priority
              />
            </div>
          )}

          {/* Content */}
          <div className="p-8">
            {/* Director & Genre */}
            {(post.director || post.genre) && (
              <div className="mb-6 pb-6 border-b border-gray-200">
                {post.director && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Directed by:</span> {post.director}
                  </p>
                )}
                {post.genre && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Genre:</span> {post.genre}
                  </p>
                )}
              </div>
            )}

            {/* Overview */}
            {post.overview && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Overview</h2>
                <p className="text-gray-700 leading-relaxed">{post.overview}</p>
              </div>
            )}

            {/* Tags */}
            {movieTags.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {movieTags.map((tag) => (
                    <Link
                      key={tag.id}
                      href={`/tags/${tag.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                      className="px-3 py-1 rounded-full text-sm font-medium transition-colors"
                      style={{
                        backgroundColor: `${tag.color}20`,
                        color: tag.color,
                        borderWidth: '1px',
                        borderColor: tag.color,
                      }}
                    >
                      {tag.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* External Links */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">External Links</h2>
              <div className="flex flex-wrap gap-3">
                {post.tmdb_id && (
                  <a
                    href={`https://www.themoviedb.org/movie/${post.tmdb_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm font-medium"
                  >
                    TMDB
                  </a>
                )}
                {post.imdb_id && (
                  <a
                    href={`https://www.imdb.com/title/${post.imdb_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors text-sm font-medium"
                  >
                    IMDb
                  </a>
                )}
                {post.imdb_id && (
                  <a
                    href={`https://www.metacritic.com/search/${encodeURIComponent(post.movie_title)}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    Metacritic
                  </a>
                )}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 italic">
                This post is a personal curation and may contain subjective opinions.
              </p>
            </div>
          </div>
        </article>

        {/* Related Posts Section (placeholder for future) */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            More posts by {post.full_name || post.user_name}
          </h2>
          <p className="text-gray-600">Coming soon...</p>
        </div>
      </main>
    </div>
  );
}

