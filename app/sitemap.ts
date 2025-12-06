import { MetadataRoute } from 'next';
import { supabaseServerAnon } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const sitemap: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];

  try {
    // Fetch all public blog posts
    const { data: blogPosts } = await supabaseServerAnon
      .from('public_blog_posts_view')
      .select('slug, updated_at')
      .order('updated_at', { ascending: false })
      .limit(1000); // Limit to prevent huge sitemaps

    if (blogPosts) {
      blogPosts.forEach((post) => {
        sitemap.push({
          url: `${baseUrl}/blog/${post.slug}`,
          lastModified: new Date(post.updated_at),
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      });
    }

    // Fetch all tags
    const { data: tags } = await supabaseServerAnon
      .from('tags')
      .select('name')
      .order('name');

    if (tags) {
      tags.forEach((tag) => {
        const tagSlug = tag.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        sitemap.push({
          url: `${baseUrl}/tags/${tagSlug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.6,
        });
      });
    }
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }

  return sitemap;
}

