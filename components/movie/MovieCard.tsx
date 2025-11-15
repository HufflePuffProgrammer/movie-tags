'use client'

import Link from 'next/link';
import Image from 'next/image'
import { Film, Star } from 'lucide-react';
import { Movie } from '@/types/movie';

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  return (
    <Link 
      href={`/movie/${movie.id}`}
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer block"
    >
      <div className="aspect-[2/3] bg-gray-200 relative">
        {movie.poster_url ? (
          <Image 
            src={movie.poster_url} 
            alt={movie.title} 
            width={400}
            height={600}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={`absolute inset-0 flex items-center justify-center text-gray-400 ${movie.poster_url ? 'hidden' : ''}`}>
          <Film className="w-10 h-10" />
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{movie.title}</h3>
        <p className="text-sm text-gray-600 mb-2">
          {movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown'} 
          {movie.genre && ` • ${movie.genre}`}
        </p>
        <div className="flex items-center gap-2">
          <div className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
            NEW
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="text-sm text-gray-600">
              {movie.runtime_minutes ? `${movie.runtime_minutes}min` : 'Runtime TBD'}
            </span>
          </div>
        </div>
        {movie.director && (
          <p className="text-xs text-gray-500 mt-2">Directed by {movie.director}</p>
        )}
      </div>
    </Link>
  );
}

