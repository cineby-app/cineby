'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from "next/image";
import Link from "next/link";
import { SlidersHorizontal, X, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Sort options
const sortOptions = [
  { id: 'popularity.desc', name: 'Popularity' },
  { id: 'vote_average.desc', name: 'Top Rated' },
  { id: 'revenue.desc', name: 'Highest Revenue' },
  { id: 'primary_release_date.desc', name: 'Newest First' },
  { id: 'primary_release_date.asc', name: 'Oldest First' },
];

// Genre list
const genres = [
  { id: 28, name: 'Action' }, { id: 12, name: 'Adventure' }, { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' }, { id: 80, name: 'Crime' }, { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' }, { id: 10751, name: 'Family' }, { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' }, { id: 27, name: 'Horror' }, { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' }, { id: 10749, name: 'Romance' }, { id: 878, name: 'Sci-Fi' },
  { id: 10770, name: 'TV Movie' }, { id: 53, name: 'Thriller' }, { id: 10752, name: 'War' },
  { id: 37, name: 'Western' }
];

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 30 }, (_, i) => (currentYear - i).toString());

const languages = [
  { code: 'en', name: 'English' }, { code: 'es', name: 'Spanish' }, { code: 'fr', name: 'French' },
  { code: 'ja', name: 'Japanese' }, { code: 'ko', name: 'Korean' }, { code: 'it', name: 'Italian' },
  { code: 'de', name: 'German' }, { code: 'zh', name: 'Chinese' }, { code: 'hi', name: 'Hindi' },
];

export default function GenrePage({ params }: { params: Promise<{ genreId: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [genreId, setGenreId] = useState<string | null>(null);
  const [genreName, setGenreName] = useState<string>("");
  const [movies, setMovies] = useState<any[]>([]);
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

  useEffect(() => {
    async function loadParams() {
      const { genreId: id } = await params;
      setGenreId(id);
      
      const nameParam = searchParams.get('name');
      if (nameParam) {
        setGenreName(nameParam);
      } else if (id) {
        const genre = genres.find(g => g.id.toString() === id);
        if (genre) setGenreName(genre.name);
      }
    }
    loadParams();
  }, [params, searchParams]);

  const fetchMovies = useCallback(async (pageNum: number, reset: boolean = false) => {
    if (!genreId) return;
    
    setLoading(true);
    
    try {
      let url = `https://api.themoviedb.org/3/discover/movie?api_key=ab7ec4451ddd6ddd90cfa65ba80478f5&with_genres=${genreId}&sort_by=${activeSortBy}&page=${pageNum}`;
      
      if (activeSelectedYear) url += `&primary_release_year=${activeSelectedYear}`;
      if (activeSelectedLanguage) url += `&with_original_language=${activeSelectedLanguage}`;
      
      const res = await fetch(url);
      const data = await res.json();
      
      const newMovies = data.results?.filter((m: any) => m.poster_path) || [];
      
      if (reset) {
        setTotalResults(data.total_results || 0);
        setMovies(newMovies);
      } else {
        setMovies(prev => [...prev, ...newMovies]);
      }
      
      setHasMore(pageNum < data.total_pages);
      setPage(pageNum);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [genreId, activeSortBy, activeSelectedYear, activeSelectedLanguage]);

  // Initial fetch when genre loads
  useEffect(() => {
    if (!genreId) return;
    setPage(1);
    setMovies([]);
    fetchMovies(1, true);
  }, [genreId, fetchMovies]);

  // Infinite scroll
  useEffect(() => {
    if (!genreId) return;
    
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          fetchMovies(page + 1, false);
        }
      },
      { threshold: 0.1 }
    );
    
    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }
    
    return () => observer.disconnect();
  }, [loading, hasMore, page, fetchMovies, genreId]);

  // Apply filters - moves temp values to active values
  const applyFilters = () => {
    setActiveSortBy(tempSortBy);
    setActiveSelectedYear(tempSelectedYear);
    setActiveSelectedLanguage(tempSelectedLanguage);
    setIsFilterOpen(false);
    setPage(1);
    setMovies([]);
    fetchMovies(1, true);
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
    setMovies([]);
    fetchMovies(1, true);
  };

  // Open filter panel - sync temp values with active values
  const openFilterPanel = () => {
    setTempSortBy(activeSortBy);
    setTempSelectedYear(activeSelectedYear);
    setTempSelectedLanguage(activeSelectedLanguage);
    setIsFilterOpen(true);
  };

  const activeFiltersCount = [activeSelectedYear, activeSelectedLanguage, activeSortBy !== 'popularity.desc' ? 'sort' : null].filter(Boolean).length;

  // Loading state
  if (loading && movies.length === 0) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-[#05050A] to-black text-white pt-28 md:pt-32 pb-16 px-6 md:px-16 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8">
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full bg-[#E50914] blur-xl opacity-20 animate-pulse" />
              <div className="w-16 h-16 border-4 border-[#1F2937] border-t-[#b50000] rounded-full animate-spin mx-auto" />
            </div>
            <p className="text-gray-400 text-lg">Loading {genreName} movies...</p>
          </div>
        </div>
      </main>
    );
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
            <Link href="/finder" className="hover:text-[#E50914] transition">Movies</Link>
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
              </span> Movies
            </h1>
            <p className="text-gray-400 text-sm">
              Found <span className="text-white font-semibold">{totalResults}</span> movies in this genre
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
                  setMovies([]);
                  fetchMovies(1, true);
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
                  setMovies([]);
                  fetchMovies(1, true);
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
                  setMovies([]);
                  fetchMovies(1, true);
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

        {/* Movie Grid */}
        {movies.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
              {movies.map((movie, idx) => {
                const slug = `${movie.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${movie.id}`;
                const year = movie.release_date ? new Date(movie.release_date).getFullYear() : '';
                
                return (
                  <Link
                    key={`${movie.id}-${idx}`}
                    href={`/${slug}`}
                    className="group relative block rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  >
                    <div className="aspect-[2/3] relative bg-gradient-to-br from-[#1F2937] to-[#0F0F1A]">
                      {movie.poster_path ? (
                        <Image
                          src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                          alt={movie.title}
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
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                        <h3 className="text-white font-bold text-xs line-clamp-2">{movie.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            <svg className="w-3 h-3 text-yellow-500 fill-yellow-500" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                            <span className="text-yellow-500 text-xs font-bold">{movie.vote_average?.toFixed(1)}</span>
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
              {loading && movies.length > 0 && (
                <div className="w-8 h-8 border-4 border-[#1F2937] border-t-[#b50000] rounded-full animate-spin"></div>
              )}
              {!hasMore && movies.length > 0 && movies.length === totalResults && totalResults > 0 && (
                <p className="text-gray-500 text-sm">End of results — {totalResults} movies found</p>
              )}
            </div>
          </>
        ) : (
          !loading && (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">No movies found in {genreName} genre.</p>
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