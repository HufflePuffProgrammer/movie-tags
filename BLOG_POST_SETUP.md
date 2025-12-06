# Blog Post Feature - Quick Setup Guide

## 🚀 Quick Start (5 minutes)

### Step 1: Run Database Migration

1. Open your **Supabase SQL Editor**
2. Copy and paste the contents of `database/blog-posts-schema.sql`
3. Click **Run**
4. Verify tables were created successfully

### Step 2: Add Environment Variable

Add to your `.env.local`:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # Change to your domain in production
```

### Step 3: Restart Dev Server

```bash
npm run dev
```

## ✅ Verification

### Test the Feature

1. **Add a movie**:
   - Go to `/search`
   - Search for a movie (e.g., "Inception")
   - Click "Add to Library"
   - ✅ Blog post is generated automatically (private by default)

2. **Add tags**:
   - Add tags to your movie
   - ✅ Blog post is updated with tags

3. **Make it public**:
   - Use the `BlogPostPrivacyToggle` component
   - Toggle to "Make Public"
   - ✅ Post is now public (pending admin approval)

4. **Admin approval** (manual for now):
   - In Supabase, go to Table Editor → `movie_blog_posts`
   - Find your blog post
   - Set `admin_approved` to `true`
   - ✅ Post is now visible on tag pages

5. **View blog post**:
   - Visit `/blog/[your-movie-slug]`
   - ✅ See your complete blog post with tags and links

6. **View tag page**:
   - Visit `/tags/[tag-name]` (e.g., `/tags/sci-fi`)
   - ✅ See all movies with that tag

7. **Check sitemap**:
   - Visit `/sitemap.xml`
   - ✅ See all your public blog posts listed

## 📁 Files Created

### Database
- `database/blog-posts-schema.sql` - Complete schema

### Types
- `types/blog.ts` - TypeScript types for blog posts

### API Routes
- `app/api/blog-post/generate/route.ts` - Blog post generation

### Pages
- `app/blog/[slug]/page.tsx` - Individual blog post page
- `app/tags/[tagName]/page.tsx` - Tag listing page
- `app/sitemap.ts` - Dynamic sitemap
- `app/robots.ts` - Robots.txt

### Components
- `components/BlogPostPrivacyToggle.tsx` - Privacy toggle UI

### Hooks
- `hooks/useBlogPostGeneration.ts` - Blog generation hook

### Documentation
- `docs/BLOG_POST_FEATURE.md` - Complete documentation

## 🎯 Key Features

✅ **Automatic Generation**: Blog posts created when movies are added
✅ **Tag-Based Discovery**: Browse movies by tags
✅ **SEO Optimized**: Meta tags prioritize user notes for natural language
✅ **Privacy Controls**: User-level privacy + admin approval
✅ **External Links**: TMDB, IMDb, Metacritic
✅ **Responsive Design**: Mobile-friendly layouts

## 🏷️ Tag Strategy

Use **general tags** with **specific notes** for best SEO:

| Element | Example |
|---------|---------|
| **Tag** | `character` (general category) |
| **Note** | "The character development is exceptional..." (specific, natural language) |

### Recommended Tags:
- `character`, `dialogue`, `plot`, `cinematography`, `music`, `pacing`

### Writing Good Notes:
```
❌ "Good character"
✅ "The character development is exceptional. Each character has a 
    distinct voice and compelling motivation."
```

**Why?** Notes become the meta description, matching searches like "movie with good character development".

## 📝 Common Tasks

### Manually Generate a Blog Post

```tsx
import { useBlogPostGeneration } from '@/hooks/useBlogPostGeneration';

const { generateBlogPost } = useBlogPostGeneration();
await generateBlogPost(movieId, isPublic);
```

### Add Privacy Toggle to a Page

```tsx
import BlogPostPrivacyToggle from '@/components/BlogPostPrivacyToggle';

<BlogPostPrivacyToggle 
  movieId={movie.id}
  movieTitle={movie.title}
  onUpdate={(isPublic) => console.log('Updated:', isPublic)}
/>
```

### Update Blog Post When Tags Change

```tsx
const { regenerateBlogPost } = useBlogPostGeneration();

// After updating tags
await regenerateBlogPost(movieId);
```

## 🔧 Troubleshooting

### Blog post not creating?

**Check:**
- User is logged in
- Movie exists in database
- Check browser console for errors
- Check server logs: `console.log` in `/api/blog-post/generate/route.ts`

### Blog post not showing on tag page?

**Check:**
- Is `is_public: true`?
- Is `admin_approved: true`?
- Does the movie have that tag?
- Check tag name spelling

### External links not working?

**Check:**
- Does movie have `tmdb_id`?
- Does movie have `imdb_id`?
- Links are generated based on these IDs

## 🎨 Customization

### Change Blog Post Template

Edit: `app/api/blog-post/generate/route.ts`
Function: `generateBlogContent()`

### Change Tag Page Layout

Edit: `app/tags/[tagName]/page.tsx`

### Change Blog Post Page Layout

Edit: `app/blog/[slug]/page.tsx`

### Add More External Links

Edit: `app/api/blog-post/generate/route.ts`
Function: `generateExternalLinks()`

## 📊 Database Access

### View All Blog Posts

```sql
SELECT * FROM movie_blog_posts;
```

### View Public Blog Posts

```sql
SELECT * FROM public_blog_posts_view;
```

### Approve All Blog Posts (Dev Only)

```sql
UPDATE movie_blog_posts 
SET admin_approved = true 
WHERE is_public = true;
```

## 🚀 Next Steps

### Phase 2 Features (Planned)

- [ ] Admin dashboard for blog post approval
- [ ] Bulk approval system
- [ ] Analytics dashboard
- [ ] Related movies section
- [ ] Comments system
- [ ] User profiles
- [ ] AI-generated summaries

## 📚 Learn More

- [Complete Documentation](docs/BLOG_POST_FEATURE.md)
- [Database Schema](database/blog-posts-schema.sql)
- [TypeScript Types](types/blog.ts)

---

**Need help?** Check the complete documentation or review the implementation files.

