"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Movie, slugify } from "@/lib/tmdb";

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<
    "watchlist" | "favorites" | "recent"
  >("watchlist");
  const [movies, setMovies] = useState<Movie[]>([]);

  useEffect(() => {
    const key = `wtw_${activeTab}`;
    const data = JSON.parse(localStorage.getItem(key) || "[]");
    setMovies(data);
  }, [activeTab]);

  return (
    <main className="w-full min-h-screen bg-[#05050A] text-[#F3F4F6] selection:bg-[#b50000] selection:text-white pt-24 md:pt-32 pb-24 px-6 md:px-16 lg:px-24">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter uppercase mb-8 md:mb-12 drop-shadow-lg">
          Your{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#b50000] to-[#b50000]">
            Library
          </span>
        </h1>

        <div className="flex flex-wrap border-b border-[#1F2937] mb-8 md:mb-12">
          {["watchlist", "favorites", "recent"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 md:px-8 py-3 md:py-4 uppercase font-bold tracking-widest text-xs md:text-sm whitespace-nowrap transition-all border-b-2 ${
                activeTab === tab
                  ? "border-[#DC2626] text-white bg-[#DC2626]/5"
                  : "border-transparent text-gray-500 hover:text-gray-300"
              }`}
            >
              {tab === "recent" ? "History" : tab}
            </button>
          ))}
        </div>

        {movies.length === 0 ? (
          <div className="w-full py-16 md:py-24 text-center">
            <p className="text-gray-500 text-sm md:text-lg font-mono uppercase tracking-widest">
              Nothing here yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {movies.map((movie) => {
              const slug = slugify(movie.title, movie.id);
              return (
                <Link
                  href={`/${slug}`}
                  key={movie.id}
                  className="relative block w-full aspect-[2/3] shrink-0 rounded-lg overflow-hidden transition-all duration-300 group hover:scale-105 hover:shadow-[0_10px_30px_rgba(220,38,38,0.2)] hover:ring-1 hover:ring-[#E50914]/50 bg-[#0F0F1A]"
                >
                  <Image
                    src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                    alt={movie.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                    className="object-cover transition-all duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#05050A] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 md:p-4">
                    <h3 className="text-white font-bold text-xs md:text-sm leading-tight mb-1">
                      {movie.title}
                    </h3>
                    <span className="text-[#BE185D] font-bold text-[10px] md:text-xs tracking-wider">
                      ★ {movie.vote_average?.toFixed(1) || "0.0"}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
