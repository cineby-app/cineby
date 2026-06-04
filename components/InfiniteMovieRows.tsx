"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Movie, slugify } from "@/lib/tmdb";

const TMDB_GENRES: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy",
  80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family",
  14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music",
  9648: "Mystery", 10749: "Romance", 878: "Sci-Fi", 10770: "TV Movie",
  53: "Thriller", 10752: "War", 37: "Western"
};

export function InfiniteMovieRows({ movies }: { movies: Movie[] }) {
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredRowId, setHoveredRowId] = useState<number | null>(null);

  useEffect(() => {
    if (movies && movies.length > 0) {
      const timer = setTimeout(() => setIsLoading(false), 300);
      return () => clearTimeout(timer);
    } else {
      setIsLoading(true);
    }
  }, [movies]);

  // Show loading animation while movies are being fetched
  if (isLoading || !movies || movies.length === 0) {
    return (
      <div className="w-full relative z-20 py-10 overflow-hidden min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 rounded-full bg-[#E50914] blur-xl opacity-20 animate-pulse" />
            <div className="w-16 h-16 border-4 border-[#1F2937] border-t-[#b50000] rounded-full animate-spin mx-auto" />
          </div>
          <p className="text-gray-400 text-sm mt-4 font-mono tracking-wider">Loading cinematic universe...</p>
        </div>
      </div>
    );
  }

  const ITEMS_PER_ROW = 24;
  const rows = [];

  for (
    let i = 0;
    i < Math.min(9, Math.floor(movies.length / ITEMS_PER_ROW));
    i++
  ) {
    const startIndex = i * ITEMS_PER_ROW;
    rows.push(movies.slice(startIndex, startIndex + ITEMS_PER_ROW));
  }

  return (
    <div className="w-full relative z-20 pb-10 overflow-hidden min-h-screen flex flex-col justify-center gap-6">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#05050A] to-transparent z-30" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#05050A] to-transparent z-30" />
      </div>

      {rows.map((row, rowIndex) => {
        const animationClass =
          rowIndex % 2 === 0 ? "animate-scroll-left" : "animate-scroll-right";

        return (
          <div
            key={rowIndex}
            className="group relative flex w-[200%] md:w-[300%] lg:w-[200%]"
            onMouseEnter={() => setHoveredRowId(rowIndex)}
            onMouseLeave={() => setHoveredRowId(null)}
          >
            <div
              className={`flex w-full gap-4 px-2 ${animationClass} group-hover:pause-animation`}
            >
              {[...row, ...row].map((movie, idx) => {
                const slug = slugify(movie.title, movie.id);
                
                let topGenres: string[] = [];
                if (movie.genres && movie.genres.length > 0) {
                  topGenres = movie.genres.slice(0, 2).map((g: any) => typeof g === 'string' ? g : g.name);
                } else if ((movie as any).genre_ids && (movie as any).genre_ids.length > 0) {
                  topGenres = (movie as any).genre_ids
                    .slice(0, 2)
                    .map((id: number) => TMDB_GENRES[id])
                    .filter(Boolean);
                }

                return (
                  <Link
                    href={`/${slug}`}
                    key={`${movie.id}-${idx}`}
                    className="group/card relative block w-32 md:w-40 lg:w-48 aspect-[2/3] shrink-0 rounded-lg overflow-hidden transition-all duration-500 will-change-transform 
                               z-10 hover:z-50 hover:scale-105 focus:z-50 
                               hover:shadow-[0_10px_30px_rgba(181,0,0,0.3)]
                               hover:ring-1 hover:ring-[#b50000]/50
                               group-hover:opacity-60 hover:!opacity-100"
                  >
                    <Image
                      src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                      alt={movie.title}
                      fill
                      loading="lazy"
                      sizes="(max-width: 768px) 128px, (max-width: 1024px) 160px, 192px"
                      className="object-cover transition-all duration-500"
                      referrerPolicy="no-referrer"
                    />

                    <div className="absolute top-2 right-2 z-20 flex items-center gap-1 bg-black/70 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded-full shadow-md">
                      <span className="text-yellow-400 text-[10px] md:text-xs">★</span>
                      <span className="text-white font-bold text-[9px] md:text-[11px]">
                        {movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}
                      </span>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-[#05050A]/95 via-[#05050A]/40 to-transparent opacity-0 transition-opacity duration-500 flex flex-col justify-end p-4 group-hover/card:opacity-100 z-10">
                      <span className="text-gray-400 text-[11px] font-medium mb-0.5">
                        {movie.release_date?.split("-")[0] || "N/A"}
                      </span>

                      <h3 className="text-white font-bold text-xs md:text-sm leading-tight mb-2 line-clamp-2">
                        {movie.title}
                      </h3>

                      {topGenres.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {topGenres.map((genreName, gIdx) => (
                            <span 
                              key={gIdx} 
                              style={{ 
                                borderColor: '#6f0000',
                                backgroundColor: 'rgb(163, 0, 0)',
                                color: '#ffffff'
                              }}
                              className="text-[9px] md:text-[10px] px-2 py-0.5 rounded-md border backdrop-blur-xs font-semibold uppercase tracking-wider transition-colors duration-300"
                            >
                              {genreName}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}