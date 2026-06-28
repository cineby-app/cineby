"use client";

import { useState, useEffect, useMemo } from "react";
import { fetchPersonDetails, fetchPersonMovies, fetchPersonTVShows, slugify } from "@/lib/tmdb";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { useParams, usePathname } from "next/navigation";

// ========== INTERFACE ==========
interface PersonDetailProps {
  role?: 'actor' | 'director' | 'producer' | 'writer' | 'sound' | 'camera' | 'editor' | 'all';
}

// Helpers
function formatDate(dateString: string | null): string {
  if (!dateString) return "Unknown";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function calculateAge(birthday: string, deathday: string | null): number | null {
  if (!birthday) return null;
  const birth = new Date(birthday);
  const end = deathday ? new Date(deathday) : new Date();
  let age = end.getFullYear() - birth.getFullYear();
  const monthDiff = end.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < birth.getDate())) age--;
  return age;
}

function GenderIcon({ gender }: { gender: number }) {
  if (gender === 1) return <span className="text-pink-500">♀ Female</span>;
  if (gender === 2) return <span className="text-red-500">♂ Male</span>;
  return <span className="text-gray-500">⚲ Non-binary</span>;
}

function getMediaType(item: any): 'movie' | 'tv' {
  if (item.media_type) return item.media_type;
  if (item.title) return 'movie';
  if (item.name) return 'tv';
  return 'movie';
}

function getTitle(item: any): string {
  return item.title || item.name || 'Unknown';
}

function getYear(item: any): string {
  const date = item.release_date || item.first_air_date;
  if (!date) return '';
  return new Date(date).getFullYear().toString();
}

function getMediaTypeLabel(item: any): string {
  const type = getMediaType(item);
  return type === 'movie' ? 'MOVIE' : 'TV SHOW';
}

function getGenreNames(item: any): string[] {
  const genreMap: Record<number, string> = {
    28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
    80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
    14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
    9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 10770: 'TV Movie',
    53: 'Thriller', 10752: 'War', 37: 'Western',
    10759: 'Action & Adventure', 10762: 'Kids', 10763: 'News', 
    10764: 'Reality', 10765: 'Sci-Fi & Fantasy', 10766: 'Soap', 
    10767: 'Talk', 10768: 'War & Politics'
  };
  
  if (!item.genre_ids) return [];
  return item.genre_ids
    .map((id: number) => genreMap[id])
    .filter(Boolean)
    .slice(0, 3);
}

// SVG Icons
const IconCalendar = () => (
  <svg className="w-5 h-5 text-[#E50914]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const IconMapPin = () => (
  <svg className="w-5 h-5 text-[#E50914]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const IconSkull = () => (
  <svg className="w-5 h-5 text-[#E50914]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17h8v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7z" />
    <circle cx="9" cy="10" r="1.5" fill="currentColor" />
    <circle cx="15" cy="10" r="1.5" fill="currentColor" />
    <path strokeLinecap="round" strokeWidth={2} d="M9 15h6" />
  </svg>
);

const IconGender = () => (
  <svg className="w-5 h-5 text-[#E50914]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 3h5m0 0v5m0-5l-6 6M5 3H3v2m5 10H3v2h2m10 0h5v-2h-2M9 3H3v2M3 3l6 6" />
  </svg>
);

const IconTrendingUp = () => (
  <svg className="w-5 h-5 text-[#E50914]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const IconStar = () => (
  <svg className="w-5 h-5 text-[#E50914]" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const IconLink = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m1.858-2.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.102" />
  </svg>
);

const IconImdb = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3.5 7.5h2v9h-2zM8 7.5h2v9H8zM12.5 7.5h2v9h-2zM18.5 7.5h-3v9h3a1.5 1.5 0 001.5-1.5V9a1.5 1.5 0 00-1.5-1.5z" />
  </svg>
);

const IconFilter = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

const IconX = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const IconMovie = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M4 6h16v12H4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M8 4v4M16 4v4M12 4v4M8 16v4M16 16v4M12 16v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const IconTV = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <rect x="2" y="7" width="20" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M8 20l2-3M16 20l-2-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M4 11h16" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const IconAll = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

// ========== FILTER POPUP COMPONENT ==========
function FilterPopup({ 
  isOpen, 
  onClose, 
  mediaFilter, 
  setMediaFilter, 
  genreFilter, 
  setGenreFilter, 
  availableGenres,
  totalCount 
}: {
  isOpen: boolean;
  onClose: () => void;
  mediaFilter: 'all' | 'movie' | 'tv';
  setMediaFilter: (value: 'all' | 'movie' | 'tv') => void;
  genreFilter: string;
  setGenreFilter: (value: string) => void;
  availableGenres: string[];
  totalCount: number;
}) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleApply = () => onClose();
  const handleReset = () => {
    setMediaFilter('all');
    setGenreFilter('all');
  };

  return (
    <>
      <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        <div 
          className="relative w-full max-w-md bg-[#0F0F1A] rounded-2xl border border-[#1F2937] shadow-2xl shadow-[#E50914]/10 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-[#0F0F1A] border-b border-[#1F2937] px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-[#E50914] rounded-full" />
              <h2 className="text-lg font-bold text-white">Filter Filmography</h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1">
              <IconX />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Media Type</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setMediaFilter('all')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    mediaFilter === 'all'
                      ? 'bg-[#E50914] text-white shadow-lg shadow-[#E50914]/25'
                      : 'bg-[#1A1A2E] border border-[#1F2937] text-gray-400 hover:text-white hover:border-[#E50914]/50'
                  }`}
                >
                  <IconAll /> All
                </button>
                <button
                  onClick={() => setMediaFilter('movie')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    mediaFilter === 'movie'
                      ? 'bg-[#E50914] text-white shadow-lg shadow-[#E50914]/25'
                      : 'bg-[#1A1A2E] border border-[#1F2937] text-gray-400 hover:text-white hover:border-[#E50914]/50'
                  }`}
                >
                  <IconMovie /> Movies
                </button>
                <button
                  onClick={() => setMediaFilter('tv')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    mediaFilter === 'tv'
                      ? 'bg-[#E50914] text-white shadow-lg shadow-[#E50914]/25'
                      : 'bg-[#1A1A2E] border border-[#1F2937] text-gray-400 hover:text-white hover:border-[#E50914]/50'
                  }`}
                >
                  <IconTV /> TV Shows
                </button>
              </div>
            </div>

            {availableGenres.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Genre</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setGenreFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      genreFilter === 'all'
                        ? 'bg-[#E50914] text-white shadow-lg shadow-[#E50914]/25'
                        : 'bg-[#1A1A2E] border border-[#1F2937] text-gray-400 hover:text-white hover:border-[#E50914]/50'
                    }`}
                  >
                    All Genres
                  </button>
                  {availableGenres.map(genre => (
                    <button
                      key={genre}
                      onClick={() => setGenreFilter(genre)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        genreFilter === genre
                          ? 'bg-[#E50914] text-white shadow-lg shadow-[#E50914]/25'
                          : 'bg-[#1A1A2E] border border-[#1F2937] text-gray-400 hover:text-white hover:border-[#E50914]/50'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-[#1F2937]">
              <p className="text-sm text-gray-400">
                Showing <span className="text-white font-bold">{totalCount}</span> titles
                {mediaFilter !== 'all' && ` in ${mediaFilter === 'movie' ? 'Movies' : 'TV Shows'}`}
                {genreFilter !== 'all' && ` • ${genreFilter}`}
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleApply}
                className="flex-1 py-3 bg-[#E50914] hover:bg-[#b20710] text-white font-bold rounded-xl transition-all shadow-lg shadow-[#E50914]/25"
              >
                Apply Filters
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-3 border border-[#1F2937] text-gray-400 hover:text-white rounded-xl transition-all hover:border-[#E50914]/50"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ========== MAIN COMPONENT ==========
export default function PersonDetail({ role: propRole = 'all' }: PersonDetailProps) {
  const params = useParams();
  const pathname = usePathname();
  const slug = params.slug as string;
  const [loading, setLoading] = useState(true);
  const [person, setPerson] = useState<any>(null);
  const [movies, setMovies] = useState<any[]>([]);
  const [tvShows, setTvShows] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"bio" | "films">("bio");
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  
  const [mediaFilter, setMediaFilter] = useState<'all' | 'movie' | 'tv'>('all');
  const [genreFilter, setGenreFilter] = useState<string>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // =============================================
  // ✅ AUTO-DETECT ROLE FROM URL PATH
  // =============================================
  const detectedRole = useMemo(() => {
    // If role is passed as prop, use it
    if (propRole !== 'all') return propRole;
    
    // Otherwise detect from URL
    if (!pathname) return 'all';
    
    const path = pathname.toLowerCase();
    if (path.includes('/actor/')) return 'actor';
    if (path.includes('/director/')) return 'director';
    if (path.includes('/writer/')) return 'writer';
    if (path.includes('/producer/')) return 'producer';
    if (path.includes('/sound/')) return 'sound';
    if (path.includes('/camera/')) return 'camera';
    if (path.includes('/editor/')) return 'editor';
    
    return 'all';
  }, [pathname, propRole]);

  useEffect(() => {
    if (!slug) return;
    const id = slug.split("-").pop();
    if (!id) return;

    async function loadData() {
      setLoading(true);
      try {
        const [personData, moviesData, tvShowsData] = await Promise.all([
          fetchPersonDetails(id as string),
          fetchPersonMovies(id as string),
          fetchPersonTVShows(id as string),
        ]);
        setPerson(personData);
        setMovies(moviesData || []);
        setTvShows(tvShowsData || []);
      } catch (error) {
        console.error('Error loading person data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [slug]);

  // =============================================
  // ✅ DETECT ALL ROLES THIS PERSON HAS
  // =============================================
  const personRoles = useMemo(() => {
    const roles = new Set<string>();
    
    // Check acting credits (character field present)
    const hasActing = [...movies, ...tvShows].some(item => item.character && item.character.length > 0);
    if (hasActing) roles.add('actor');
    
    // Check crew jobs
    const allJobs = [...movies, ...tvShows]
      .filter(item => item.job)
      .map(item => (item.job || '').toLowerCase());
    
    if (allJobs.some(j => j.includes('director'))) roles.add('director');
    if (allJobs.some(j => j.includes('writer') || j.includes('screenplay') || j.includes('story'))) roles.add('writer');
    if (allJobs.some(j => j.includes('producer'))) roles.add('producer');
    if (allJobs.some(j => j.includes('camera') || j.includes('cinematographer') || j.includes('director of photography'))) roles.add('camera');
    if (allJobs.some(j => j.includes('sound') || j.includes('music') || j.includes('composer'))) roles.add('sound');
    if (allJobs.some(j => j.includes('editor') || j.includes('editing'))) roles.add('editor');
    
    return Array.from(roles);
  }, [movies, tvShows]);

  // =============================================
  // ✅ FILTER CREDITS BY DETECTED ROLE
  // =============================================
  const allCredits = useMemo(() => {
    let credits = [
      ...movies.map(m => ({ ...m, media_type: 'movie' as const })),
      ...tvShows.map(t => ({ ...t, media_type: 'tv' as const })),
    ];

    // 🔥 Filter by detected role
    if (detectedRole !== 'all') {
      credits = credits.filter(item => {
        const job = (item.job || '').toLowerCase();
        const character = item.character || '';
        
        switch (detectedRole) {
          case 'actor':
            // Acting credits have a character name (from cast array)
            // Crew items have a job field, cast items have character field
            return character.length > 0 && !item.job;
          case 'director':
            return job.includes('director') || job.includes('directing');
          case 'writer':
            return job.includes('writer') || 
                   job.includes('screenplay') || 
                   job.includes('story') || 
                   job.includes('writing');
          case 'producer':
            return job.includes('producer') || job.includes('production');
          case 'sound':
            return job.includes('sound') || 
                   job.includes('music') || 
                   job.includes('composer');
          case 'camera':
            return job.includes('camera') || 
                   job.includes('cinematographer') || 
                   job.includes('director of photography');
          case 'editor':
            return job.includes('editor') || job.includes('editing');
          default:
            return true;
        }
      });
    }

    return credits;
  }, [movies, tvShows, detectedRole]);

  // Get unique genres
  const availableGenres = useMemo(() => {
    const genreSet = new Set<string>();
    allCredits.forEach(item => {
      const genres = getGenreNames(item);
      genres.forEach(g => genreSet.add(g));
    });
    return Array.from(genreSet).sort();
  }, [allCredits]);

  // Apply filters
  const filteredCredits = useMemo(() => {
    let result = allCredits;
    
    if (mediaFilter !== 'all') {
      result = result.filter(item => getMediaType(item) === mediaFilter);
    }
    
    if (genreFilter !== 'all') {
      result = result.filter(item => {
        const genres = getGenreNames(item);
        return genres.includes(genreFilter);
      });
    }
    
    return result.sort((a, b) => {
      const scoreA = (a.vote_average || 0) * 10 + (a.vote_count || 0) / 100;
      const scoreB = (b.vote_average || 0) * 10 + (b.vote_count || 0) / 100;
      return scoreB - scoreA;
    });
  }, [allCredits, mediaFilter, genreFilter]);

  // Reset genre when media changes
  useEffect(() => {
    setGenreFilter('all');
  }, [mediaFilter]);

  if (loading) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#1F2937] border-t-[#E50914] rounded-full animate-spin" />
      </main>
    );
  }

  if (!person) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">Person not found</p>
      </main>
    );
  }

  const bioPreviewLength = 400;
  const shouldTruncate = person.biography?.length > bioPreviewLength;
  const displayBio =
    isBioExpanded || !shouldTruncate
      ? person.biography
      : person.biography.slice(0, bioPreviewLength) + "...";

  const age = calculateAge(person.birthday, person.deathday);
  const movieCount = allCredits.filter(item => getMediaType(item) === 'movie').length;
  const tvCount = allCredits.filter(item => getMediaType(item) === 'tv').length;
  const hasActiveFilters = mediaFilter !== 'all' || genreFilter !== 'all';

  // Get role label for display
  const roleLabels: Record<string, string> = {
    actor: 'Actor',
    director: 'Director',
    writer: 'Writer',
    producer: 'Producer',
    sound: 'Sound & Music',
    camera: 'Camera',
    editor: 'Editor',
    all: 'All'
  };

  // Role route mapping for "View as" links
  const roleRoutes: Record<string, string> = {
    actor: 'actor',
    director: 'director',
    writer: 'writer',
    producer: 'producer',
    sound: 'sound',
    camera: 'camera',
    editor: 'editor',
  };

  // Other roles this person has (excluding current)
  const otherRoles = personRoles.filter(role => role !== detectedRole);

  return (
    <main className="min-h-screen bg-[#05050A] text-[#F3F4F6] selection:bg-[#E50914] selection:text-white pb-24 px-6 md:px-16 lg:px-24">
      <div className="max-w-7xl mx-auto mt-28 md:mt-32 mb-6">
        <Breadcrumbs items={[{ label: "People" }, { label: person.name }]} />
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-10 lg:gap-16">
        {/* LEFT COLUMN */}
        <aside className="w-full md:w-[30%] lg:w-[25%] shrink-0 space-y-6">
          <div className="w-48 mx-auto md:mx-0 md:w-full aspect-[2/3] rounded-xl overflow-hidden bg-[#0F0F1A] border border-[#1F2937] shadow-[0_0_50px_rgba(0,0,0,0.5)] relative">
            {person.profile_path ? (
              <Image
                src={`https://image.tmdb.org/t/p/w780${person.profile_path}`}
                alt={person.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 192px, 300px"
                priority
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1F2937] to-[#0F0F1A]">
                <svg className="w-20 h-20 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </div>

          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter mb-2 text-white">
              {person.name}
            </h1>
            <span className="inline-block px-3 py-1 bg-[#E50914] text-black font-bold rounded-md font-mono tracking-widest uppercase text-xs md:text-sm">
              {detectedRole !== 'all' ? roleLabels[detectedRole] : person.known_for_department}
            </span>
          </div>

          {/* ✅ VIEW AS OTHER ROLES */}
          {otherRoles.length > 0 && (
            <div className="bg-gradient-to-br from-[#0F0F1A] to-black rounded-2xl border border-[#1F2937] p-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                Also View As
              </h3>
              <div className="flex flex-wrap gap-2">
                {otherRoles.map(role => (
                  <Link
                    key={role}
                    href={`/${roleRoutes[role]}/${slug}`}
                    className="px-3 py-1.5 bg-[#1A1A2E] border border-[#1F2937] rounded-lg text-xs font-bold text-gray-400 hover:text-white hover:border-[#E50914]/50 transition-all"
                  >
                    {roleLabels[role]}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {(person.homepage || person.imdb_id) && (
            <div className="bg-gradient-to-br from-[#0F0F1A] to-black rounded-2xl border border-[#1F2937] p-4 space-y-2">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <IconLink /> External Links
              </h3>
              <div className="flex flex-col gap-2">
                {person.homepage && (
                  <a href={person.homepage} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-300 hover:text-[#E50914] transition flex items-center gap-2">
                    <IconLink /> Official Website
                  </a>
                )}
                {person.imdb_id && (
                  <a href={`https://www.imdb.com/name/${person.imdb_id}`} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-300 hover:text-[#E50914] transition flex items-center gap-2">
                    <IconImdb /> IMDb
                  </a>
                )}
              </div>
            </div>
          )}

          <div className="bg-gradient-to-br from-[#0F0F1A] to-black rounded-2xl border border-[#1F2937] p-5 text-center">
            <div className="text-3xl font-black text-[#E50914]">{allCredits.length}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">Movies & TV Shows</div>
            <div className="flex justify-center gap-4 mt-2 text-xs">
              <span className="text-[#E50914]">{movieCount} Movies</span>
              <span className="text-blue-400">{tvCount} TV Shows</span>
            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN */}
        <div className="flex-1 space-y-8">
          <div className="flex gap-2 border-b border-[#1F2937] pb-2">
            <button
              onClick={() => setActiveTab("bio")}
              className={`px-6 py-2 rounded-t-lg font-bold text-sm uppercase tracking-wider transition-all ${
                activeTab === "bio"
                  ? "bg-[#E50914] text-white shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              Biography
            </button>
            <button
              onClick={() => setActiveTab("films")}
              className={`px-6 py-2 rounded-t-lg font-bold text-sm uppercase tracking-wider transition-all ${
                activeTab === "films"
                  ? "bg-[#E50914] text-white shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              Filmography ({filteredCredits.length})
            </button>
          </div>

          <div className="min-h-[400px]">
            {activeTab === "bio" && (
              <div className="bg-gradient-to-br from-[#0F0F1A] to-black rounded-2xl border border-[#1F2937] p-6 md:p-8 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-4">
                    <IconStar /> Personal Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {person.birthday && (
                      <div className="bg-white/5 rounded-xl p-3 flex items-start gap-3 transition-all hover:bg-white/10">
                        <IconCalendar />
                        <div>
                          <div className="text-xs text-gray-400 uppercase tracking-wider">Born</div>
                          <div className="text-white font-medium">{formatDate(person.birthday)}</div>
                          {age && <div className="text-[#E50914] text-xs mt-1 font-mono">{person.deathday ? `Died at ${age} years` : `${age} years old`}</div>}
                        </div>
                      </div>
                    )}
                    {person.place_of_birth && (
                      <div className="bg-white/5 rounded-xl p-3 flex items-start gap-3 transition-all hover:bg-white/10">
                        <IconMapPin />
                        <div>
                          <div className="text-xs text-gray-400 uppercase tracking-wider">Place of Birth</div>
                          <div className="text-white font-medium">{person.place_of_birth}</div>
                        </div>
                      </div>
                    )}
                    {person.deathday && (
                      <div className="bg-white/5 rounded-xl p-3 flex items-start gap-3 transition-all hover:bg-white/10">
                        <IconSkull />
                        <div>
                          <div className="text-xs text-gray-400 uppercase tracking-wider">Died</div>
                          <div className="text-white font-medium">{formatDate(person.deathday)}</div>
                        </div>
                      </div>
                    )}
                    <div className="bg-white/5 rounded-xl p-3 flex items-start gap-3 transition-all hover:bg-white/10">
                      <IconGender />
                      <div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider">Gender</div>
                        <div className="text-white font-medium"><GenderIcon gender={person.gender} /></div>
                      </div>
                    </div>
                    {person.popularity && (
                      <div className="bg-white/5 rounded-xl p-3 flex items-start gap-3 transition-all hover:bg-white/10 sm:col-span-2 lg:col-span-1">
                        <IconTrendingUp />
                        <div className="flex-1">
                          <div className="text-xs text-gray-400 uppercase tracking-wider">Popularity</div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-[#E50914] to-[#b20710] rounded-full" style={{ width: `${Math.min(100, person.popularity)}%` }} />
                            </div>
                            <span className="text-xs text-white font-mono">{Math.round(person.popularity)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    {person.also_known_as && person.also_known_as.length > 0 && (
                      <div className="bg-white/5 rounded-xl p-3 col-span-1 sm:col-span-2 lg:col-span-3">
                        <div className="flex items-start gap-3">
                          <IconStar />
                          <div className="flex-1">
                            <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Also Known As</div>
                            <div className="flex flex-wrap gap-1.5">
                              {person.also_known_as.slice(0, 8).map((name: string, idx: number) => (
                                <span key={idx} className="text-xs text-gray-300 bg-black/30 px-2 py-1 rounded-full">{name}</span>
                              ))}
                              {person.also_known_as.length > 8 && <span className="text-xs text-gray-500">+{person.also_known_as.length - 8}</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {person.biography ? (
                  <div className="border-t border-[#1F2937] pt-6">
                    <div className="text-gray-300 leading-relaxed text-sm md:text-base whitespace-pre-line">{displayBio}</div>
                    {shouldTruncate && (
                      <button onClick={() => setIsBioExpanded(!isBioExpanded)} className="mt-4 text-[#E50914] text-sm font-semibold hover:text-white transition-colors inline-flex items-center gap-1 group">
                        {isBioExpanded ? (
                          <>Show Less <svg className="w-4 h-4 group-hover:-translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg></>
                        ) : (
                          <>Read More <svg className="w-4 h-4 group-hover:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></>
                        )}
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No biography available.</p>
                )}
              </div>
            )}

            {activeTab === "films" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm text-gray-500">
                    Showing <span className="text-white font-bold">{filteredCredits.length}</span> titles
                    {hasActiveFilters && (
                      <span className="ml-2 text-[#E50914] text-xs">• Filtered</span>
                    )}
                  </p>
                  <button
                    onClick={() => setIsFilterOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0F0F1A] border border-[#1F2937] rounded-xl text-gray-400 hover:text-white hover:border-[#E50914]/50 transition-all"
                  >
                    <IconFilter />
                    {hasActiveFilters && (
                      <span className="w-2 h-2 rounded-full bg-[#E50914] animate-pulse" />
                    )}
                  </button>
                </div>

                {filteredCredits.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {filteredCredits.map((item) => {
                      const title = getTitle(item);
                      const itemSlug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${item.id}`;
                      const rating = item.vote_average || 0;
                      const year = getYear(item);
                      const mediaType = getMediaType(item);
                      const mediaLabel = getMediaTypeLabel(item);
                      const href = mediaType === 'movie' ? `/${itemSlug}` : `/tv/${itemSlug}`;
                      const character = item.character || item.role || null;

                      return (
                        <Link
                          href={href}
                          key={`${item.id}-${item.job || item.character || 'cast'}`}
                          className="group relative block w-full aspect-[2/3] rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_10px_30px_rgba(220,38,38,0.3)] hover:ring-2 hover:ring-[#E50914]/50 bg-[#0F0F1A]"
                        >
                          {item.poster_path ? (
                            <Image
                              src={`https://image.tmdb.org/t/p/w342${item.poster_path}`}
                              alt={title}
                              fill
                              loading="lazy"
                              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                              className="object-cover transition-all duration-500 group-hover:scale-110"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1F2937] to-[#0F0F1A]">
                              <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                              </svg>
                            </div>
                          )}

                          <div className="absolute top-2 left-2 z-10">
                            <span className={`px-1.5 py-0.5 rounded-md text-[8px] md:text-[9px] font-bold text-white uppercase tracking-wider shadow-lg ${
                              mediaType === 'movie' 
                                ? 'bg-gradient-to-r from-[#E50914] to-[#b20710]' 
                                : 'bg-gradient-to-r from-blue-700 to-blue-500'
                            }`}>
                              {mediaLabel}
                            </span>
                          </div>

                          {rating > 0 && (
                            <div className="absolute top-2 right-2 z-10 bg-black/80 backdrop-blur-md px-1.5 py-0.5 rounded-md">
                              <div className="flex items-center gap-0.5">
                                <span className="text-yellow-400 text-[10px]">★</span>
                                <span className="text-white font-bold text-[9px] md:text-[10px]">
                                  {rating.toFixed(1)}
                                </span>
                              </div>
                            </div>
                          )}

                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                            <h3 className="text-white font-bold text-xs sm:text-sm line-clamp-2 drop-shadow-lg">
                              {title}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              {year && <span className="text-gray-300 text-xs">{year}</span>}
                              {character && <span className="text-gray-400 text-[10px] truncate">as {character}</span>}
                              {item.job && <span className="text-[#E50914] text-[10px] truncate">{item.job}</span>}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    No titles found matching your filters
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <FilterPopup
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        mediaFilter={mediaFilter}
        setMediaFilter={setMediaFilter}
        genreFilter={genreFilter}
        setGenreFilter={setGenreFilter}
        availableGenres={availableGenres}
        totalCount={filteredCredits.length}
      />
    </main>
  );
}