'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from "next/image";
import Link from "next/link";
import { SlidersHorizontal, X, ChevronLeft, Film, Tv } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Loading from '@/app/loading';

// Sort options
const sortOptions = [
  { id: 'popularity.desc', name: 'Popularity' },
  { id: 'vote_average.desc', name: 'Top Rated' },
  { id: 'revenue.desc', name: 'Highest Revenue' },
  { id: 'primary_release_date.desc', name: 'Newest First' },
  { id: 'primary_release_date.asc', name: 'Oldest First' },
];

// ✅ Genre list with slugs
const genres = [
  { id: 28, name: 'Action', slug: 'action' },
  { id: 12, name: 'Adventure', slug: 'adventure' },
  { id: 16, name: 'Animation', slug: 'animation' },
  { id: 35, name: 'Comedy', slug: 'comedy' },
  { id: 80, name: 'Crime', slug: 'crime' },
  { id: 99, name: 'Documentary', slug: 'documentary' },
  { id: 18, name: 'Drama', slug: 'drama' },
  { id: 10751, name: 'Family', slug: 'family' },
  { id: 14, name: 'Fantasy', slug: 'fantasy' },
  { id: 36, name: 'History', slug: 'history' },
  { id: 27, name: 'Horror', slug: 'horror' },
  { id: 10402, name: 'Music', slug: 'music' },
  { id: 9648, name: 'Mystery', slug: 'mystery' },
  { id: 10749, name: 'Romance', slug: 'romance' },
  { id: 878, name: 'Sci-Fi', slug: 'sci-fi' },
  { id: 10770, name: 'TV Movie', slug: 'tv-movie' },
  { id: 53, name: 'Thriller', slug: 'thriller' },
  { id: 10752, name: 'War', slug: 'war' },
  { id: 37, name: 'Western', slug: 'western' }
];

// ✅ Helper: Get genre ID from slug
function getGenreIdFromSlug(slug: string): number | null {
  const genre = genres.find(g => g.slug === slug);
  return genre ? genre.id : null;
}

// ✅ Helper: Get genre name from slug
function getGenreNameFromSlug(slug: string): string | null {
  const genre = genres.find(g => g.slug === slug);
  return genre ? genre.name : null;
}

// ✅ Helper: Check if item is TV show
function isTVShow(item: any): boolean {
  return item.media_type === 'tv' || item.first_air_date !== undefined;
}

// ✅ Helper: Get title from movie or TV show
function getItemTitle(item: any): string {
  return item.title || item.name || "Untitled";
}

// ✅ Helper: Get year from movie or TV show
function getItemYear(item: any): string {
  return (item.release_date?.split("-")[0]) || 
         (item.first_air_date?.split("-")[0]) || 
         "N/A";
}

// ✅ Helper: Get slug for movie or TV show
function getItemSlug(item: any): string {
  const title = getItemTitle(item);
  const isTV = isTVShow(item);
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return isTV ? `/tv/${slug}-${item.id}` : `/${slug}-${item.id}`;
}

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 30 }, (_, i) => (currentYear - i).toString());

const languages = [
  { code: 'en', name: 'English' }, { code: 'es', name: 'Spanish' }, { code: 'fr', name: 'French' },
  { code: 'ja', name: 'Japanese' }, { code: 'ko', name: 'Korean' }, { code: 'it', name: 'Italian' },
  { code: 'de', name: 'German' }, { code: 'zh', name: 'Chinese' }, { code: 'hi', name: 'Hindi' },
];

export default function GenrePage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // ✅ Store slug and genre info
  const [slug, setSlug] = useState<string | null>(null);
  const [genreId, setGenreId] = useState<number | null>(null);
  const [genreName, setGenreName] = useState<string>("");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  
  // Temporary filter states (only applied when clicking Apply)
  const [tempSortBy, setTempSortBy] = useState('popularity.desc');
  const [tempSelectedYear, setTempSelectedYear] = useState('');
  const [tempSelectedLanguage, setTempSelectedLanguage] = useState('');
  
  // Active filter states (actually applied to API)
  const [activeSortBy, setActiveSortBy] = useState('popularity.desc');
  const [activeSelectedYear, setActiveSelectedYear] = useState('');
  const [activeSelectedLanguage, setActiveSelectedLanguage] = useState('');
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const observerTarget = useRef<HTMLDivElement>(null);

  // ✅ Load params and get genre info
  useEffect(() => {
    async function loadParams() {
      const resolvedParams = await params;
      const slugValue = resolvedParams.slug;
      setSlug(slugValue);
      
      const id = getGenreIdFromSlug(slugValue);
      if (id) {
        setGenreId(id);
        const name = getGenreNameFromSlug(slugValue);
        if (name) setGenreName(name);
      } else {
        setGenreName(slugValue.charAt(0).toUpperCase() + slugValue.slice(1));
      }
    }
    loadParams();
  }, [params]);

  // ✅ Fetch both movies and TV shows
  const fetchItems = useCallback(async (pageNum: number, reset: boolean = false) => {
    if (!genreId) return;
    
    setLoading(true);
    
    try {
      const API_KEY = "ab7ec4451ddd6ddd90cfa65ba80478f5";
      
      // Fetch movies
      const movieUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&sort_by=${activeSortBy}&page=${pageNum}`;
      
      // Fetch TV shows
      const tvUrl = `https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&with_genres=${genreId}&sort_by=${activeSortBy}&page=${pageNum}`;
      
      if (activeSelectedYear) {
        // Movies use primary_release_year, TV uses first_air_date_year
        // We'll filter client-side for TV shows
      }
      if (activeSelectedLanguage) {
        // Movies use original_language, TV uses original_language
        // We'll filter client-side
      }
      
      const [movieRes, tvRes] = await Promise.all([
        fetch(movieUrl).then(r => r.json()),
        fetch(tvUrl).then(r => r.json())
      ]);
      
      const movieResults = movieRes.results?.map((m: any) => ({ ...m, media_type: 'movie' })) || [];
      const tvResults = tvRes.results?.map((t: any) => ({ ...t, media_type: 'tv' })) || [];
      
      // Merge and deduplicate
      const merged = [...movieResults, ...tvResults].filter(item => 
        item.poster_path || item.backdrop_path
      );
      
      if (reset) {
        setTotalResults(movieRes.total_results + tvRes.total_results);
        setItems(merged);
      } else {
        setItems(prev => [...prev, ...merged]);
      }
      
      const maxPages = Math.max(movieRes.total_pages || 0, tvRes.total_pages || 0);
      setHasMore(pageNum < maxPages && merged.length > 0);
      setPage(pageNum);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [genreId, activeSortBy]);

  // Initial fetch when genre loads
  useEffect(() => {
    if (!genreId) return;
    setPage(1);
    setItems([]);
    fetchItems(1, true);
  }, [genreId, fetchItems]);

  // ✅ Infinite scroll
  useEffect(() => {
    if (!genreId) return;
    
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          fetchItems(page + 1, false);
        }
      },
      { threshold: 0.1 }
    );
    
    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }
    
    return () => observer.disconnect();
  }, [loading, hasMore, page, fetchItems, genreId]);

  // ✅ Client-side filtering for year and language
  useEffect(() => {
    if (items.length === 0) return;
    
    let filtered = [...items];
    
    if (activeSelectedYear) {
      filtered = filtered.filter(item => {
        const year = item.release_date?.split("-")[0] || item.first_air_date?.split("-")[0];
        return year === activeSelectedYear;
      });
    }
    
    if (activeSelectedLanguage) {
      filtered = filtered.filter(item => item.original_language === activeSelectedLanguage);
    }
    
    setItems(filtered);
  }, [activeSelectedYear, activeSelectedLanguage]);

  // Apply filters
  const applyFilters = () => {
    setActiveSortBy(tempSortBy);
    setActiveSelectedYear(tempSelectedYear);
    setActiveSelectedLanguage(tempSelectedLanguage);
    setIsFilterOpen(false);
    setPage(1);
    setItems([]);
    fetchItems(1, true);
  };

  // Reset filters
  const resetFilters = () => {
    setTempSortBy('popularity.desc');
    setTempSelectedYear('');
    setTempSelectedLanguage('');
    setActiveSortBy('popularity.desc');
    setActiveSelectedYear('');
    setActiveSelectedLanguage('');
    setIsFilterOpen(false);
    setPage(1);
    setItems([]);
    fetchItems(1, true);
  };

  // Open filter panel
  const openFilterPanel = () => {
    setTempSortBy(activeSortBy);
    setTempSelectedYear(activeSelectedYear);
    setTempSelectedLanguage(activeSelectedLanguage);
    setIsFilterOpen(true);
  };

  const activeFiltersCount = [activeSelectedYear, activeSelectedLanguage, activeSortBy !== 'popularity.desc' ? 'sort' : null].filter(Boolean).length;

  // ✅ Loading state
  if (loading && items.length === 0) {
    return <Loading />;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#05050A] to-black text-white pt-20 md:pt-24 pb-16 px-6 md:px-16 lg:px-24">
      <div className="max-w-7xl mx-auto">
        {/* Back Button & Breadcrumbs */}
        <div className="mb-6">
          <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4">
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
          <div className="text-sm text-gray-400">
            <Link href="/" className="hover:text-[#E50914] transition">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-[#E50914]">{genreName}</span>
          </div>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter mb-3 text-white">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DC2626] to-[#b50000]">
                {genreName}
              </span> Movies & TV Shows
            </h1>
            <p className="text-gray-400 text-sm">
              Found <span className="text-white font-semibold">{totalResults}</span> titles in this genre
            </p>
          </div>
          
          <button
            onClick={openFilterPanel}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-bold uppercase tracking-wider text-sm transition-all shadow-lg ${
              isFilterOpen || activeFiltersCount > 0
                ? 'bg-[#b50000] text-white' 
                : 'bg-[#0F0F1A] border border-[#1F2937] text-white hover:border-gray-500'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="ml-1 bg-white text-[#b50000] rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full mb-8 overflow-hidden"
            >
              <div className="bg-[#0F0F1A] border border-[#1F2937] rounded-2xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Sort By */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Sort By</h4>
                    <div className="space-y-1">
                      {sortOptions.map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => setTempSortBy(opt.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${tempSortBy === opt.id ? 'bg-[#b50000] text-white' : 'text-gray-400 hover:bg-[#1F2937] hover:text-white'}`}
                        >
                          {opt.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Year */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Year</h4>
                      {tempSelectedYear && <button onClick={() => setTempSelectedYear('')} className="text-xs text-red-400">Clear</button>}
                    </div>
                    <div className="grid grid-cols-2 gap-1 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {yearOptions.map(y => (
                        <button
                          key={y}
                          onClick={() => setTempSelectedYear(y)}
                          className={`px-2 py-2 rounded-lg text-xs text-center transition-colors ${tempSelectedYear === y ? 'bg-[#b50000] text-white' : 'text-gray-400 hover:bg-[#1F2937] hover:text-white'}`}
                        >
                          {y}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Language */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Language</h4>
                      {tempSelectedLanguage && <button onClick={() => setTempSelectedLanguage('')} className="text-xs text-red-400">Clear</button>}
                    </div>
                    <div className="space-y-1 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {languages.map(lang => (
                        <button
                          key={lang.code}
                          onClick={() => setTempSelectedLanguage(lang.code)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${tempSelectedLanguage === lang.code ? 'bg-[#b50000] text-white' : 'text-gray-400 hover:bg-[#1F2937] hover:text-white'}`}
                        >
                          {lang.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6 pt-4 border-t border-[#1F2937]">
                  <button
                    onClick={applyFilters}
                    className="flex-1 px-4 py-2 rounded-lg bg-[#b50000] text-white text-sm font-bold transition-colors hover:bg-[#8b0000]"
                  >
                    Apply Filters
                  </button>
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 rounded-lg border border-[#1F2937] text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    Reset All
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {activeSelectedYear && (
              <span className="px-3 py-1.5 rounded-full bg-[#b50000] text-white text-xs font-medium flex items-center gap-1">
                Year: {activeSelectedYear}
                <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => {
                  setActiveSelectedYear('');
                  setTempSelectedYear('');
                  setPage(1);
                  setItems([]);
                  fetchItems(1, true);
                }} />
              </span>
            )}
            {activeSelectedLanguage && (
              <span className="px-3 py-1.5 rounded-full bg-[#b50000] text-white text-xs font-medium flex items-center gap-1">
                {languages.find(l => l.code === activeSelectedLanguage)?.name}
                <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => {
                  setActiveSelectedLanguage('');
                  setTempSelectedLanguage('');
                  setPage(1);
                  setItems([]);
                  fetchItems(1, true);
                }} />
              </span>
            )}
            {activeSortBy !== 'popularity.desc' && (
              <span className="px-3 py-1.5 rounded-full bg-[#b50000] text-white text-xs font-medium flex items-center gap-1">
                Sort: {sortOptions.find(opt => opt.id === activeSortBy)?.name}
                <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => {
                  setActiveSortBy('popularity.desc');
                  setTempSortBy('popularity.desc');
                  setPage(1);
                  setItems([]);
                  fetchItems(1, true);
                }} />
              </span>
            )}
          </div>
        )}

        {/* Sort Info */}
        <div className="mb-6 pb-3 border-b border-[#1F2937] flex justify-end">
          <span className="text-xs text-gray-500">
            Sorted by: <span className="text-[#b50000]">{sortOptions.find(opt => opt.id === activeSortBy)?.name}</span>
          </span>
        </div>

        {/* Grid */}
        {items.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
              {items.map((item, idx) => {
                const isTV = isTVShow(item);
                const title = getItemTitle(item);
                const year = getItemYear(item);
                const slug = getItemSlug(item);
                const rating = item.vote_average || 0;
                
                const topGenres = item.genre_ids
                  ?.slice(0, 2)
                  .map((id: number) => genres.find(g => g.id === id)?.name)
                  .filter(Boolean) || [];

                return (
                  <Link
                    key={`${item.id}-${idx}`}
                    href={slug}
                    className="group relative block rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  >
                    <div className="aspect-[2/3] relative bg-gradient-to-br from-[#1F2937] to-[#0F0F1A]">
                      {item.poster_path ? (
                        <Image
                          src={`https://image.tmdb.org/t/p/w342${item.poster_path}`}
                          alt={title}
                          fill
                          className="object-cover transition-all duration-500 group-hover:scale-110"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                          </svg>
                        </div>
                      )}

                      {/* ✅ TV Show Badge */}
                      {isTV ? (
                        <div className="absolute top-2 left-2 z-10">
                          <div className="flex items-center gap-1 bg-gradient-to-r from-red-800 to-red-600 px-2 py-0.5 rounded-md shadow-lg">
                            <Tv className="w-3 h-3 text-white" />
                            <span className="text-[8px] md:text-[9px] font-bold text-white uppercase tracking-wider">
                              TV Show
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="absolute top-2 left-2 z-10">
                          <div className="flex items-center gap-1 bg-gradient-to-r from-blue-700 to-blue-500 px-2 py-0.5 rounded-md shadow-lg">
                            <Film className="w-3 h-3 text-white" />
                            <span className="text-[8px] md:text-[9px] font-bold text-white uppercase tracking-wider">
                              Movie
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Rating Badge */}
                      <div className="absolute top-2 right-2 z-10 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md">
                        <div className="flex items-center gap-0.5">
                          <span className="text-yellow-400 text-[10px]">★</span>
                          <span className="text-white font-bold text-[9px] md:text-[10px]">
                            {rating ? rating.toFixed(1) : "N/A"}
                          </span>
                        </div>
                      </div>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                        <h3 className="text-white font-bold text-xs line-clamp-2">{title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            <svg className="w-3 h-3 text-yellow-500 fill-yellow-500" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                            <span className="text-yellow-500 text-xs font-bold">{rating.toFixed(1)}</span>
                          </div>
                          {year && <span className="text-gray-400 text-xs">{year}</span>}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            
            {/* Infinite Scroll Loader */}
            <div ref={observerTarget} className="w-full flex items-center justify-center py-12">
              {loading && items.length > 0 && (
                <div className="w-8 h-8 border-4 border-[#1F2937] border-t-[#b50000] rounded-full animate-spin"></div>
              )}
              {!hasMore && items.length > 0 && (
                <p className="text-gray-500 text-sm">End of results — {totalResults} titles found</p>
              )}
            </div>
          </>
        ) : (
          !loading && (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">No titles found in {genreName} genre.</p>
              <p className="text-gray-500 text-sm mt-2">Try adjusting your filters or browse other genres.</p>
            </div>
          )
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1F2937;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #b50000;
          border-radius: 10px;
        }
      `}</style>
    </main>
  );
}