import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Film, Tag as TagIcon } from 'lucide-react';
import { supabaseServerAnon } from '@/lib/supabase-server';
import { PublicBlogPost } from '@/types/blog';

interface TagPageProps {
  params: {
    tagName: string;
  };
}

// Generate metadata for SEO
export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const tagName = decodeURIComponent(params.tagName).replace(/-/g, ' ');
  
  return {
    title: `Movies Tagged: ${tagName}`,
    description: `Browse movies tagged with "${tagName}". Discover curated collections from industry professionals.`,
    openGraph: {
      title: `Movies Tagged: ${tagName}`,
      description: `Browse movies tagged with "${tagName}". Discover curated collections from industry professionals.`,
      type: 'website',
    },
  };
}

export default async function TagPage({ params }: TagPageProps) {
  // Convert URL slug back to tag name (e.g., "good-character" -> "good character")
  const tagSlug = decodeURIComponent(params.tagName);
  
  // First, find the tag by name (case-insensitive)
  const { data: tag, error: tagError } = await supabaseServerAnon
    .from('tags')
    .select('id, name, description, color')
    .ilike('name', tagSlug.replace(/-/g, ' '))
    .single();

  if (tagError || !tag) {
    notFound();
  }

  // Find all user_movie_tags entries for this tag
  const { data: userMovieTags } = await supabaseServerAnon
    .from('user_movie_tags')
    .select('user_id, movie_id')
    .eq('tag_id', tag.id);

  if (!userMovieTags || userMovieTags.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <TagIcon 
                className="w-8 h-8" 
                style={{ color: tag.color }}
              />
              <h1 className="text-4xl font-bold text-gray-900">{tag.name}</h1>
            </div>
            {tag.description && (
              <p className="text-lg text-gray-600">{tag.description}</p>
            )}
          </div>

          <div className="text-center py-12">
            <Film className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No movies found</h3>
            <p className="text-gray-600">
              No public blog posts have been tagged with &quot;{tag.name}&quot; yet.
            </p>
          </div>
        </main>
      </div>
    );
  }

  // Get all public blog posts for these movies
  const { data: blogPosts } = await supabaseServerAnon
    .from('public_blog_posts_view')
    .select('*')
    .in('movie_id', userMovieTags.map(umt => umt.movie_id))
    .in('user_id', userMovieTags.map(umt => umt.user_id))
    .order('updated_at', { ascending: false });

  const posts = (blogPosts || []) as PublicBlogPost[];

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatRuntime = (minutes: number | null) => {
    if (!minutes) return '';
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
            '@type': 'CollectionPage',
            name: `Movies Tagged: ${tag.name}`,
            description: tag.description || `Movies tagged with "${tag.name}"`,
            numberOfItems: posts.length,
          }),
        }}
      />

      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <TagIcon 
              className="w-8 h-8" 
              style={{ color: tag.color }}
            />
            <h1 className="text-4xl font-bold text-gray-900">{tag.name}</h1>
          </div>
          {tag.description && (
            <p className="text-lg text-gray-600 mb-4">{tag.description}</p>
          )}
          <p className="text-sm text-gray-500">
            {posts.length} {posts.length === 1 ? 'movie' : 'movies'} found
          </p>
        </div>

        {/* Movie Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Movie Poster */}
              {post.poster_url ? (
                <div className="relative aspect-[2/3] bg-gray-100">
                  <Image
                    src={post.poster_url}
                    alt={`${post.movie_title} poster`}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-[2/3] bg-gray-200 flex items-center justify-center">
                  <Film className="w-12 h-12 text-gray-400" />
                </div>
              )}

              {/* Movie Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {post.movie_title}
                </h3>
                
                <div className="text-sm text-gray-600 space-y-1 mb-3">
                  {post.release_date && (
                    <p>Year: {new Date(post.release_date).getFullYear()}</p>
                  )}
                  {post.director && (
                    <p className="line-clamp-1">Director: {post.director}</p>
                  )}
                  {post.runtime_minutes && (
                    <p>Runtime: {formatRuntime(post.runtime_minutes)}</p>
                  )}
                </div>

                {/* Author */}
                <div className="text-xs text-gray-500 border-t border-gray-100 pt-2">
                  <p>By {post.full_name || post.user_name}</p>
                  <p>Updated {formatDate(post.updated_at)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {posts.length === 0 && (
          <div className="text-center py-12">
            <Film className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No movies found</h3>
            <p className="text-gray-600">
              No public blog posts have been tagged with &quot;{tag.name}&quot; yet.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

