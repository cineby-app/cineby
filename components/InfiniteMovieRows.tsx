"use client";

import { useState } from "react";
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

const CATEGORY_TITLES = [
  "TRENDING MOVIES",
  "POPULAR MOVIES",
  "TOP RATED MOVIES",
  "TRENDING TV SERIES",
  "POPULAR TV SERIES",
  "TOP RATED TV SERIES"
];

interface InfiniteMovieRowsProps {
  movies?: Movie[];
  tvShows?: Movie[];
}

type PopupSide = "left" | "right";

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
      {/* Outer border arrow */}
      <div
        className={`absolute top-1/2 -translate-y-1/2 w-0 h-0 ${
          side === "right"
            ? "-left-[18px] border-y-[18px] border-y-transparent border-r-[18px] border-r-[#BE185D]/50"
            : "-right-[18px] border-y-[18px] border-y-transparent border-l-[18px] border-l-[#BE185D]/50"
        }`}
      />

      {/* Inner popup arrow */}
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
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&loop=1&playlist=${trailerKey}&rel=0&controls=0&modestbranding=1&playsinline=1`}
              title={`${title} Trailer`}
              className="absolute inset-0 w-full h-full border-none"
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

  const rowsData = [
    hasMovies ? movies.slice(0, ITEMS_PER_ROW) : [],
    hasMovies ? movies.slice(ITEMS_PER_ROW, ITEMS_PER_ROW * 2) : [],
    hasMovies ? movies.slice(ITEMS_PER_ROW * 2, ITEMS_PER_ROW * 3) : [],
    hasTvShows ? tvShows.slice(0, ITEMS_PER_ROW) : [],
    hasTvShows ? tvShows.slice(ITEMS_PER_ROW, ITEMS_PER_ROW * 2) : [],
    hasTvShows ? tvShows.slice(ITEMS_PER_ROW * 2, ITEMS_PER_ROW * 3) : [],
  ];

  const getCategoryType = (rowIndex: number) =>
    rowIndex < 3 ? "movie" : "tv";

  const getSlug = (item: Movie) =>
    slugify(item.title || (item as any).name, item.id);

  const getPosterPath = (item: Movie) =>
    `https://image.tmdb.org/t/p/w342${item.poster_path}`;

  const getRating = (item: Movie) => item.vote_average || 0;

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
    <div className="w-full relative z-20 pb-10 overflow-hidden min-h-screen flex flex-col justify-center gap-10">
      <div className="fixed inset-y-0 left-0 w-32 bg-gradient-to-r from-[#05050A] to-transparent z-30 pointer-events-none" />
      <div className="fixed inset-y-0 right-0 w-32 bg-gradient-to-l from-[#05050A] to-transparent z-30 pointer-events-none" />

      {CATEGORY_TITLES.map((title, rowIndex) => {
        const row = rowsData[rowIndex];

        if (!row || row.length === 0) {
          return (
            <div key={rowIndex} className="relative w-full">
              <div className="w-[90%] mx-auto px-4">
                <div className="inline-block">
                  <h2 className="text-2xl uppercase sm:text-3xl md:text-4xl font-black tracking-tight">
                    <span className="bg-gradient-to-r from-white via-white to-gray-500 bg-clip-text uppercase text-transparent">
                      {title}
                    </span>
                  </h2>
                  <div className="h-1 w-12 bg-[#E50914] rounded-full mt-2" />
                </div>
                <p className="text-gray-500 text-sm mt-3">Coming soon...</p>
              </div>
            </div>
          );
        }

        const animationClass =
          rowIndex % 2 === 0
            ? "animate-scroll-left"
            : "animate-scroll-right";

        const categoryType = getCategoryType(rowIndex);

        return (
          <div
            key={rowIndex}
            className="relative w-full"
            onMouseEnter={() => setHoveredRowId(rowIndex)}
            onMouseLeave={() => setHoveredRowId(null)}
          >
            <div className="w-[90%] mx-auto px-4 mb-5">
              <div className="inline-block">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
                  <span className="bg-gradient-to-r from-white via-white to-gray-500 bg-clip-text text-transparent">
                    {title}
                  </span>
                </h2>
                <div className="h-1 w-16 bg-gradient-to-r from-[#E50914] to-[#b50000] rounded-full mt-2" />
              </div>
            </div>

            <div className="relative w-full overflow-hidden">
              <div
                className={`flex gap-4 px-4 ${animationClass} ${
                  hoveredRowId === rowIndex ? "pause-animation" : ""
                }`}
                style={{ width: "max-content" }}
              >
                {[...row, ...row].map((item, idx) => {
                  const slug = getSlug(item);
                  const posterPath = getPosterPath(item);
                  const rating = getRating(item);

                  if (!item.poster_path) return null;

                  return (
                    <Link
                      href={
                        categoryType === "movie"
                          ? `/${slug}`
                          : `/tv/${slug}`
                      }
                      key={`${item.id}-${idx}`}
                      className="group/card relative block w-32 md:w-40 lg:w-48 aspect-[2/3] shrink-0 rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:z-30 cursor-pointer"
                      onMouseEnter={(e) =>
                        handleCardMouseEnter(e, item, categoryType)
                      }
                      onMouseLeave={handleCardMouseLeave}
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
                          (e.target as HTMLImageElement).style.display =
                            "none";
                        }}
                      />

                      {categoryType === "tv" && (
                        <div className="absolute top-2 left-2 z-10">
                          <div className="bg-gradient-to-r from-red-800 to-red-600 px-1.5 py-0.5 rounded-md text-[8px] md:text-[9px] font-bold text-white uppercase tracking-wider shadow-lg">
                            TV Show
                          </div>
                        </div>
                      )}

                      <div className="absolute top-2 right-2 z-10 bg-black/80 backdrop-blur-md px-1.5 py-0.5 rounded-md">
                        <div className="flex items-center gap-0.5">
                          <span className="text-yellow-400 text-[10px]">
                            ★
                          </span>
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
      })}

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
      `}</style>
    </div>
  );
}