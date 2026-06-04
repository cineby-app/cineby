"use client";

import { useState, useEffect } from "react";
import { Movie } from "@/lib/tmdb";
import { Heart, BookmarkPlus, Share2, Check } from "lucide-react";

export function ActionButtons({ movie }: { movie: Movie }) {
  const [isCopied, setIsCopied] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isWatchlisted, setIsWatchlisted] = useState(false);

  useEffect(() => {
    // Standardize local storage management
    const loadState = () => {
      const favs = JSON.parse(localStorage.getItem("wtw_favorites") || "[]");
      const watchlist = JSON.parse(
        localStorage.getItem("wtw_watchlist") || "[]",
      );

      setIsFavorite(favs.some((m: Movie) => m.id === movie.id));
      setIsWatchlisted(watchlist.some((m: Movie) => m.id === movie.id));

      // Save to recently viewed
      const recent = JSON.parse(localStorage.getItem("wtw_recent") || "[]");
      const filteredRecent = recent.filter((m: Movie) => m.id !== movie.id);
      filteredRecent.unshift(movie);
      // Keep only last 20
      localStorage.setItem(
        "wtw_recent",
        JSON.stringify(filteredRecent.slice(0, 20)),
      );
    };

    loadState();
  }, [movie]);

  const toggleFavorite = () => {
    const favs = JSON.parse(localStorage.getItem("wtw_favorites") || "[]");
    if (isFavorite) {
      localStorage.setItem(
        "wtw_favorites",
        JSON.stringify(favs.filter((m: Movie) => m.id !== movie.id)),
      );
      setIsFavorite(false);
    } else {
      localStorage.setItem("wtw_favorites", JSON.stringify([...favs, movie]));
      setIsFavorite(true);
    }
  };

  const toggleWatchlist = () => {
    const watchlist = JSON.parse(localStorage.getItem("wtw_watchlist") || "[]");
    if (isWatchlisted) {
      localStorage.setItem(
        "wtw_watchlist",
        JSON.stringify(watchlist.filter((m: Movie) => m.id !== movie.id)),
      );
      setIsWatchlisted(false);
    } else {
      localStorage.setItem(
        "wtw_watchlist",
        JSON.stringify([...watchlist, movie]),
      );
      setIsWatchlisted(true);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <button
        onClick={toggleWatchlist}
        className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold uppercase tracking-wider text-sm transition-all shadow-xl
          ${
            isWatchlisted
              ? "bg-[#1F2937] text-white border border-[#374151]"
              : "bg-[#DC2626] text-white hover:bg-[#991B1B] border border-[#DC2626]"
          }`}
      >
        <BookmarkPlus className="w-5 h-5" />
        {isWatchlisted ? "In Watchlist" : "Add to Watchlist"}
      </button>

      <button
        onClick={toggleFavorite}
        className="w-12 h-12 rounded-full flex items-center justify-center bg-[#0F0F1A] border border-[#1F2937] text-white hover:bg-[#BE185D] hover:border-[#BE185D] hover:shadow-[0_0_20px_rgba(190,24,93,0.5)] transition-all"
        aria-label="Add to Favorites"
      >
        <Heart
          className="w-5 h-5"
          fill={isFavorite ? "currentColor" : "none"}
          color={isFavorite ? "#F3F4F6" : "currentColor"}
        />
      </button>

      <button
        onClick={copyLink}
        className="w-12 h-12 rounded-full flex items-center justify-center bg-[#0F0F1A] border border-[#1F2937] text-gray-400 hover:text-white hover:border-gray-500 transition-all"
        aria-label="Copy Link"
      >
        {isCopied ? (
          <Check className="w-5 h-5 text-green-500" />
        ) : (
          <Share2 className="w-5 h-5" />
        )}
      </button>
    </div>
  );
}
