# Blog Post Feature - MVP Phase 1

## Overview

The Blog Post feature automatically generates SEO-friendly blog posts for movies added to your library. These posts are designed to help movie industry professionals discover content through tag-based browsing and natural language search.

### Tag Strategy: General Tags + Specific Notes

The system uses **general tags** (e.g., `character`, `dialogue`, `plot`) combined with **specific user notes** that provide natural language context for SEO:

| Element | Example | Purpose |
|---------|---------|---------|
| **Tag** | `character` | Category for browsing `/tags/character` |
| **User Note** | "The character development is exceptional..." | Natural language for search SEO |

This approach allows:
- **Simple tag management** - Fewer tags to maintain
- **Flexible opinions** - Same tag, different perspectives per user
- **Better SEO** - User notes match natural search queries like "movie with good character"

## Features Implemented

### ✅ Core Features
- **Automatic Blog Post Generation**: Posts are created when movies are added
- **Tag-Based Discovery**: `/tags/[tag-name]` pages list all movies with specific tags
- **Individual Movie Posts**: `/blog/[movie-slug]` pages with comprehensive movie information
- **Privacy Controls**: User-level privacy settings (public/private) with admin approval workflow
- **SEO Optimization**: 
  - Meta tags and OpenGraph data
  - Schema.org structured data
  - Dynamic sitemap generation
  - robots.txt configuration
- **External Links**: TMDB, IMDb, Metacritic integration

### 📊 Database Schema

**New Table: `movie_blog_posts`**
```sql
- id: Primary key
- user_id: User who created the post
- movie_id: Referenced movie
- slug: URL-friendly identifier (e.g., "inception-2010-johndoe")
- title: SEO-optimized title
- content: Generated HTML content
- meta_description: SEO description (160 chars)
- is_public: User privacy setting
- admin_approved: Admin approval flag
- view_count: Page views
- published_at: First publication timestamp
- created_at/updated_at: Timestamps
```

**View: `public_blog_posts_view`**
- Aggregates blog posts with movie and user data
- Only includes public and admin-approved posts

## Setup Instructions

### 1. Database Migration

Run the following SQL in your Supabase SQL Editor:

```bash
# In your Supabase project SQL Editor, run:
database/blog-posts-schema.sql
```

This will create:
- `movie_blog_posts` table
- Row Level Security (RLS) policies
- Helper functions and triggers
- `public_blog_posts_view` view
- Performance indexes

### 2. Environment Variables

Add to your `.env.local`:

```env
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

This is used for:
- Sitemap generation
- OpenGraph URLs
- Canonical URLs

### 3. Install Dependencies

Ensure you have the required packages:

```bash
npm install @supabase/ssr lucide-react
```

## How It Works

### Automatic Blog Post Generation Flow

1. **User adds a movie from TMDB** (via search page)
2. **Movie is saved to database** (via `/api/add-movie`)
3. **Movie is enriched** with TMDB data (director, genre, runtime)
4. **Blog post is generated** automatically in the background
5. **User adds tags/categories** to the movie
6. **Blog post is updated** with new tags/categories

### Blog Post Content Includes

- Movie title + metadata (year, director, runtime, genre)
- Movie poster
- Overview/description
- User's personal tags (clickable, link to tag pages)
- User's categories
- User's note/review (if added)
- External links:
  - TMDB
  - IMDb
  - Metacritic
  - Rotten Tomatoes (when available)

### Privacy & Approval Workflow

1. **Private by default**: New blog posts are private
2. **User makes public**: User toggles privacy via `BlogPostPrivacyToggle` component
3. **Admin approves**: Admin reviews and approves via admin dashboard
4. **Public visibility**: Post appears in:
   - `/blog/[slug]` - Direct link
   - `/tags/[tag-name]` - Tag listing pages
   - `/sitemap.xml` - Search engine indexing

## Usage

### For Users

#### Viewing Your Blog Posts

Blog posts are generated automatically when you add movies. To manage them:

1. Add a movie from the search page
2. Add tags and categories to the movie
3. Optionally add a personal note/review
4. Use the `BlogPostPrivacyToggle` component to make it public

#### Privacy Toggle Component

```tsx
import BlogPostPrivacyToggle from '@/components/BlogPostPrivacyToggle';

<BlogPostPrivacyToggle 
  movieId={123}
  movieTitle="Inception"
  onUpdate={(isPublic) => console.log('Privacy updated:', isPublic)}
/>
```

### Writing Effective Notes for SEO

User notes are the **primary source for meta descriptions** and appear in search results. Write notes that match how people search:

#### ❌ Less Effective Notes:
```
"Good character"
"Bad dialogue"
"Nice plot"
```

#### ✅ More Effective Notes:
```
"The character development in this film is exceptional. Each character 
has a distinct voice and compelling motivation that drives the story."

"The dialogue felt wooden and unnatural throughout. Characters often 
explained things they would already know, breaking immersion."

"The plot twist in the third act completely redefines everything you 
thought you knew about the story. Masterfully executed."
```

#### Why This Matters:

| User Searches | Matches Note |
|---------------|--------------|
| "movie with good character development" | "character development is exceptional" |
| "film with bad dialogue" | "dialogue felt wooden and unnatural" |
| "movie with plot twist" | "plot twist in the third act" |

**Tip:** Write notes as if explaining to a friend why you tagged the movie that way.

### For Developers

#### Manually Trigger Blog Post Generation

```tsx
import { useBlogPostGeneration } from '@/hooks/useBlogPostGeneration';

function MyComponent() {
  const { generateBlogPost, generating } = useBlogPostGeneration();

  const handleGenerate = async () => {
    const result = await generateBlogPost(movieId, isPublic);
    if (result.success) {
      console.log('Blog post created:', result.blogPost);
    }
  };

  return (
    <button onClick={handleGenerate} disabled={generating}>
      Generate Blog Post
    </button>
  );
}
```

#### Manually Trigger Blog Post Update

When tags or categories are updated, regenerate the blog post:

```tsx
const { regenerateBlogPost } = useBlogPostGeneration();

// After updating tags
await regenerateBlogPost(movieId);
```

## API Endpoints

### POST `/api/blog-post/generate`

Generates or updates a blog post for a movie.

**Request:**
```json
{
  "movieId": 123,
  "isPublic": false
}
```

**Response:**
```json
{
  "success": true,
  "blogPost": {
    "id": 1,
    "slug": "inception-2010-johndoe",
    "title": "Inception (2010) - Mind-Bending, Great Characters",
    "is_public": false,
    "admin_approved": false
  },
  "message": "Blog post generated successfully"
}
```

## SEO Features

### Meta Description Priority

The meta description is generated with the following priority for optimal SEO:

| Priority | Source | When Used | Example |
|----------|--------|-----------|---------|
| **1st** | User Note | If note > 20 chars | "Inception (2010): [Sci-Fi] The character development is exceptional..." |
| **2nd** | Movie Overview | If no note | "Inception (2010) - Category: Sci-Fi. Tags: character. A thief who..." |
| **3rd** | Basic Info | Fallback | "Inception (2010) directed by Christopher Nolan. Category: Sci-Fi. Tags: character." |

**Categories and tags are included** to provide context for search engines and users.

**Why user notes first?** They contain natural language that matches how people search (e.g., "movie with good character development").

### Meta Tags

Each blog post includes:
- Title tag (optimized for search)
- Meta description (160 chars, prioritizes user notes)
- OpenGraph tags (for social sharing)
- Twitter Card tags

### Schema.org Structured Data

Blog posts include:
- `BlogPosting` schema
- `Movie` schema (for the featured movie)
- `Person` schema (for the author)

### Sitemap

Dynamic sitemap at `/sitemap.xml` includes:
- Homepage
- Search page
- All public blog posts
- All tag pages

Regenerates every hour automatically.

### robots.txt

Located at `/robots.txt`:
- Allows all search engines
- Blocks `/api/` and `/admin/`
- Points to sitemap

## URL Structure

```
/blog/[slug]          - Individual blog post
  Example: /blog/inception-2010-johndoe

/tags/[tag-name]      - Tag listing page
  Example: /tags/character
  Example: /tags/dialogue
  Example: /tags/cinematography

/sitemap.xml          - Dynamic sitemap
/robots.txt           - Robots configuration
```

## Admin Functionality (To Be Implemented)

The following admin features are planned for Phase 2:

- **Blog Post Approval Dashboard**
  - View all pending blog posts
  - Approve/reject with one click
  - Bulk approval
  
- **Blog Post Management**
  - Edit blog post content
  - Override privacy settings
  - Delete blog posts
  
- **Analytics**
  - View count per post
  - Popular tags
  - Top contributors

## Integration Points

### Existing Features

The blog post feature integrates with:
- **Search**: Movie addition triggers blog post generation
- **Tags System**: Tags appear on blog posts and tag pages
- **Categories**: Categories appear on blog posts
- **User Notes**: Notes appear as reviews on blog posts

### Future Enhancements (Phase 2+)

- AI-generated movie reviews/summaries
- Related movies section
- Comments system
- Social sharing buttons
- User profiles (`/users/[username]`)
- Trending movies page
- Tag-based recommendations

## Performance Considerations

- Blog posts are generated asynchronously (fire-and-forget)
- Sitemap regenerates every hour (cached)
- Public blog posts use a database view for optimal query performance
- Indexes on frequently queried fields

## Security

- **RLS Policies**: Users can only modify their own blog posts
- **Public View**: Only approved public posts are visible
- **Admin Approval**: Required for public visibility
- **XSS Protection**: HTML content is sanitized

## Troubleshooting

### Blog post not generating

Check:
1. User is authenticated
2. Movie exists in database
3. API route logs for errors
4. Browser console for client-side errors

### Blog post not appearing on tag page

Check:
1. Blog post is marked as `is_public: true`
2. Blog post is `admin_approved: true`
3. User has tagged the movie with that specific tag
4. Tag name matches exactly (case-insensitive)

### Sitemap not updating

- Sitemap revalidates every hour
- Force regeneration by restarting the dev server
- Check `NEXT_PUBLIC_SITE_URL` is set correctly

## Testing Checklist

- [ ] Add a movie from TMDB
- [ ] Verify blog post is created (private)
- [ ] Add tags to the movie
- [ ] Verify blog post is updated with tags
- [ ] Toggle privacy to public
- [ ] Admin approves blog post
- [ ] Verify blog post appears on tag page
- [ ] Verify blog post appears in sitemap
- [ ] Test SEO meta tags (view page source)
- [ ] Test social sharing (OpenGraph)

## Support

For issues or questions:
1. Check the logs in browser console and server logs
2. Verify database schema is up to date
3. Ensure all environment variables are set
4. Review this documentation

---

**Status**: MVP Phase 1 Complete ✅
**Next Steps**: Implement admin dashboard for blog post approval

