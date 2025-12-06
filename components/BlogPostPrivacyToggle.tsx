'use client'

import { useState, useEffect } from 'react';
import { Globe, Lock, Loader2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@/contexts/auth-context';
import { Database } from '@/types/database';

type BlogPost = Database['public']['Tables']['movie_blog_posts']['Row'];

// Create untyped client to avoid TS issues with newly added tables
// TODO: Run `supabase gen types typescript` to regenerate full types
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface BlogPostPrivacyToggleProps {
  movieId: number;
  movieTitle: string;
  onUpdate?: (isPublic: boolean) => void;
}

export default function BlogPostPrivacyToggle({ 
  movieId, 
  movieTitle,
  onUpdate 
}: BlogPostPrivacyToggleProps) {
  const { user } = useAuth();
  const [blogPost, setBlogPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchBlogPost();
    }
  }, [user, movieId]);

  const fetchBlogPost = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('movie_blog_posts')
        .select('*')
        .eq('user_id', user.id)
        .eq('movie_id', movieId)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') { // Not found error is expected
          console.error('Error fetching blog post:', error);
        }
        setBlogPost(null);
      } else {
        setBlogPost(data as BlogPost);
      }
    } catch (error) {
      console.error('Error fetching blog post:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePrivacy = async () => {
    if (!user || !blogPost) return;

    setUpdating(true);
    try {
      const newIsPublic = !blogPost.is_public;

      const { error } = await supabase
        .from('movie_blog_posts')
        .update({ is_public: newIsPublic, updated_at: new Date().toISOString() })
        .eq('id', blogPost.id);

      if (error) {
        console.error('Error updating privacy:', error);
        alert('Failed to update privacy setting');
        return;
      }

      setBlogPost({ ...blogPost, is_public: newIsPublic });
      onUpdate?.(newIsPublic);
      
    } catch (error) {
      console.error('Error updating privacy:', error);
      alert('Failed to update privacy setting');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-500 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Loading...</span>
      </div>
    );
  }

  if (!blogPost) {
    return (
      <div className="text-sm text-gray-500 italic">
        No blog post created yet. Add tags to generate a blog post.
      </div>
    );
  }

  const isPublic = blogPost.is_public;
  const isApproved = blogPost.admin_approved;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            Blog Post Privacy
          </h3>
          
          <div className="flex items-center gap-2 mb-3">
            {isPublic ? (
              <Globe className="w-4 h-4 text-green-600" />
            ) : (
              <Lock className="w-4 h-4 text-gray-600" />
            )}
            <span className={`text-sm font-medium ${isPublic ? 'text-green-600' : 'text-gray-600'}`}>
              {isPublic ? 'Public' : 'Private'}
            </span>
          </div>

          <p className="text-xs text-gray-500 mb-3">
            {isPublic ? (
              isApproved ? (
                <>Your blog post is public and approved. It appears in search results and tag pages.</>
              ) : (
                <>Your blog post is set to public but pending admin approval.</>
              )
            ) : (
              <>Your blog post is private. Only you can see it.</>
            )}
          </p>

          {blogPost.slug && (
            <a
              href={`/blog/${blogPost.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline"
            >
              View blog post →
            </a>
          )}
        </div>

        <button
          onClick={togglePrivacy}
          disabled={updating}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 ${
            isPublic
              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {updating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isPublic ? (
            'Make Private'
          ) : (
            'Make Public'
          )}
        </button>
      </div>
    </div>
  );
}

