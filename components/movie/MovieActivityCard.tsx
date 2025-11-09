'use client'

import Link from 'next/link';
import Image from 'next/image'
import { Calendar, Tag as TagIcon, Bookmark, StickyNote, Film } from 'lucide-react';
import { Database } from '@/types/database';
import { Movie } from '@/types/movie';

type Category = Database['public']['Tables']['categories']['Row'];
type UserMovieCategory = Database['public']['Tables']['user_movie_categories']['Row'];
type Tag = Database['public']['Tables']['tags']['Row'];
type UserMovieTag = Database['public']['Tables']['user_movie_tags']['Row'];
type UserNote = Database['public']['Tables']['user_notes']['Row'];

interface UserCategoryWithDetails extends UserMovieCategory {
  category: Category;
}

interface UserTagWithDetails extends UserMovieTag {
  tag: Tag;
}

interface MovieActivity {
  movie: Movie;
  tags: UserTagWithDetails[];
  categories: UserCategoryWithDetails[];
  notes: UserNote[];
  lastActivity: string;
}

interface MovieActivityCardProps {
  activity: MovieActivity;
}

export default function MovieActivityCard({ activity }: MovieActivityCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex gap-6">
        {/* Movie Poster */}
        <div className="flex-shrink-0">
          <div className="w-24 h-36 bg-gray-200 rounded-md relative">
            {activity.movie.poster_url ? (
              <Image
                src={activity.movie.poster_url}
                alt={activity.movie.title}
                className="w-full h-full object-cover rounded-md"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`absolute inset-0 flex items-center justify-center text-gray-400 rounded-md ${activity.movie.poster_url ? 'hidden' : ''}`}>
              <Film className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Movie Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div>
              <Link 
                href={`/movie/${activity.movie.id}`}
                className="text-xl font-semibold text-gray-900 hover:text-yellow-600"
              >
                {activity.movie.title}
              </Link>
              <p className="text-gray-600 text-sm flex items-center gap-2 mt-1">
                <Calendar className="w-4 h-4" />
                {activity.movie.release_date 
                  ? new Date(activity.movie.release_date).getFullYear() 
                  : 'Unknown'} • {activity.movie.director || 'Unknown Director'}
              </p>
            </div>
            <span className="text-xs text-gray-500">
              Last activity: {new Date(activity.lastActivity).toLocaleDateString()}
            </span>
          </div>

          {/* Tags */}
          {activity.tags.length > 0 && (
            <div className="mb-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <TagIcon className="w-4 h-4" />
                Story Tags ({activity.tags.length})
              </h4>
              <div className="flex flex-wrap gap-1">
                {activity.tags.map((userTag) => (
                  <span
                    key={userTag.id}
                    className="inline-flex items-center px-2 py-1 rounded text-xs font-medium text-white"
                    style={{ backgroundColor: userTag.tag?.color || '#3B82F6' }}
                  >
                    {userTag.tag?.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Categories */}
          {activity.categories.length > 0 && (
            <div className="mb-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <Bookmark className="w-4 h-4" />
                Categories ({activity.categories.length})
              </h4>
              <div className="flex flex-wrap gap-1">
                {activity.categories.map((userCategory) => (
                  <span
                    key={userCategory.id}
                    className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {userCategory.category.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {activity.notes.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <StickyNote className="w-4 h-4" />
                Notes ({activity.notes.length})
              </h4>
              <div className="space-y-2">
                {activity.notes.slice(0, 2).map((note) => (
                  <div key={note.id} className="text-sm text-gray-600 bg-gray-50 rounded p-2">
                    {note.content.length > 150 
                      ? `${note.content.substring(0, 150)}...` 
                      : note.content
                    }
                  </div>
                ))}
                {activity.notes.length > 2 && (
                  <p className="text-xs text-gray-500">
                    +{activity.notes.length - 2} more notes
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

