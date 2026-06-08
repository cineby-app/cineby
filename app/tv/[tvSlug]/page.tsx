'use client';

import {
  fetchTVShowDetails,
  fetchTVCredits,
  fetchTVCrew,
  fetchTVSimilar,
  fetchTVRecommendations,
  fetchTVVideos,
  fetchTVKeywords,
  fetchTVImages,
  fetchTVReviews,
  fetchTVSeasonEpisodes,
  Review
} from "@/lib/tmdb";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionButtons } from "@/components/ActionButtons";
import { useState, useEffect } from "react";
import { ContentLocker } from "@/components/ContentLocker";
import { createPortal } from "react-dom";
import { AdsterraAd } from "@/components/AdsterraAd";

const AD_KEY_300x250 = '8162f7b8c34974f34a974b6e7ecfc56c';

// Responsive Ad Component
function ResponsiveAd() {
  return (
    <>
      {/* Mobile: Bottom of page */}
      <div className="block lg:hidden w-full my-8 py-6">
        <div className="flex justify-center">
          <div className="bg-gradient-to-r from-[#0F0F1A] to-black rounded-xl border border-[#1F2937] p-3">
            <AdsterraAd adKey={AD_KEY_300x250} width={300} height={250} />
          </div>
        </div>
      </div>
    </>
  );
}

// Desktop Ad Component (to be placed in sidebar)
function DesktopSidebarAd() {
  return (
    <div className="hidden lg:block w-full mt-6">
      <div className="bg-gradient-to-br from-[#0F0F1A] to-black rounded-xl border border-[#1F2937] p-3">
        <AdsterraAd adKey={AD_KEY_300x250} width={300} height={250} />
      </div>
    </div>
  );
}

// Helper functions
function slugify(name: string, id: number): string {
  if (!name) return `${id}`;
  return `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${id}`;
}

function formatReviewDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function getAvatarUrl(avatarPath: string | null): string {
  if (!avatarPath) return '';
  if (avatarPath.startsWith('/https')) return avatarPath.substring(1);
  if (avatarPath.startsWith('/http')) return avatarPath.substring(1);
  return `https://image.tmdb.org/t/p/w45${avatarPath}`;
}

// ========== EPISODE DETAIL POPUP - RESPONSIVE + COMPACT MOBILE ==========
function EpisodePopup({
  episode,
  seriesId,
  seriesName,
  selectedSeason,
  onClose,
}: {
  episode: any;
  seriesId: number;
  seriesName: string;
  selectedSeason: number;
  onClose: () => void;
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden";

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEsc);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  const title = episode.name || `Episode ${episode.episode_number}`;

  const shortAirDate = episode.air_date
    ? new Date(episode.air_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "TBA";

  return createPortal(
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/90 p-2 sm:p-5 md:p-8 backdrop-blur-xl overflow-hidden"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl max-h-[96dvh] overflow-hidden rounded-2xl md:rounded-3xl border border-[#E50914]/40 bg-[#05050A] shadow-[0_0_100px_rgba(229,9,20,0.18)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-30 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-white/15 bg-black/70 text-white backdrop-blur-md transition-all hover:border-[#E50914] hover:bg-[#E50914]"
          aria-label="Close Episode"
        >
          <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="relative h-[34dvh] min-h-[210px] max-h-[300px] sm:h-[42dvh] sm:max-h-[390px] lg:h-auto lg:min-h-[620px] lg:max-h-none bg-black">
            {episode.still_path ? (
              <Image
                src={`https://image.tmdb.org/t/p/original${episode.still_path}`}
                alt={title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-[#1F2937] via-[#0F0F1A] to-black" />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-[#05050A] via-black/30 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-black/25 lg:to-[#05050A]" />

            <div className="absolute bottom-3 left-3 right-12 sm:bottom-4 sm:left-4 sm:right-4 lg:hidden">
              <div className="mb-2 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-[#E50914] px-2.5 py-1 text-[10px] font-black text-white">
                  S{selectedSeason} E{episode.episode_number}
                </span>

                {episode.runtime && (
                  <span className="rounded-full border border-white/15 bg-black/70 px-2.5 py-1 text-[10px] font-bold text-gray-200">
                    {episode.runtime}m
                  </span>
                )}

                {episode.vote_average > 0 && (
                  <span className="rounded-full border border-yellow-400/30 bg-yellow-400/10 px-2.5 py-1 text-[10px] font-bold text-yellow-300">
                    ★ {episode.vote_average.toFixed(1)}
                  </span>
                )}
              </div>

              <p className="line-clamp-1 text-[9px] font-bold uppercase tracking-[0.2em] text-[#E50914]">
                {seriesName}
              </p>

              <h2 className="mt-1 line-clamp-2 text-xl font-black leading-tight text-white sm:text-3xl">
                {title}
              </h2>
            </div>
          </div>

          <div className="relative flex max-h-[62dvh] flex-col overflow-y-auto bg-[#05050A] p-3 sm:p-6 md:p-8 lg:max-h-none lg:overflow-visible lg:p-9 custom-scrollbar">
            <div className="hidden lg:block">
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-[#E50914] px-3 py-1.5 text-xs font-black text-white shadow-lg shadow-[#E50914]/25">
                  S{selectedSeason} E{episode.episode_number}
                </span>

                {episode.runtime && (
                  <span className="rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-xs font-bold text-gray-200">
                    {episode.runtime} min
                  </span>
                )}

                {episode.vote_average > 0 && (
                  <span className="rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1.5 text-xs font-bold text-yellow-300">
                    ★ {episode.vote_average.toFixed(1)}/10
                  </span>
                )}
              </div>

              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#E50914]">
                {seriesName}
              </p>

              <h2 className="mt-3 text-4xl font-black leading-tight text-white xl:text-5xl">
                {title}
              </h2>
            </div>

            <div className="grid grid-cols-3 gap-2 lg:mt-8 lg:grid-cols-1 xl:grid-cols-3 xl:gap-3">
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-2.5 sm:p-4">
                <p className="text-[8px] uppercase tracking-widest text-gray-500">
                  Date
                </p>
                <p className="mt-1 text-[11px] font-bold text-white sm:text-sm">
                  {shortAirDate}
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-2.5 sm:p-4">
                <p className="text-[8px] uppercase tracking-widest text-gray-500">
                  Season
                </p>
                <p className="mt-1 text-[11px] font-bold text-white sm:text-sm">
                  S{selectedSeason}
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-2.5 sm:p-4">
                <p className="text-[8px] uppercase tracking-widest text-gray-500">
                  Episode
                </p>
                <p className="mt-1 text-[11px] font-bold text-white sm:text-sm">
                  E{episode.episode_number}
                </p>
              </div>
            </div>

            <div className="mt-3 rounded-2xl border border-[#1F2937] bg-gradient-to-br from-[#0F0F1A] to-black p-3 sm:mt-5 sm:p-5">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-black text-white sm:text-base">
                <span className="h-5 w-1 rounded-full bg-[#E50914]" />
                Episode Overview
              </h3>

              <p className="line-clamp-3 text-xs leading-relaxed text-gray-300 sm:line-clamp-none sm:text-sm lg:max-h-[170px] lg:overflow-y-auto custom-scrollbar">
                {episode.overview || "No description available for this episode."}
              </p>
            </div>

            <div className="mt-3 flex gap-2 sm:mt-5 sm:flex-row sm:gap-3 lg:mt-auto lg:pt-6">
              <button
                onClick={() =>
                  window.open(
                    `https://cineby.sc/tv/${seriesId}/${selectedSeason}/${episode.episode_number}`,
                    "_blank"
                  )
                }
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#E50914] to-[#b50000] px-4 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-[#E50914]/25 transition-all hover:scale-[1.02] hover:from-[#b50000] hover:to-[#7f0000] sm:px-6 sm:py-3.5 sm:text-sm"
              >
                <svg className="h-4 w-4 fill-current sm:h-5 sm:w-5" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Watch
              </button>

              <button
                onClick={onClose}
                className="flex items-center justify-center rounded-full border border-white/15 bg-white/[0.06] px-4 py-3 text-xs font-bold uppercase tracking-wider text-white transition-all hover:border-[#E50914] hover:bg-white/[0.1] sm:px-6 sm:py-3.5 sm:text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ========== ALL SEASONS / EPISODES POPUP - RESPONSIVE ==========
function EpisodesModal({
  seasons,
  seriesId,
  seriesName,
  initialSeason,
  onClose,
}: {
  seasons: any[];
  seriesId: number;
  seriesName: string;
  initialSeason: number;
  onClose: () => void;
}) {
  const validSeasons = (seasons || [])
    .filter((s) => s.season_number > 0)
    .sort((a, b) => a.season_number - b.season_number);

  const [selectedSeason, setSelectedSeason] = useState(initialSeason);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState<any>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selectedEpisode) {
          setSelectedEpisode(null);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleEsc);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [onClose, selectedEpisode]);

  useEffect(() => {
    async function loadEpisodes() {
      if (!seriesId || selectedSeason === null) return;

      setLoadingEpisodes(true);

      try {
        const data = await fetchTVSeasonEpisodes(
          seriesId.toString(),
          selectedSeason
        );

        const episodeList =
          data && typeof data === "object" && "episodes" in data
            ? (data as any).episodes
            : Array.isArray(data)
              ? data
              : [];

        setEpisodes(episodeList);
      } catch (error) {
        console.error("Error loading episodes:", error);
        setEpisodes([]);
      } finally {
        setLoadingEpisodes(false);
      }
    }

    loadEpisodes();
  }, [seriesId, selectedSeason]);

  const currentSeason = validSeasons.find(
    (season) => season.season_number === selectedSeason
  );

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[999998] flex items-center justify-center bg-black/90 p-2 sm:p-5 md:p-8 backdrop-blur-xl overflow-hidden"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-7xl max-h-[96dvh] overflow-hidden rounded-2xl md:rounded-3xl border border-[#E50914]/40 bg-[#05050A] shadow-[0_0_100px_rgba(229,9,20,0.18)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-20 border-b border-[#E50914]/25 bg-[#05050A]/95 p-3 sm:p-5 md:p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-[#E50914]">
                  All Seasons
                </p>

                <h2 className="truncate text-lg sm:text-2xl md:text-3xl font-black text-white">
                  {seriesName}
                </h2>
              </div>

              <button
                onClick={onClose}
                className="flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-white transition-all hover:border-[#E50914] hover:bg-[#E50914]"
                aria-label="Close episodes"
              >
                <svg
                  className="h-4 w-4 sm:h-5 sm:w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Season pills */}
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {validSeasons.map((season) => (
                <button
                  key={season.id || season.season_number}
                  onClick={() => setSelectedSeason(season.season_number)}
                  className={`shrink-0 rounded-full px-3 py-2 text-[11px] sm:text-sm font-black transition-all ${
                    selectedSeason === season.season_number
                      ? "bg-[#E50914] text-white shadow-lg shadow-[#E50914]/25"
                      : "border border-white/10 bg-white/[0.06] text-gray-300 hover:border-[#E50914]/50 hover:text-white"
                  }`}
                >
                  {season.name || `Season ${season.season_number}`}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-[calc(96dvh-118px)] overflow-y-auto custom-scrollbar">
            {/* Current season info */}
            {currentSeason && (
              <div className="border-b border-white/10 p-3 sm:p-5 md:p-6">
                <div className="grid grid-cols-[70px_1fr] sm:grid-cols-[110px_1fr] gap-3 sm:gap-5">
                  <div className="relative h-24 w-[70px] sm:h-36 sm:w-24 overflow-hidden rounded-xl bg-[#1F2937] border border-white/10">
                    {currentSeason.poster_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w300${currentSeason.poster_path}`}
                        alt={currentSeason.name || `Season ${selectedSeason}`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-500">
                        No Poster
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <h3 className="line-clamp-1 text-xl sm:text-2xl md:text-3xl font-black text-white">
                      {currentSeason.name || `Season ${selectedSeason}`}
                    </h3>

                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] sm:text-xs text-gray-400">
                      <span className="rounded-full bg-[#E50914]/15 px-2.5 py-1 font-bold text-[#E50914]">
                        {currentSeason.episode_count || episodes.length} Episodes
                      </span>

                      {currentSeason.air_date && (
                        <span>
                          {new Date(currentSeason.air_date).getFullYear()}
                        </span>
                      )}
                    </div>

                    {currentSeason.overview && (
                      <p className="mt-2 line-clamp-2 sm:line-clamp-3 text-xs sm:text-sm leading-relaxed text-gray-300">
                        {currentSeason.overview}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Episodes */}
            <div className="p-3 sm:p-5 md:p-6">
              {loadingEpisodes ? (
                <div className="flex justify-center py-16">
                  <div className="h-10 w-10 rounded-full border-4 border-[#1F2937] border-t-[#E50914] animate-spin" />
                </div>
              ) : episodes.length === 0 ? (
                <div className="py-16 text-center text-sm text-gray-400">
                  No episodes available for this season.
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4">
                  {episodes.map((episode) => {
                    const episodeDate = episode.air_date
                      ? new Date(episode.air_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "TBA";

                    return (
                      <button
                        key={
                          episode.id ||
                          `${selectedSeason}-${episode.episode_number}`
                        }
                        onClick={() => setSelectedEpisode(episode)}
                        className="group flex gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-2.5 text-left transition-all hover:-translate-y-0.5 hover:border-[#E50914]/60 hover:bg-white/[0.08] sm:gap-4 sm:p-4"
                      >
                        <div className="relative h-24 w-36 shrink-0 overflow-hidden rounded-xl bg-[#1F2937] sm:h-28 sm:w-44">
                          {episode.still_path ? (
                            <Image
                              src={`https://image.tmdb.org/t/p/w500${episode.still_path}`}
                              alt={
                                episode.name ||
                                `Episode ${episode.episode_number}`
                              }
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-gray-500">
                              No Image
                            </div>
                          )}

                          <div className="absolute left-2 top-2 rounded-md border border-white/10 bg-[#b50000] px-2 py-1 backdrop-blur-md">
                            <span className="text-[10px] font-black text-white">
                              E{episode.episode_number}
                            </span>
                          </div>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex flex-wrap items-center gap-1.5 text-[10px] sm:text-xs text-gray-400">
                            <span className="font-black text-[#E50914]">
                              S{selectedSeason} E{episode.episode_number}
                            </span>

                            {episode.runtime && (
                              <span>• {episode.runtime} min</span>
                            )}

                            <span className="hidden sm:inline">• {episodeDate}</span>

                            {episode.vote_average > 0 && (
                              <span className="font-bold text-yellow-400">
                                ★ {episode.vote_average.toFixed(1)}
                              </span>
                            )}
                          </div>

                          <h4 className="line-clamp-2 text-sm sm:text-lg font-black text-white">
                            {episode.name || `Episode ${episode.episode_number}`}
                          </h4>

                          <p className="mt-1 sm:mt-2 line-clamp-2 sm:line-clamp-3 text-xs sm:text-sm leading-relaxed text-gray-400">
                            {episode.overview || "No description available."}
                          </p>

                          <span className="mt-2 inline-flex text-[11px] sm:text-xs font-bold text-[#E50914]">
                            View details →
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedEpisode && (
        <EpisodePopup
          episode={selectedEpisode}
          seriesId={seriesId}
          seriesName={seriesName}
          selectedSeason={selectedSeason}
          onClose={() => setSelectedEpisode(null)}
        />
      )}
    </>,
    document.body
  );
}

// ========== SIMPLE SEASONS SECTION ==========
function SeasonsEpisodes({
  seasons,
  seriesId,
  seriesName,
}: {
  seasons: any[];
  seriesId: number;
  seriesName: string;
}) {
  const validSeasons = (seasons || [])
    .filter((s) => s.season_number > 0)
    .sort((a, b) => a.season_number - b.season_number);

  const [modalOpen, setModalOpen] = useState(false);
  const [initialSeason, setInitialSeason] = useState(
    validSeasons[0]?.season_number || 1
  );

  if (validSeasons.length === 0) return null;

  const totalEpisodes = validSeasons.reduce(
    (total, season) => total + (season.episode_count || 0),
    0
  );

  const openModal = (seasonNumber: number) => {
    setInitialSeason(seasonNumber);
    setModalOpen(true);
  };

  return (
    <>
      <section className="rounded-2xl border border-[#1F2937] bg-gradient-to-br from-[#0F0F1A] to-black p-4 sm:p-6 md:p-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="h-8 w-1 rounded-full bg-[#E50914]" />
              <h2 className="text-xl md:text-2xl font-black tracking-tight">
                Seasons & Episodes
              </h2>
            </div>

            <p className="text-sm text-gray-400">
              {validSeasons.length} season
              {validSeasons.length !== 1 ? "s" : ""} • {totalEpisodes} episode
              {totalEpisodes !== 1 ? "s" : ""}
            </p>
          </div>

          <button
            onClick={() => openModal(validSeasons[0].season_number)}
            className="rounded-full bg-gradient-to-r from-[#E50914] to-[#b50000] px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-[#E50914]/20 transition-all hover:scale-[1.02] hover:from-[#b50000] hover:to-[#7f0000]"
          >
            View All Episodes
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 md:gap-4">
          {validSeasons.map((season) => (
            <button
              key={season.id || season.season_number}
              onClick={() => openModal(season.season_number)}
              className="group overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] text-left transition-all hover:-translate-y-1 hover:border-[#E50914]/50 hover:bg-white/[0.08]"
            >
              <div className="relative aspect-[2/3] bg-[#1F2937]">
                {season.poster_path ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/w342${season.poster_path}`}
                    alt={season.name || `Season ${season.season_number}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-gray-500">
                    No Poster
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

                <div className="absolute bottom-2 left-2 right-2">
                  <span className="inline-flex rounded-md border border-white/10 bg-black/80 px-2 py-1 text-xs font-black text-[#E50914]">
                    {season.episode_count || 0} Episodes
                  </span>
                </div>
              </div>

              <div className="p-3">
                <h3 className="line-clamp-1 text-sm font-bold text-white">
                  {season.name || `Season ${season.season_number}`}
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  {season.air_date
                    ? new Date(season.air_date).getFullYear()
                    : "TBA"}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {modalOpen && (
        <EpisodesModal
          seasons={validSeasons}
          seriesId={seriesId}
          seriesName={seriesName}
          initialSeason={initialSeason}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}

// ========== LIGHTBOX COMPONENT ==========
function ImageLightbox({ images, initialIndex, onClose }: { 
  images: { src: string; alt: string }[]; 
  initialIndex: number; 
  onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setCurrentIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
      if (e.key === 'ArrowRight') setCurrentIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length, onClose]);

  return (
    <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-lg flex items-center justify-center" onClick={onClose}>
      <button onClick={onClose} className="absolute top-6 right-6 text-white hover:text-[#E50914] transition z-10" aria-label="Close">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <button onClick={(e) => { e.stopPropagation(); setCurrentIndex(prev => (prev > 0 ? prev - 1 : images.length - 1)); }} className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-[#E50914] transition z-10" aria-label="Previous">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <div className="w-full max-w-6xl mx-auto px-4" onClick={(e) => e.stopPropagation()}>
        <div className="relative aspect-video md:aspect-auto md:h-[80vh] flex items-center justify-center">
          <Image src={images[currentIndex].src} alt={images[currentIndex].alt} fill className="object-contain" sizes="100vw" priority />
        </div>
        <p className="text-center text-gray-400 mt-4">{currentIndex + 1} / {images.length}</p>
      </div>
      <button onClick={(e) => { e.stopPropagation(); setCurrentIndex(prev => (prev < images.length - 1 ? prev + 1 : 0)); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-[#E50914] transition z-10" aria-label="Next">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

// ========== REVIEWS MODAL ==========
function ReviewsModal({ reviews, totalReviews, onClose }: { reviews: Review[]; totalReviews: number; onClose: () => void }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [allReviews, setAllReviews] = useState<Review[]>(reviews);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(reviews.length < totalReviews);
  const [seriesId, setSeriesId] = useState<string>('');

  useEffect(() => {
    const id = window.location.pathname.split('/').pop()?.split('-').pop();
    if (id) setSeriesId(id);
  }, []);

  const loadMoreReviews = async () => {
    if (!seriesId || loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = currentPage + 1;
    const data = await fetchTVReviews(seriesId, nextPage);
    setAllReviews(prev => [...prev, ...data.results]);
    setCurrentPage(nextPage);
    setHasMore(nextPage < data.total_pages);
    setLoadingMore(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 && !loadingMore && hasMore) {
        loadMoreReviews();
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadingMore, hasMore, currentPage, seriesId]);

  return (
    <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative w-full max-w-3xl max-h-[80vh] bg-gradient-to-br from-[#0F0F1A] to-black rounded-2xl border border-[#1F2937] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-[#0F0F1A] border-b border-[#1F2937] p-4 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-white">User Reviews</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto p-6 space-y-6 max-h-[calc(80vh-60px)]">
          {allReviews.map((review) => (
            <div key={review.id} className="border-b border-[#1F2937] pb-6 last:border-0">
              <div className="flex items-center gap-3 mb-3">
                {review.author_details.avatar_path ? (
                  <img src={getAvatarUrl(review.author_details.avatar_path)} alt={review.author} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#1F2937] flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{review.author.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                <div>
                  <p className="font-semibold text-white">{review.author}</p>
                  <p className="text-xs text-gray-500">{formatReviewDate(review.created_at)}</p>
                </div>
                {review.author_details.rating && (
                  <div className="ml-auto flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded-full">
                    <span className="text-yellow-500 text-xs">★</span>
                    <span className="text-white text-xs font-bold">{review.author_details.rating}/10</span>
                  </div>
                )}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">{review.content}</p>
            </div>
          ))}
          {loadingMore && (
            <div className="flex justify-center py-4">
              <div className="w-6 h-6 border-2 border-[#1F2937] border-t-[#E50914] rounded-full animate-spin"></div>
            </div>
          )}
          {!hasMore && allReviews.length > 0 && (
            <p className="text-center text-gray-500 text-sm py-4">End of reviews</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ========== SYNOPSIS COMPONENT ==========
function SynopsisWithReadMore({ overview }: { overview: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  if (!overview) return null;
  const shortText = overview.slice(0, 150) + '...';
  const displayText = isExpanded ? overview : shortText;
  return (
    <div className="bg-gradient-to-br from-[#0F0F1A] to-black rounded-2xl p-6 md:p-8 border border-[#1F2937] shadow-xl">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-1 h-8 bg-[#E50914] rounded-full" />
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">Synopsis</h2>
      </div>
      <div className="relative">
        <p className="text-gray-300 leading-relaxed text-base md:text-lg">&ldquo;{displayText}&rdquo;</p>
        {overview.length > 150 && (
          <button onClick={() => setIsExpanded(!isExpanded)} className="mt-4 text-[#E50914] text-sm font-semibold hover:text-white transition-colors inline-flex items-center gap-1 group">
            {isExpanded ? (<>Show Less <svg className="w-4 h-4 group-hover:-translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg></>) : (<>Read More <svg className="w-4 h-4 group-hover:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></>)}
          </button>
        )}
      </div>
    </div>
  );
}

// ========== HORIZONTAL SCROLLER - FIXED FOR RESPONSIVE ==========
function HorizontalScroller({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full overflow-hidden">
      <div className="overflow-x-auto overflow-y-visible pb-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
        <div className="flex gap-4 md:gap-5 w-max px-0.5">
          {children}
        </div>
      </div>
      {/* Gradient fades for edges - only on desktop */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black to-transparent pointer-events-none hidden sm:block" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black to-transparent pointer-events-none hidden sm:block" />
    </div>
  );
}

// ========== RATING CHART ==========
function RatingChart({ voteAverage, voteCount }: { voteAverage: number; voteCount: number }) {
  const [showDetails, setShowDetails] = useState(false);
  const ratingDistribution = [
    { rating: 10, percentage: Math.min(15, (voteAverage / 10) * 20), count: Math.floor(voteCount * 0.05) },
    { rating: 9, percentage: Math.min(25, (voteAverage / 10) * 30), count: Math.floor(voteCount * 0.12) },
    { rating: 8, percentage: Math.min(30, (voteAverage / 10) * 35), count: Math.floor(voteCount * 0.20) },
    { rating: 7, percentage: Math.min(20, (voteAverage / 10) * 25), count: Math.floor(voteCount * 0.25) },
    { rating: 6, percentage: Math.min(10, (voteAverage / 10) * 15), count: Math.floor(voteCount * 0.18) },
    { rating: 5, percentage: Math.min(5, (voteAverage / 10) * 8), count: Math.floor(voteCount * 0.10) },
    { rating: 4, percentage: Math.min(3, (voteAverage / 10) * 5), count: Math.floor(voteCount * 0.05) },
    { rating: 3, percentage: Math.min(2, (voteAverage / 10) * 3), count: Math.floor(voteCount * 0.03) },
    { rating: 2, percentage: Math.min(1, (voteAverage / 10) * 2), count: Math.floor(voteCount * 0.01) },
    { rating: 1, percentage: Math.min(1, (voteAverage / 10) * 1), count: Math.floor(voteCount * 0.01) },
  ];
  return (
    <div className="bg-gradient-to-br from-[#0F0F1A] to-black rounded-2xl border border-[#1F2937] p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3"><div className="w-1 h-8 bg-[#E50914] rounded-full" /><h3 className="text-lg font-bold tracking-tight">Ratings Breakdown</h3></div>
        <button onClick={() => setShowDetails(!showDetails)} className="text-xs text-gray-400 hover:text-[#E50914] transition-colors">{showDetails ? 'Hide Details' : 'Show Details'}</button>
      </div>
      <div className="flex items-center justify-between mb-6 p-4 bg-white/5 rounded-xl">
        <div><div className="text-sm text-gray-400 mb-1">Average Rating</div><div className="text-5xl font-black text-white">{voteAverage.toFixed(1)}</div><div className="text-xs text-gray-500 mt-1">out of 10</div></div>
        <div className="text-right"><div className="text-sm text-gray-400 mb-1">Total Votes</div><div className="text-2xl font-bold text-white">{voteCount.toLocaleString()}</div><div className="text-xs text-gray-500 mt-1">worldwide</div></div>
      </div>
      <div className="space-y-2">
        {ratingDistribution.map((item) => (
          <div key={item.rating} className="group"><div className="flex items-center gap-3 text-xs"><span className="w-6 text-white font-mono">{item.rating}</span><div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-[#E50914] to-[#BE185D] rounded-full transition-all duration-1000" style={{ width: `${item.percentage}%` }} /></div><span className="w-12 text-right text-gray-400">{item.percentage.toFixed(0)}%</span></div>{showDetails && <div className="ml-9 mt-1 text-[10px] text-gray-600">{item.count.toLocaleString()} votes</div>}</div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-[#1F2937]"><p className="text-[10px] text-gray-600 text-center">Based on {voteCount.toLocaleString()} user ratings</p></div>
    </div>
  );
}

function RecommendedTVShows({ shows }: { shows: any[] }) {
  const topShows = [...shows].sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0)).slice(0, 5);
  if (topShows.length === 0) return null;
  return (
    <div className="space-y-4 md:space-y-5">
      <div className="flex items-center gap-2 md:gap-3">
        <div className="w-1 h-6 md:h-8 bg-[#E50914] rounded-full" />
        <h2 className="text-lg md:text-xl lg:text-2xl font-bold tracking-tight">Recommended for You</h2>
        <span className="text-[10px] md:text-sm text-gray-500">Top picks</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {topShows.map((show) => {
          const showName = show.title || show.name || "TV Show";
          const slug = `${showName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${show.id}`;
          const year = show.release_date ? new Date(show.release_date).getFullYear() : '';
          const rating = show.vote_average || 0;
          const posterPath = show.poster_path;
          return (
            <Link href={`/tv/${slug}`} key={show.id} className="group relative block rounded-lg md:rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="aspect-[2/3] relative bg-gradient-to-br from-[#1F2937] to-[#0F0F1A]">
                {posterPath ? (
                  <Image 
                    src={`https://image.tmdb.org/t/p/w342${posterPath}`} 
                    alt={showName}
                    fill 
                    className="object-cover transition-transform duration-500 group-hover:scale-110" 
                    referrerPolicy="no-referrer" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-8 h-8 md:w-12 md:h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                    </svg>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2 md:p-3">
                  <h3 className="text-white font-bold text-[10px] md:text-xs line-clamp-2">{showName}</h3>
                  <div className="flex items-center gap-1 md:gap-2 mt-0.5 md:mt-1">
                    <div className="flex items-center gap-0.5 md:gap-1">
                      <svg className="w-2 h-2 md:w-3 md:h-3 text-[#E50914]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      <span className="text-[#E50914] text-[8px] md:text-xs font-bold">{rating.toFixed(1)}</span>
                    </div>
                    {year && <span className="text-gray-400 text-[8px] md:text-xs">{year}</span>}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ========== MAIN TV SHOW PAGE ==========
export default function TVPage({ params }: { params: Promise<{ tvSlug: string }> }) {
  const [tvSlug, setTvSlug] = useState<string | null>(null);
  const [show, setShow] = useState<any>(null);
  const [cast, setCast] = useState<any[]>([]);
  const [crew, setCrew] = useState<any[]>([]);
  const [related, setRelated] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [keywords, setKeywords] = useState<any[]>([]);
  const [images, setImages] = useState<any>({ backdrops: [], posters: [] });
  const [seasons, setSeasons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxImages, setLightboxImages] = useState<{ src: string; alt: string }[]>([]);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviewsModalOpen, setReviewsModalOpen] = useState(false);

  useEffect(() => {
    async function unwrapParams() {
      const unwrapped = await params;
      setTvSlug(unwrapped.tvSlug);
    }
    unwrapParams();
  }, [params]);

  useEffect(() => {
    if (!tvSlug) return;
    const idStr = tvSlug.split("-").pop();
    if (!idStr) {
      notFound();
      return;
    }

    async function fetchData() {
      setLoading(true);
      try {
        const [showData, castData, crewData, similar, recommendations, videosData, keywordsData, imagesData] = await Promise.all([
          fetchTVShowDetails(idStr as string),
          fetchTVCredits(idStr as string),
          fetchTVCrew(idStr as string),
          fetchTVSimilar(idStr as string),
          fetchTVRecommendations(idStr as string),
          fetchTVVideos(idStr as string),
          fetchTVKeywords(idStr as string),
          fetchTVImages(idStr as string)
        ]);
        setShow(showData);
        setCast(castData || []);
        setCrew(crewData || []);
        setVideos(videosData || []);
        setKeywords(keywordsData || []);
        setImages(imagesData || { backdrops: [], posters: [] });
        setSeasons(showData?.seasons || []);
        const allRelated = [...(recommendations || []), ...(similar || [])];
        const uniqueRelated = allRelated.filter((v, i, a) => v && v.id && a.findIndex((t) => t.id === v.id) === i);
        setRelated(uniqueRelated);
      } catch (error) {
        console.error('Error fetching TV data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [tvSlug]);

  useEffect(() => {
    if (!show) return;
    async function loadReviews() {
      try {
        const reviewsData = await fetchTVReviews(show.id.toString(), 1);
        setReviews(reviewsData.results.slice(0, 3) || []);
        setTotalReviews(reviewsData.total_results || 0);
      } catch (error) {
        console.error('Error loading reviews:', error);
      }
    }
    loadReviews();
  }, [show]);

  useEffect(() => {
    if (!show) return;
    const posterUrl = show.poster_path ? `https://image.tmdb.org/t/p/original${show.poster_path}` : null;
    const backdropUrls = (images.backdrops || []).map((img: any) => ({
      src: `https://image.tmdb.org/t/p/original${img.file_path}`,
      alt: `${show.name || 'TV Show'} scene`,
    }));
    let allImages = [];
    if (posterUrl) allImages.push({ src: posterUrl, alt: show.name || 'TV Show' });
    allImages.push(...backdropUrls);
    setLightboxImages(allImages);
  }, [show, images]);

  useEffect(() => {
    if (videos && videos.length) {
      const trailer = videos.find(v => v.type === "Trailer" && v.site === "YouTube") || videos.find(v => v.site === "YouTube");
      if (trailer) setTrailerKey(trailer.key);
    }
  }, [videos]);

  useEffect(() => {
    if (trailerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [trailerOpen]);

  if (loading) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-[#1F2937] border-t-[#E50914] rounded-full animate-spin" />
      </main>
    );
  }
  if (!show) return notFound();

  const importantJobs = ['Director', 'Writer', 'Producer', 'Executive Producer', 'Original Music Composer'];
  const filteredCrew = (crew || []).filter(p => p.profile_path && importantJobs.includes(p.job)).slice(0, 16);

  const handleImageClick = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const showName = show.name || 'TV Show';
  const showOriginalName = show.original_name;
  const showBackdropPath = show.backdrop_path;
  const showPosterPath = show.poster_path;
  const showVoteAverage = show.vote_average || 0;
  const showFirstAirDate = show.first_air_date;
  const showNumberOfSeasons = show.number_of_seasons;
  const showNumberOfEpisodes = show.number_of_episodes;
  const showStatus = show.status;
  const showGenres = show.genres || [];
  const showOverview = show.overview;
  const showOriginalLanguage = show.original_language;
  const showId = show.id;

  return (
    <main className="min-h-screen bg-black text-white selection:bg-[#E50914] selection:text-white">
      {/* Hero Backdrop */}
      <div className="relative w-full h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[80vh] min-h-[560px] sm:min-h-[450px] md:min-h-[550px] overflow-hidden">
        <div className="absolute inset-0 z-0">
          {showBackdropPath ? (
            <>
              <Image
                src={`https://image.tmdb.org/t/p/original${showBackdropPath}`}
                alt={showName}
                fill
                className="object-cover scale-105 cursor-pointer"
                priority
                referrerPolicy="no-referrer"
                onClick={() => handleImageClick(0)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-l from-black/40 via-transparent to-transparent" />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1a1a2e] to-black" />
          )}
        </div>
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-[#E50914]/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-40 h-40 sm:w-56 sm:h-56 md:w-80 md:h-80 bg-[#E50914]/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        <div className="absolute bottom-0 left-0 w-full px-4 sm:px-6 md:px-16 lg:px-24 pb-8 sm:pb-8 md:pb-12 z-10">
          <div className="flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-10 items-start md:items-end max-w-7xl mx-auto">
            {/* Poster - Visible on tablet and desktop */}
            <div className="hidden md:block group relative cursor-pointer shrink-0" onClick={() => handleImageClick(0)}>
              <div className="w-32 sm:w-40 md:w-56 lg:w-64 aspect-[2/3] rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl transform transition-all duration-500 group-hover:scale-105 group-hover:shadow-[0_0_40px_rgba(229,9,20,0.4)]">
                {showPosterPath ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/w500${showPosterPath}`}
                    alt={showName}
                    fill
                    className="object-cover"
                    referrerPolicy="no-referrer"
                    priority
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#1F2937] to-[#0F0F1A] flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 sm:-bottom-3 sm:-right-3 bg-black/90 backdrop-blur-md rounded-full px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 border border-[#E50914]/50 shadow-lg">
                <div className="flex items-center gap-1 sm:gap-2">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-[#E50914] fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  <span className="text-white font-bold text-sm sm:text-base md:text-lg">{showVoteAverage.toFixed(1)}</span>
                  <span className="text-gray-400 text-[10px] sm:text-xs">/10</span>
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-3 sm:space-y-4 md:space-y-5 pb-2 sm:pb-4">
              {/* Breadcrumbs with top padding for mobile */}
              <div className="text-xs sm:text-sm text-gray-400 pt-5 sm:pt-0">
                <Link href="/" className="hover:text-[#E50914] transition">Home</Link>
                <span className="mx-1 sm:mx-2">/</span>
                <Link href="/tv" className="hover:text-[#E50914] transition">TV Series</Link>
                <span className="mx-1 sm:mx-2">/</span>
                <span className="text-[#E50914] text-xs sm:text-sm line-clamp-1">{showName}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tighter leading-[1.1] bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent line-clamp-2">
                {showName}
              </h1>
              {showOriginalName && showOriginalName !== showName && (
                <p className="text-gray-400 text-xs sm:text-sm md:text-base font-light italic line-clamp-1">
                  {showOriginalName} {showOriginalLanguage && `(${showOriginalLanguage.toUpperCase()})`}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                <span className="text-[#E50914] font-mono font-bold">{showFirstAirDate?.split("-")[0] || 'N/A'}</span>
                <span className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-gray-600 rounded-full" />
                <span className="text-gray-300">{showNumberOfSeasons || 0} Season{showNumberOfSeasons !== 1 ? 's' : ''}</span>
                <span className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-gray-600 rounded-full" />
                <span className="text-gray-300">{showNumberOfEpisodes || 0} Episodes</span>
                <span className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-gray-600 rounded-full" />
                <span className="text-gray-300 line-clamp-1">{showStatus || 'Unknown'}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {showGenres.slice(0, 5).map((g: any) => (
                  <Link key={g.id} href={`/genre/${g.id}?name=${encodeURIComponent(g.name)}&type=tv`}
                    className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-wider bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-[#E50914] hover:border-[#E50914] transition-all duration-300 hover:scale-105">
                    {g.name}
                  </Link>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2 sm:pt-4">
                <ContentLocker movieId={showId} movieTitle={showName} backdrop={showBackdropPath || undefined} />
                {trailerKey && (
                  <button onClick={() => setTrailerOpen(true)} className="flex items-center gap-2 px-4 sm:px-4 md:px-6 py-2.5 sm:py-2.5 md:py-3 rounded-full font-bold uppercase tracking-wider text-xs sm:text-xs md:text-sm transition-all shadow-xl bg-[#1F2937] text-gray-200 hover:bg-[#470000] border border-white group">
                    <svg className="w-4 h-4 md:w-5 md:h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    <span>Trailer</span>
                  </button>
                )}
                <ActionButtons movie={show} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Fixed responsive width */}
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 mt-4 sm:mt-6 md:mt-8 relative z-20">
        <div className="w-full max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-12">
            <div className="lg:col-span-2 space-y-6 md:space-y-8 lg:space-y-10">
              {showOverview && <SynopsisWithReadMore overview={showOverview} />}

              {/* Seasons & Episodes Section */}
              {seasons && seasons.length > 0 && (
                <SeasonsEpisodes seasons={seasons} seriesId={showId} seriesName={showName} />
              )}

              {/* Cast Section */}
              {cast && cast.length > 0 && (
                <div className="space-y-3 md:space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 md:gap-3"><div className="w-1 h-5 md:h-8 bg-[#E50914] rounded-full" /><h2 className="text-lg md:text-xl lg:text-2xl font-bold tracking-tight">Top Cast</h2></div>
                    <span className="text-[10px] md:text-xs text-gray-500">{cast.length} actors</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    {cast.slice(0, 10).map((person) => (
                      <Link href={`/actor/${slugify(person.name, person.id)}`} key={person.id} className="group flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-gradient-to-br from-[#0F0F1A] to-black rounded-xl border border-[#1F2937] hover:border-[#E50914]/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full overflow-hidden bg-gradient-to-br from-[#1F2937] to-[#0F0F1A] border-2 border-[#1F2937] group-hover:border-[#E50914] transition-all duration-300 shrink-0">
                          {person.profile_path ? (<Image src={`https://image.tmdb.org/t/p/w185${person.profile_path}`} alt={person.name} width={56} height={56} className="w-full h-full object-cover" referrerPolicy="no-referrer" />) : (<div className="w-full h-full flex items-center justify-center"><svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></div>)}
                        </div>
                        <div className="flex-1 min-w-0"><p className="text-sm sm:text-base font-bold text-white group-hover:text-[#E50914] transition-colors truncate">{person.name}</p><p className="text-[10px] sm:text-xs text-gray-400 truncate">as {person.character}</p></div>
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 group-hover:text-[#E50914] group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Crew Section - With Horizontal Scroller */}
              {filteredCrew && filteredCrew.length > 0 && (
                <div className="space-y-3 md:space-y-5">
                  <div className="flex items-center gap-2 md:gap-3"><div className="w-1 h-5 md:h-8 bg-[#E50914] rounded-full" /><h2 className="text-lg md:text-xl lg:text-2xl font-bold tracking-tight">Crew & Production</h2></div>
                  <HorizontalScroller>
                    {filteredCrew.map((person, idx) => (
                      <Link href={`/person/${person.id}`} key={`${person.id}-${idx}`} className="group flex flex-col w-28 sm:w-32 md:w-36 shrink-0 bg-gradient-to-b from-[#0F0F1A] to-black rounded-xl border border-[#1F2937] overflow-hidden hover:border-[#E50914]/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                        <div className="w-full aspect-[2/3] relative bg-gradient-to-br from-[#1F2937] to-[#0F0F1A] overflow-hidden">
                          {person.profile_path ? (<Image src={`https://image.tmdb.org/t/p/w185${person.profile_path}`} alt={person.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />) : (<div className="w-full h-full flex items-center justify-center"><svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></div>)}
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        <div className="p-2 md:p-3 text-center">
                          <p className="text-xs md:text-sm font-bold text-white group-hover:text-[#E50914] transition-colors line-clamp-1">{person.name}</p>
                          <p className="text-[8px] md:text-[10px] text-gray-400 mt-1 line-clamp-2">{person.job}</p>
                        </div>
                      </Link>
                    ))}
                  </HorizontalScroller>
                </div>
              )}

              {/* Media Gallery - With Horizontal Scroller */}
              {images.backdrops && images.backdrops.length > 0 && (
                <div className="space-y-3 md:space-y-5">
                  <div className="flex items-center gap-2 md:gap-3"><div className="w-1 h-5 md:h-8 bg-[#E50914] rounded-full" /><h2 className="text-lg md:text-xl lg:text-2xl font-bold tracking-tight">Media Gallery</h2></div>
                  <HorizontalScroller>
                    {images.backdrops.slice(0, 10).map((img: any, idx: number) => (
                      <div key={idx} onClick={() => handleImageClick(1 + idx)} className="group relative w-56 sm:w-64 md:w-72 lg:w-80 shrink-0 aspect-video rounded-xl overflow-hidden border border-[#1F2937] bg-[#0F0F1A] cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:border-[#E50914]/50">
                        <Image src={`https://image.tmdb.org/t/p/w500${img.file_path}`} alt={`${showName} scene ${idx + 1}`} fill className="object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </HorizontalScroller>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4 md:space-y-6">
              <RatingChart voteAverage={showVoteAverage} voteCount={show.vote_count || 0} />
              
              {/* Series Info */}
              <div className="bg-gradient-to-br from-[#0F0F1A] to-black rounded-xl md:rounded-2xl border border-[#1F2937] p-4 md:p-6 space-y-4 md:space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-[#1F2937]">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-[#E50914]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <h3 className="text-xs md:text-sm font-bold tracking-widest text-gray-400 uppercase">Series Info</h3>
                </div>
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  {showStatus && (<div><p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wider">Status</p><p className="text-xs md:text-sm font-semibold text-white mt-1">{showStatus}</p></div>)}
                  {showOriginalLanguage && (<div><p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wider">Language</p><p className="text-xs md:text-sm font-semibold text-white uppercase mt-1">{showOriginalLanguage}</p></div>)}
                  {showFirstAirDate && (<div><p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wider">First Air Date</p><p className="text-xs md:text-sm font-semibold text-white mt-1">{new Date(showFirstAirDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p></div>)}
                  {show.last_air_date && (<div><p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wider">Last Air Date</p><p className="text-xs md:text-sm font-semibold text-white mt-1">{new Date(show.last_air_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p></div>)}
                </div>
              </div>
              
              {/* Reviews Section */}
              {reviews && reviews.length > 0 && (
                <div className="bg-gradient-to-br from-[#0F0F1A] to-black rounded-xl md:rounded-2xl border border-[#1F2937] p-4 md:p-6">
                  <div className="flex items-center justify-between mb-3 md:mb-4">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 md:w-5 md:h-5 text-[#E50914]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      <h3 className="text-xs md:text-sm font-bold tracking-widest text-gray-400 uppercase">User Reviews</h3>
                    </div>
                    {totalReviews > 3 && (
                      <button onClick={() => setReviewsModalOpen(true)} className="text-[10px] md:text-xs text-[#E50914] hover:text-white transition">See All ({totalReviews})</button>
                    )}
                  </div>
                  <div className="space-y-3 md:space-y-4">
                    {reviews.slice(0, 2).map((review) => (
                      <div key={review.id} className="border-b border-[#1F2937] pb-3 md:pb-4 last:border-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-[#1F2937] flex items-center justify-center">
                            <span className="text-white text-[10px] md:text-xs font-bold">{review.author.charAt(0).toUpperCase()}</span>
                          </div>
                          <span className="text-white text-xs md:text-sm font-medium truncate flex-1">{review.author}</span>
                          {review.author_details.rating && (
                            <div className="flex items-center gap-0.5 md:gap-1">
                              <span className="text-yellow-500 text-[10px] md:text-xs">★</span>
                              <span className="text-white text-[10px] md:text-xs">{review.author_details.rating}/10</span>
                            </div>
                          )}
                        </div>
                        <p className="text-gray-300 text-xs md:text-sm line-clamp-2">{review.content}</p>
                        <p className="text-gray-500 text-[10px] md:text-xs mt-1.5 md:mt-2">{formatReviewDate(review.created_at)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Keywords */}
              {keywords && keywords.length > 0 && (
                <div className="bg-gradient-to-br from-[#0F0F1A] to-black rounded-xl md:rounded-2xl border border-[#1F2937] p-4 md:p-6">
                  <div className="flex items-center gap-2 pb-2 md:pb-3 border-b border-[#1F2937] mb-3 md:mb-4">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-[#E50914]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>
                    <h3 className="text-xs md:text-sm font-bold tracking-widest text-gray-400 uppercase">Keywords</h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5 md:gap-2">
                    {keywords.slice(0, 12).map((kw: any) => (
                      <Link key={kw.id} href={`/keyword/${kw.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${kw.id}`} className="px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-white/5 text-gray-300 text-[10px] md:text-xs font-medium hover:bg-[#E50914] hover:text-white transition-all duration-300 hover:scale-105">#{kw.name.replace(/\s/g, '')}</Link>
                    ))}
                  </div>
                  {/* Desktop Ad - Under Keywords */}
                  <DesktopSidebarAd />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recommended TV Shows */}
      {related && related.length > 0 && (
        <div className="mt-12 md:mt-16 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 pb-12 md:pb-16">
          <div className="max-w-[1600px] mx-auto">
            <RecommendedTVShows shows={related} />
          </div>
        </div>
      )}

      {/* Trailer Modal */}
      {trailerOpen && trailerKey && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 md:p-8 bg-black/90 backdrop-blur-md" onClick={() => setTrailerOpen(false)}>
          <div className="relative w-full max-w-6xl aspect-video bg-black rounded-xl sm:rounded-2xl overflow-hidden border border-[#BE185D]/50" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setTrailerOpen(false)} className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-black/60 hover:bg-[#BE185D] text-white rounded-full flex items-center justify-center transition-all border border-gray-600 hover:border-[#BE185D] backdrop-blur-sm" aria-label="Close Trailer">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <iframe src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`} title={`${showName} Trailer`} className="w-full h-full border-none" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxOpen && lightboxImages.length > 0 && (
        <ImageLightbox images={lightboxImages} initialIndex={lightboxIndex} onClose={() => setLightboxOpen(false)} />
      )}

      {/* Reviews Modal */}
      {reviewsModalOpen && (
        <ReviewsModal reviews={reviews} totalReviews={totalReviews} onClose={() => setReviewsModalOpen(false)} />
      )}

      {/* Mobile Ad - Bottom of page */}
      <ResponsiveAd />

      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1F2937;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E50914;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #b50000;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </main>
  );
}