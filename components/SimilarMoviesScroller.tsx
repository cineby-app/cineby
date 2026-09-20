"use client";

import { Movie, slugify } from "@/lib/tmdb";
import Image from "next/image";
import Link from "next/link";

export function SimilarMoviesScroller({ movies }: { movies: Movie[] }) {
  return (
    <div className="w-full max-w-7xl mx-auto flex overflow-x-auto gap-6 custom-scrollbar pb-8">
      {movies.map((movie) => {
        const slug = slugify(movie.title, movie.id);
        
        // TMDB gives genre IDs, but if your API object already has a genres array of strings/objects:
        // This safely grabs the first 2 genres if they exist.
        const topGenres = movie.genres?.slice(0, 2) || [];

        return (
          <Link
            href={`/${slug}`}
            key={movie.id}
            className="relative block w-32 md:w-40 aspect-[2/3] shrink-0 rounded-lg overflow-hidden transition-all duration-300 group hover:scale-105 hover:shadow-[0_10px_30px_rgba(220,38,38,0.2)] hover:ring-1 hover:ring-[#BE185D]/50"
          >
            <Image
              src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
              alt={movie.title}
              fill
              loading="lazy"
              sizes="(max-width: 768px) 128px, 160px"
              className="object-cover transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
            
            {/* Cool hover overlay layout */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
              
              {/* Rating Badges */}
              <div className="flex items-center gap-1 mb-1">
                <span className="text-yellow-400 text-xs">★</span>
                <span className="text-white font-bold text-[11px]">
                  {movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-white font-bold text-xs leading-tight line-clamp-2 mb-1">
                {movie.title}
              </h3>

              {/* First 2 Genres */}
              {topGenres.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {topGenres.map((genre: any, index) => (
                    <span 
                      key={index} 
                      className="text-[9px] bg-white/20 text-gray-200 px-1.5 py-0.5 rounded-sm backdrop-blur-xs font-medium"
                    >
                      {typeof genre === 'string' ? genre : genre.name}
                    </span>
                  ))}
                </div>
              )}

            </div>
          </Link>
        );
      })}
    </div>
  );
}