"use client";

import { useState, useRef, useEffect } from "react";
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

interface InfiniteMovieRowsProps {
  movies?: Movie[];
  tvShows?: Movie[];
}

type PopupSide = "left" | "right";

// ==================== HOVER POPUP ====================
function HoverPopup({
  item,
  type,
  position,
  side,
}: {
  item: Movie;
  type: string;
  position: { x: number; y: number; width: number };
  side: PopupSide;
}) {
  const title = item.title || (item as any).name || "Untitled";
  const rating = item.vote_average || 0;
  const year =
    item.release_date?.split("-")[0] ||
    (item as any).first_air_date?.split("-")[0] ||
    "N/A";
  const trailerKey =
    (item as any).videos?.results?.find(
      (video: any) =>
        video.site === "YouTube" &&
        (video.type === "Trailer" || video.type === "Teaser")
    )?.key || null;
  const coverPath = item.backdrop_path || item.poster_path;
  const posterPath = item.poster_path || item.backdrop_path;
  const topGenres: string[] =
    item.genres && item.genres.length > 0
      ? item.genres
          .slice(0, 3)
          .map((g: any) => (typeof g === "string" ? g : g.name))
      : item.genre_ids
          ?.slice(0, 3)
          .map((id: number) => TMDB_GENRES[id])
          .filter(Boolean) || [];
  const cast =
    (item as any).credits?.cast
      ?.slice(0, 5)
      .map((person: any) => person.name)
      .join(", ") || "";
  const director =
    (item as any).credits?.crew?.find((person: any) =>
      ["Director", "Creator"].includes(person.job)
    )?.name || "";

  return (
    <div
      className="fixed z-[200] rounded-2xl bg-[#08080d] border border-[#BE185D]/50 shadow-[0_0_70px_rgba(0,0,0,0.9)] overflow-visible pointer-events-none"
      style={{
        top: position.y,
        left: position.x,
        width: position.width,
        maxHeight: "calc(100vh - 24px)",
      }}
    >
      <div
        className={`absolute top-1/2 -translate-y-1/2 w-0 h-0 ${
          side === "right"
            ? "-left-[18px] border-y-[18px] border-y-transparent border-r-[18px] border-r-[#BE185D]/50"
            : "-right-[18px] border-y-[18px] border-y-transparent border-l-[18px] border-l-[#BE185D]/50"
        }`}
      />
      <div
        className={`absolute top-1/2 -translate-y-1/2 w-0 h-0 ${
          side === "right"
            ? "-left-[16px] border-y-[16px] border-y-transparent border-r-[16px] border-r-[#08080d]"
            : "-right-[16px] border-y-[16px] border-y-transparent border-l-[16px] border-l-[#08080d]"
        }`}
      />
      <div className="overflow-hidden rounded-2xl max-h-[calc(100vh-24px)]">
        <div className="relative h-40 sm:h-48 w-full bg-black">
          {trailerKey ? (
            <iframe
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&loop=1&playlist=${trailerKey}&rel=0&controls=0&modestbranding=1&playsinline=1&disablekb=1&fs=0&iv_load_policy=3&showinfo=0`}
              title={`${title} Trailer`}
              className="absolute inset-0 w-full h-full border-none pointer-events-none"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : coverPath ? (
            <Image
              src={`https://image.tmdb.org/t/p/w780${coverPath}`}
              alt={title}
              fill
              className="object-cover"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-[#08080d] via-black/20 to-black/10" />
        </div>
        <div className="p-4 bg-[#08080d]">
          <div className="flex gap-4">
            <div className="relative h-28 w-20 sm:h-32 sm:w-24 shrink-0 overflow-hidden rounded-xl border border-[#BE185D]/40 bg-black shadow-xl">
              {posterPath && (
                <Image
                  src={`https://image.tmdb.org/t/p/w300${posterPath}`}
                  alt={title}
                  fill
                  className="object-cover"
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="line-clamp-2 text-lg sm:text-xl font-black text-white">
                {title}
              </h3>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-300">
                <span>{year}</span>
                <span>•</span>
                <span className="font-bold text-yellow-400">
                  ★ {rating.toFixed(1)}/10
                </span>
                {type === "tv" && (
                  <span className="rounded bg-blue-500/15 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-300">
                    TV Series
                  </span>
                )}
              </div>
              {topGenres.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {topGenres.map((genre, idx) => (
                    <span
                      key={idx}
                      className="rounded-full bg-white/10 px-2 py-1 text-[10px] text-gray-200"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}
              <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-gray-300">
                {item.overview || "No description available."}
              </p>
            </div>
          </div>
          {(director || cast) && (
            <div className="mt-4 border-t border-[#BE185D]/30 pt-3 text-[11px] text-gray-400">
              {director && (
                <p className="line-clamp-1">
                  <span className="font-bold text-white">Director:</span>{" "}
                  {director}
                </p>
              )}
              {cast && (
                <p className="mt-1 line-clamp-1">
                  <span className="font-bold text-white">Cast:</span> {cast}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== TRAILER CACHE & FETCHER ====================
const trailerCache = new Map<number, string | null>();

async function fetchTrailerForItem(item: Movie, type: string): Promise<string | null> {
  const id = item.id;
  if (trailerCache.has(id)) {
    return trailerCache.get(id) || null;
  }

  try {
    const endpoint = type === "tv" ? "tv" : "movie";
    const res = await fetch(
      `https://api.themoviedb.org/3/${endpoint}/${id}/videos?api_key=ab7ec4451ddd6ddd90cfa65ba80478f5&language=en-US`
    );
    if (!res.ok) {
      trailerCache.set(id, null);
      return null;
    }
    const data = await res.json();
    const videos = data.results || [];
    const trailer =
      videos.find((v: any) => v.type === "Trailer" && v.site === "YouTube") ||
      videos.find((v: any) => v.site === "YouTube");
    const key = trailer?.key || null;
    trailerCache.set(id, key);
    return key;
  } catch {
    trailerCache.set(id, null);
    return null;
  }
}

// ==================== PLAY BUTTON COMPONENT ====================
function PlayButton({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-14 h-14",
    lg: "w-16 h-16"
  };
  
  const iconSizes = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-7 h-7"
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-[#E50914] shadow-[0_0_30px_rgba(229,9,20,0.6)] flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-[0_0_40px_rgba(229,9,20,0.8)]`}>
      <svg
        className={`${iconSizes[size]} text-white ml-0.5`}
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M8 5v14l11-7z" />
      </svg>
    </div>
  );
}

// ==================== TOP 10 ROW - INFINITE AUTO-SCROLL ====================
function Top10Row({
  items,
  onCardHover,
  onCardLeave,
}: {
  items: Movie[];
  onCardHover: (e: React.MouseEvent, item: Movie, type: string) => void;
  onCardLeave: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const top10Items = items.slice(0, 10);
  const doubledItems = [...top10Items, ...top10Items];

  const getSlug = (item: Movie) =>
    slugify(item.title || (item as any).name, item.id);

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="w-[95%] sm:w-[90%] mx-auto px-4 mb-5">
        <div className="inline-flex items-center gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-[#E50914] to-[#b50000] rounded-full" />
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-white bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            TOP 10 Today
          </h2>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <div
          className={`flex gap-3 sm:gap-4 px-4 animate-scroll-left ${
            isHovered ? "pause-animation" : ""
          }`}
          style={{ width: "max-content" }}
        >
          {doubledItems.map((item, idx) => {
            const title = item.title || (item as any).name || "Untitled";
            const year =
              item.release_date?.split("-")[0] ||
              (item as any).first_air_date?.split("-")[0] ||
              "N/A";
            const rating = item.vote_average || 0;
            const rank = (idx % 10) + 1;
            const rankFormatted = rank.toString().padStart(2, "0");
            const slug = getSlug(item);
            const href = `/${slug}`;

            return (
              <Link
                href={href}
                key={`${item.id}-${idx}`}
                className="group relative shrink-0 cursor-pointer block"
                style={{ width: "clamp(140px, 16vw, 200px)" }}
                onMouseEnter={(e) => onCardHover(e, item, "movie")}
                onMouseLeave={onCardLeave}
              >
                <div className="relative rounded-lg overflow-hidden bg-[#1a1a2e] aspect-[2/3] shadow-lg transition-all duration-300 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.8)]">
                  {/* TOP Rank Badge */}
                  <div className="absolute top-0 left-0 z-20">
                    <div className="bg-gradient-to-r from-[#E50914] to-[#b50000] text-white px-2 py-1 rounded-br-lg shadow-lg">
                      <div className="flex flex-col items-center leading-none">
                        <span className="text-[8px] font-bold uppercase tracking-wider">TOP</span>
                        <span className="text-lg font-black leading-none">{rankFormatted}</span>
                      </div>
                    </div>
                  </div>

                  <Image
                    src={`https://image.tmdb.org/t/p/w342${item.poster_path}`}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                    sizes="(max-width: 768px) 140px, 200px"
                  />

                  {/* Play Button - appears on hover */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-400">
                    <PlayButton size="md" />
                  </div>
                </div>

                {/* Info Below Card */}
                <div className="mt-2 sm:mt-3">
                  <h3 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-[#E50914] transition-colors">
                    {title}
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-400 mt-0.5">
                    <span className="text-[#E50914] font-bold">
                      ★ {rating.toFixed(1)}
                    </span>
                    <span>•</span>
                    <span>{year}</span>
                    <span>•</span>
                    <span>Movie</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
// ==================== COVER ROW - INFINITE AUTO-SCROLL ====================
function CoverRow({
  title,
  items,
  type,
  animationDirection = "right",
}: {
  title: string;
  items: Movie[];
  type: string;
  animationDirection?: "left" | "right";
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [trailerKeys, setTrailerKeys] = useState<Record<number, string | null>>({});
  const [loadedTrailers, setLoadedTrailers] = useState<Set<number>>(new Set());

  const displayItems = items.slice(0, 20);
  const doubledItems = [...displayItems, ...displayItems];

  const animationClass =
    animationDirection === "left"
      ? "animate-scroll-left"
      : "animate-scroll-right";

  const getSlug = (item: Movie) =>
    slugify(item.title || (item as any).name, item.id);

  useEffect(() => {
    const loadTrailers = async () => {
      const newKeys: Record<number, string | null> = {};
      const promises = displayItems.map(async (item) => {
        if (!loadedTrailers.has(item.id)) {
          const key = await fetchTrailerForItem(item, type);
          newKeys[item.id] = key;
        }
      });
      await Promise.all(promises);
      if (Object.keys(newKeys).length > 0) {
        setTrailerKeys((prev) => ({ ...prev, ...newKeys }));
        setLoadedTrailers((prev) => {
          const next = new Set(prev);
          Object.keys(newKeys).forEach((id) => next.add(Number(id)));
          return next;
        });
      }
    };
    loadTrailers();
  }, [displayItems, type]);

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setHoveredIndex(null);
      }}
    >
      <div className="w-[95%] sm:w-[90%] mx-auto px-4 mb-5">
        <div className="inline-flex items-center gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-[#E50914] to-[#b50000] rounded-full" />
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-white bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            {title}
          </h2>
        </div>
      </div>

      <div className="relative w-full overflow-visible">
        <div
          className={`flex gap-3 sm:gap-4 px-4 ${animationClass} ${
            isHovered ? "pause-animation" : ""
          }`}
          style={{ width: "max-content" }}
        >
          {doubledItems.map((item, idx) => {
            const titleText =
              item.title || (item as any).name || "Untitled";
            const year =
              item.release_date?.split("-")[0] ||
              (item as any).first_air_date?.split("-")[0] ||
              "N/A";
            const rating = item.vote_average || 0;
            const isMovie = type === "movie";
            const isHoveredCard = hoveredIndex === idx;
            const trailerKey = trailerKeys[item.id] || null;
            const slug = getSlug(item);
            const href = isMovie ? `/${slug}` : `/tv/${slug}`;

            return (
              <div
                key={`${item.id}-${idx}`}
                className="group relative shrink-0 cursor-pointer py-4"
                style={{ width: "clamp(220px, 24vw, 340px)" }}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* ✅ FIX: Wrap the entire card in Link */}
                <Link
                  href={href}
                  className="relative block rounded-xl overflow-hidden bg-[#1a1a2e] aspect-[16/9] transition-all duration-500 ease-out"
                  style={{
                    transform: isHoveredCard ? "scale(1.35)" : "scale(1)",
                    zIndex: isHoveredCard ? 50 : 1,
                    boxShadow: isHoveredCard
                      ? "0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 60px rgba(229, 9, 20, 0.3)"
                      : "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
                  }}
                >
                  {isHoveredCard && trailerKey ? (
                    <>
                      <iframe
                        src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&loop=1&playlist=${trailerKey}&rel=0&controls=0&modestbranding=1&playsinline=1&disablekb=1&fs=0&iv_load_policy=3&showinfo=0`}
                        title={`${titleText} Trailer`}
                        className="absolute inset-0 w-full h-full border-none pointer-events-none"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                      {/* ✅ FIX: Add overlay to ensure click goes to Link */}
                      <div className="absolute inset-0 z-10 pointer-events-none" />
                    </>
                  ) : (
                    <Image
                      src={`https://image.tmdb.org/t/p/w780${
                        item.backdrop_path || item.poster_path
                      }`}
                      alt={titleText}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                      sizes="(max-width: 768px) 220px, 340px"
                    />
                  )}

                  {/* Bottom gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                  {/* TV Badge */}
                  {!isMovie && (
                    <div className="absolute top-2 left-2 z-10 pointer-events-none">
                      <div className="bg-gradient-to-r from-red-800 to-red-600 px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wider shadow-lg">
                        TV Show
                      </div>
                    </div>
                  )}

                  {/* Rating Badge */}
                  <div className="absolute top-2 right-2 z-10 pointer-events-none bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md">
                    <div className="flex items-center gap-0.5">
                      <span className="text-[#E50914] text-xs">★</span>
                      <span className="text-white font-bold text-xs">
                        {rating.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  {/* Title overlay at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 z-10 pointer-events-none">
                    <h3 className="text-sm font-bold text-white truncate drop-shadow-lg group-hover:text-[#E50914] transition-colors">
                      {titleText}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] text-gray-300 mt-0.5">
                      <span>{year}</span>
                      <span>•</span>
                      <span>{isMovie ? "Movie" : "TV Show"}</span>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ==================== POSTER ROW ====================
function PosterRow({
  title,
  items,
  type,
  animationDirection,
  isHovered,
  onHover,
  onCardHover,
  onCardLeave,
}: {
  title: string;
  items: Movie[];
  type: string;
  animationDirection: "left" | "right";
  isHovered: boolean;
  onHover: (hovered: boolean) => void;
  onCardHover: (e: React.MouseEvent, item: Movie, type: string) => void;
  onCardLeave: () => void;
}) {
  const animationClass =
    animationDirection === "left"
      ? "animate-scroll-left"
      : "animate-scroll-right";

  const getSlug = (item: Movie) =>
    slugify(item.title || (item as any).name, item.id);

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      <div className="w-[95%] sm:w-[90%] mx-auto px-4 mb-5">
        <div className="inline-flex items-center gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-[#E50914] to-[#b50000] rounded-full" />
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-white bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            {title}
          </h2>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <div
          className={`flex gap-4 px-4 ${animationClass} ${
            isHovered ? "pause-animation" : ""
          }`}
          style={{ width: "max-content" }}
        >
          {[...items, ...items].map((item, idx) => {
            const slug = getSlug(item);
            const posterPath = `https://image.tmdb.org/t/p/w342${item.poster_path}`;
            const rating = item.vote_average || 0;
            const isMovie = type === "movie";

            if (!item.poster_path) return null;

            return (
              <Link
                href={isMovie ? `/${slug}` : `/tv/${slug}`}
                key={`${item.id}-${idx}`}
                className="group/card relative block w-32 md:w-40 lg:w-48 aspect-[2/3] shrink-0 rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:z-30 cursor-pointer"
                onMouseEnter={(e) => onCardHover(e, item, type)}
                onMouseLeave={onCardLeave}
              >
                <Image
                  src={posterPath}
                  alt={item.title || (item as any).name}
                  fill
                  loading="lazy"
                  sizes="(max-width: 768px) 128px, (max-width: 1024px) 160px, 192px"
                  className="object-cover transition-all duration-500 group-hover/card:scale-110"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />

                {/* Play Button on hover for poster rows */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm opacity-0 group-hover/card:opacity-100 transition-all duration-400">
                  <PlayButton size="sm" />
                </div>

                {!isMovie && (
                  <div className="absolute top-2 left-2 z-10">
                    <div className="bg-gradient-to-r from-red-800 to-red-600 px-1.5 py-0.5 rounded-md text-[8px] md:text-[9px] font-bold text-white uppercase tracking-wider shadow-lg">
                      TV Show
                    </div>
                  </div>
                )}

                <div className="absolute top-2 right-2 z-10 bg-black/80 backdrop-blur-md px-1.5 py-0.5 rounded-md">
                  <div className="flex items-center gap-0.5">
                    <span className="text-yellow-400 text-[10px]">★</span>
                    <span className="text-white font-bold text-[9px] md:text-[10px]">
                      {rating.toFixed(1)}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================
export function InfiniteMovieRows({
  movies = [],
  tvShows = [],
}: InfiniteMovieRowsProps) {
  const [hoveredRowId, setHoveredRowId] = useState<number | null>(null);

  const [popup, setPopup] = useState<{
    show: boolean;
    item: Movie | null;
    type: string;
    x: number;
    y: number;
    width: number;
    side: PopupSide;
  }>({
    show: false,
    item: null,
    type: "movie",
    x: 0,
    y: 0,
    width: 430,
    side: "right",
  });

  const hasMovies = movies && movies.length > 0;
  const hasTvShows = tvShows && tvShows.length > 0;

  if (!hasMovies && !hasTvShows) {
    return (
      <div className="w-full relative z-20 py-10 overflow-hidden min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 rounded-full bg-[#E50914] blur-xl opacity-20 animate-pulse" />
            <div className="w-16 h-16 border-4 border-[#1F2937] border-t-[#E50914] rounded-full animate-spin mx-auto" />
          </div>
          <p className="text-gray-400 text-sm mt-4 font-mono tracking-wider">
            Loading cinematic universe...
          </p>
        </div>
      </div>
    );
  }

  const ITEMS_PER_ROW = 20;

  const trendingMovies = hasMovies
    ? movies.slice(0, ITEMS_PER_ROW)
    : [];
  const popularMovies = hasMovies
    ? movies.slice(ITEMS_PER_ROW, ITEMS_PER_ROW * 2)
    : [];
  const topRatedMovies = hasMovies
    ? movies.slice(ITEMS_PER_ROW * 2, ITEMS_PER_ROW * 3)
    : [];

  const trendingTV = hasTvShows
    ? tvShows.slice(0, ITEMS_PER_ROW)
    : [];
  const popularTV = hasTvShows
    ? tvShows.slice(ITEMS_PER_ROW, ITEMS_PER_ROW * 2)
    : [];
  const topRatedTV = hasTvShows
    ? tvShows.slice(ITEMS_PER_ROW * 2, ITEMS_PER_ROW * 3)
    : [];

  const handleCardMouseEnter = (
    e: React.MouseEvent,
    item: Movie,
    type: string
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const padding = 12;
    const gap = 18;
    const popupWidth = Math.min(430, window.innerWidth - padding * 2);
    const popupHeight = Math.min(500, window.innerHeight - padding * 2);
    const spaceRight = window.innerWidth - rect.right;
    const spaceLeft = rect.left;

    const side: PopupSide =
      spaceRight >= popupWidth + gap || spaceRight >= spaceLeft
        ? "right"
        : "left";

    let x =
      side === "right"
        ? rect.right + gap
        : rect.left - popupWidth - gap;
    let y = rect.top + rect.height / 2 - popupHeight / 2;

    x = Math.max(
      padding,
      Math.min(x, window.innerWidth - popupWidth - padding)
    );
    y = Math.max(
      padding,
      Math.min(y, window.innerHeight - popupHeight - padding)
    );

    setPopup({
      show: true,
      item,
      type,
      x,
      y,
      width: popupWidth,
      side,
    });
  };

  const handleCardMouseLeave = () => {
    setPopup({
      show: false,
      item: null,
      type: "movie",
      x: 0,
      y: 0,
      width: 430,
      side: "right",
    });
  };

  return (
    <div className="w-full relative z-20 pb-10 overflow-hidden min-h-screen flex flex-col justify-center gap-10 md:gap-14">
      {/* ROW 1: TOP 10 MOVIES TODAY - HAS PLAY BUTTON */}
      {hasMovies && (
        <Top10Row
          items={trendingMovies}
          onCardHover={handleCardMouseEnter}
          onCardLeave={handleCardMouseLeave}
        />
      )}

      {/* ROW 2: TRENDING MOVIES - COVER DESIGN - NO PLAY BUTTON */}
      {hasMovies && (
        <CoverRow
          title="Trending Today"
          items={trendingMovies}
          type="movie"
          animationDirection="right"
        />
      )}

      {/* ROW 3: POPULAR MOVIES - HAS PLAY BUTTON */}
      {hasMovies && (
        <PosterRow
          title="Popular Movies"
          items={popularMovies}
          type="movie"
          animationDirection="left"
          isHovered={hoveredRowId === 2}
          onHover={(h) => setHoveredRowId(h ? 2 : null)}
          onCardHover={handleCardMouseEnter}
          onCardLeave={handleCardMouseLeave}
        />
      )}

      {/* ROW 4: TOP RATED MOVIES - HAS PLAY BUTTON */}
      {hasMovies && (
        <PosterRow
          title="Top Rated Movies"
          items={topRatedMovies}
          type="movie"
          animationDirection="right"
          isHovered={hoveredRowId === 3}
          onHover={(h) => setHoveredRowId(h ? 3 : null)}
          onCardHover={handleCardMouseEnter}
          onCardLeave={handleCardMouseLeave}
        />
      )}

      {/* ROW 5: TRENDING TV SHOWS - COVER DESIGN - NO PLAY BUTTON */}
      {hasTvShows && (
        <CoverRow
          title="Trending TV Shows"
          items={trendingTV}
          type="tv"
          animationDirection="left"
        />
      )}

      {/* ROW 6: POPULAR TV SHOWS - HAS PLAY BUTTON */}
      {hasTvShows && (
        <PosterRow
          title="Popular TV Shows"
          items={popularTV}
          type="tv"
          animationDirection="left"
          isHovered={hoveredRowId === 5}
          onHover={(h) => setHoveredRowId(h ? 5 : null)}
          onCardHover={handleCardMouseEnter}
          onCardLeave={handleCardMouseLeave}
        />
      )}

      {/* ROW 7: TOP RATED TV SHOWS - COVER DESIGN - NO PLAY BUTTON */}
      {hasTvShows && (
        <CoverRow
          title="Top Rated TV Shows"
          items={topRatedTV}
          type="tv"
          animationDirection="right"
        />
      )}

      {/* Popup */}
      {popup.show && popup.item && (
        <HoverPopup
          item={popup.item}
          type={popup.type}
          position={{
            x: popup.x,
            y: popup.y,
            width: popup.width,
          }}
          side={popup.side}
        />
      )}

      <style jsx global>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @keyframes scroll-right {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }

        .animate-scroll-left {
          animation: scroll-left 45s linear infinite;
        }

        .animate-scroll-right {
          animation: scroll-right 45s linear infinite;
        }

        .pause-animation {
          animation-play-state: paused !important;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}