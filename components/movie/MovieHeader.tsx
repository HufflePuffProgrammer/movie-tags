'use client'

import { Clock, Calendar, Film } from 'lucide-react';
import Image from 'next/image'
import { Movie } from '@/types/movie';

interface MovieHeaderProps {
  movie: Movie;
}

export default function MovieHeader({ movie }: MovieHeaderProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
      <div className="flex flex-col md:flex-row">
        {/* Poster */}
        <div className="md:w-64 flex-shrink-0">
          <div className="aspect-[2/3] bg-gray-200 relative">
            {movie.poster_url ? (
              <Image
                width={400}
                height={600}
                src={movie.poster_url} 
                alt={movie.title} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`absolute inset-0 flex items-center justify-center text-gray-400 ${movie.poster_url ? 'hidden' : ''}`}>
              <Film className="w-16 h-16" />
            </div>
          </div>
        </div>

        {/* Movie Info */}
        <div className="flex-1 p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{movie.title}</h1>
          
          <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-600">
            {movie.release_date && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(movie.release_date).getFullYear()}</span>
              </div>
            )}
            {movie.runtime_minutes && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{movie.runtime_minutes} min</span>
              </div>
            )}
            {movie.genre && (
              <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium">
                {movie.genre}
              </span>
            )}
          </div>

          {movie.director && (
            <p className="text-gray-700 mb-4">
              <span className="font-medium">Director:</span> {movie.director}
            </p>
          )}

          {/* Storyline */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 border-l-4 border-yellow-500 pl-3">
              Storyline
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {movie.description || 'No storyline available.'}
            </p>
          </div>

          {/* Taglines and Genres would go here */}
          <div className="space-y-4">
            <div>
              <span className="font-medium text-gray-700">Taglines:</span>
              <span className="ml-2 text-gray-600">2 Russians, 2 Jews and a Puerto Rican walk into a bar...</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Genres:</span>
              <span className="ml-2 text-gray-600">{movie.genre || 'Not specified'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
