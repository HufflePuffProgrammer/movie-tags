'use client'

import { useState } from 'react';
import { logger } from '@/lib/logger';

export function useBlogPostGeneration() {
  const [generating, setGenerating] = useState(false);

  /**
   * Generates a blog post for a movie
   * This should be called after:
   * 1. A movie is added to the user's library
   * 2. Tags or categories are updated for a movie
   */
  const generateBlogPost = async (movieId: number, isPublic: boolean = false) => {
    setGenerating(true);
    
    try {
      logger.info('Generating blog post for movie:', movieId);
      
      const response = await fetch('/api/blog-post/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movieId,
          isPublic,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        logger.error('Failed to generate blog post:', data.error);
        return { success: false, error: data.error };
      }

      logger.info('Blog post generated successfully:', data.blogPost?.slug);
      return { success: true, blogPost: data.blogPost };
      
    } catch (error) {
      logger.error('Error generating blog post:', error);
      return { success: false, error: 'Failed to generate blog post' };
    } finally {
      setGenerating(false);
    }
  };

  /**
   * Regenerates a blog post (e.g., after tags/categories change)
   */
  const regenerateBlogPost = async (movieId: number) => {
    // Same as generate - the API will update existing post
    return generateBlogPost(movieId);
  };

  return {
    generateBlogPost,
    regenerateBlogPost,
    generating,
  };
}

