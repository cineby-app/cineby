'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from "next/link";
import Image from "next/image";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { InfiniteMovieRows } from "@/components/InfiniteMovieRows";
import { fetchInfiniteMovies } from "@/lib/tmdb";

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

export default function Home() {
  const [initialMovies, setInitialMovies] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [heroMovie, setHeroMovie] = useState<any>(null);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);
  
  // Filter states
  const [sortBy, setSortBy] = useState('popularity.desc');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');

  // Load initial movies for sliders and hero background
  useEffect(() => {
    async function loadInitial() {
      const movies = await fetchInfiniteMovies();
      setInitialMovies(movies);
      
      try {
        const trendingRes = await fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=ab7ec4451ddd6ddd90cfa65ba80478f5`);
        const trendingData = await trendingRes.json();
        const trending = trendingData.results?.filter((m: any) => m.backdrop_path) || [];
        if (trending.length > 0) {
          const randomIndex = Math.floor(Math.random() * trending.length);
          setHeroMovie(trending[randomIndex]);
        }
      } catch (error) {
        console.error('Error fetching trending movies:', error);
      }
    }
    loadInitial();
  }, []);

  const fetchSearchResults = useCallback(async (pageNum: number, reset: boolean = false) => {
    setLoading(true);
    
    try {
      let url = '';
      
      // If there's a search query, use the search endpoint
      if (searchQuery.trim()) {
        url = `https://api.themoviedb.org/3/search/movie?api_key=ab7ec4451ddd6ddd90cfa65ba80478f5&query=${encodeURIComponent(searchQuery)}&page=${pageNum}`;
        
        // Add sort parameter for search (sort_by is not officially supported but works)
        if (sortBy !== 'popularity.desc') {
          url += `&sort_by=${sortBy}`;
        }
      } else {
        // Otherwise use discover endpoint with filters
        url = `https://api.themoviedb.org/3/discover/movie?api_key=ab7ec4451ddd6ddd90cfa65ba80478f5&sort_by=${sortBy}&page=${pageNum}`;
        if (selectedGenre) url += `&with_genres=${selectedGenre}`;
        if (selectedYear) url += `&primary_release_year=${selectedYear}`;
        if (selectedLanguage) url += `&with_original_language=${selectedLanguage}`;
      }
      
      const res = await fetch(url);
      const data = await res.json();
      const movies = data.results?.filter((m: any) => m.poster_path) || [];
      
      if (reset) {
        setTotalResults(data.total_results || 0);
        setSearchResults(movies);
      } else {
        setSearchResults(prev => [...prev, ...movies]);
      }
      
      setHasMore(pageNum < data.total_pages);
      setCurrentPage(pageNum);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, sortBy, selectedGenre, selectedYear, selectedLanguage]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearchModalOpen(false);
    setIsSearching(true);
    setCurrentPage(1);
    setSearchResults([]);
    await fetchSearchResults(1, true);
  };

  const applyFilters = async () => {
    setIsFilterOpen(false);
    setIsSearching(true);
    setCurrentPage(1);
    setSearchResults([]);
    await fetchSearchResults(1, true);
  };

  // Infinite scroll for search results
  useEffect(() => {
    if (!isSearching || loading || !hasMore) return;
    
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          fetchSearchResults(currentPage + 1, false);
        }
      },
      { threshold: 0.1 }
    );
    
    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }
    
    return () => observer.disconnect();
  }, [isSearching, loading, hasMore, currentPage, fetchSearchResults]);

  const clearSearch = () => {
    setIsSearching(false);
    setSearchResults([]);
    setSearchQuery('');
    setSelectedGenre('');
    setSelectedYear('');
    setSelectedLanguage('');
    setSortBy('popularity.desc');
    setTotalResults(0);
    setCurrentPage(1);
    setHasMore(false);
  };

  const activeFiltersCount = [selectedGenre, selectedYear, selectedLanguage].filter(Boolean).length;

  const getResultTitle = () => {
    if (searchQuery) {
      return `Results for "${searchQuery}"`;
    }
    let titleParts = [];
    if (selectedGenre) titleParts.push(genres.find(g => g.id.toString() === selectedGenre)?.name);
    if (selectedYear) titleParts.push(selectedYear);
    if (selectedLanguage) titleParts.push(languages.find(l => l.code === selectedLanguage)?.name);
    if (titleParts.length > 0) return titleParts.join(' ') + ' Movies';
    return 'Filtered Movies';
  };

  return (
    <main className="w-full bg-[#05050A] overflow-x-hidden min-h-screen relative selection:bg-[#b50000] selection:text-white">
      
      {/* Pattern Squares Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Hero Section */}
      <section className="relative w-full min-h-[60vh] md:min-h-[70vh] lg:min-h-[80vh] overflow-hidden">
        {heroMovie && (
          <>
            <div className="absolute inset-0 z-0">
              <Image
                src={`https://image.tmdb.org/t/p/original${heroMovie.backdrop_path}`}
                alt={heroMovie.title}
                fill
                className="object-cover scale-105"
                priority
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#05050A] via-[#05050A]/80 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#05050A] via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-l from-[#05050A]/40 via-transparent to-transparent" />
            </div>
            
            {/* Pattern squares OVER the background image */}
            <div className="absolute inset-0 z-[1] pointer-events-none" style={{
              backgroundImage: `
                linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px'
            }} />
            
            <div className="absolute inset-0 z-[2] pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#E50914]/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#b50000]/15 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>
          </>
        )}
        
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] md:min-h-[75vh] lg:min-h-[90vh] px-6 text-center">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tighter text-white uppercase drop-shadow-2xl mb-4 md:mb-6">
              Built For Cinema <br /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#b50000] to-[#b50000]">
                Lovers
              </span>
            </h1>
            <p className="text-gray-300 text-sm sm:text-base md:text-lg lg:text-xl font-mono uppercase tracking-[0.2em] max-w-2xl mx-auto mb-8 md:mb-12 px-4">
              Scroll an infinite cinematic canvas. Discover your next favorite movie.
            </p>
            
            {/* Buttons Container */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {/* <button
                onClick={() => setIsSearchModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 rounded-full bg-[#b50000] hover:bg-[#e00000] text-white font-bold uppercase tracking-wider text-sm md:text-base transition-all shadow-xl hover:scale-105 duration-300"
              >
                <Search className="w-4 h-4 md:w-5 md:h-5" />
                Search Movies
              </button> */}
              
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 rounded-full font-bold uppercase tracking-wider text-sm md:text-base transition-all shadow-xl hover:scale-105 duration-300 ${
                  isFilterOpen || activeFiltersCount > 0 || sortBy !== 'popularity.desc'
                    ? 'bg-white text-[#b50000] border border-[#b50000]' 
                    : 'bg-[#b50000] border border-[#b50000] text-white hover:border-gray-500'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4 md:w-5 md:h-5" />
                Movies Filters
                {activeFiltersCount > 0 && (
                  <span className="ml-1 bg-white text-[#b50000] rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Panel - Professional Design */}
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="relative z-20 max-w-7xl mx-auto px-6 md:px-16 lg:px-24 overflow-hidden"
          >
            <div className="bg-[#0F0F1A] border border-[#1F2937] rounded-2xl p-6 md:p-10 shadow-2xl mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Sort By */}
                <div>
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Sort By</h4>
                  <div className="flex flex-col gap-2">
                    {sortOptions.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setSortBy(opt.id)}
                        className={`text-left px-4 py-2 rounded-lg text-sm font-bold transition-colors ${sortBy === opt.id ? 'bg-[#b50000] text-white' : 'text-gray-400 hover:bg-[#1F2937] hover:text-white'}`}
                      >
                        {opt.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Genre */}
                <div>
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Genre</h4>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-500">Pick one</span>
                    {selectedGenre && <button onClick={() => setSelectedGenre('')} className="text-xs text-red-400 hover:text-red-300">Clear</button>}
                  </div>
                  <div className="flex flex-col gap-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                    {genres.map(g => (
                      <button
                        key={g.id}
                        onClick={() => setSelectedGenre(g.id.toString())}
                        className={`text-left px-4 py-2 rounded-lg text-sm font-bold transition-colors ${selectedGenre === g.id.toString() ? 'bg-[#b50000] text-white' : 'text-gray-400 hover:bg-[#1F2937] hover:text-white'}`}
                      >
                        {g.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Year */}
                <div>
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Year</h4>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-500">Pick one</span>
                    {selectedYear && <button onClick={() => setSelectedYear('')} className="text-xs text-red-400 hover:text-red-300">Clear</button>}
                  </div>
                  <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                    {yearOptions.map(y => (
                      <button
                        key={y}
                        onClick={() => setSelectedYear(y)}
                        className={`px-2 py-2 rounded-lg text-xs font-bold transition-colors ${selectedYear === y ? 'bg-[#b50000] text-white' : 'bg-[#1A1A24] text-gray-400 hover:bg-[#1F2937] hover:text-white'}`}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language */}
                <div>
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Language</h4>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-500">Original Language</span>
                    {selectedLanguage && <button onClick={() => setSelectedLanguage('')} className="text-xs text-red-400 hover:text-red-300">Clear</button>}
                  </div>
                  <div className="flex flex-col gap-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                    {languages.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => setSelectedLanguage(lang.code)}
                        className={`text-left px-4 py-2 rounded-lg text-sm font-bold transition-colors ${selectedLanguage === lang.code ? 'bg-[#b50000] text-white' : 'text-gray-400 hover:bg-[#1F2937] hover:text-white'}`}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-8 pt-4 border-t border-[#1F2937]">
                <button
                  onClick={applyFilters}
                  className="flex-1 py-3 bg-gradient-to-r from-[#DC2626] to-[#b50000] hover:from-[#b50000] hover:to-[#9D174D] text-white font-bold rounded-xl transition-all duration-300 shadow-lg"
                >
                  Apply Filters
                </button>
                <button
                  onClick={() => {
                    setSortBy('popularity.desc');
                    setSelectedGenre('');
                    setSelectedYear('');
                    setSelectedLanguage('');
                  }}
                  className="px-6 py-3 rounded-xl border border-[#1F2937] text-gray-400 hover:text-white hover:border-[#b50000] transition-all"
                >
                  Reset
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The Infinite Canvas - Sliders */}
      {!isSearching && initialMovies.length > 0 && (
        <section className="relative z-20 bg-transparent pb-16">
          <InfiniteMovieRows movies={initialMovies} />
        </section>
      )}

      {/* Search/Filter Results Section */}
      {isSearching && (
        <section className="relative z-20 bg-transparent px-6 md:px-16 lg:px-24 py-8 md:py-12">
          <div className="max-w-7xl mx-auto">
            {/* Results Header */}
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight text-white">
                  {getResultTitle()}
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  Found <span className="text-white font-semibold">{totalResults}</span> movie{totalResults !== 1 ? 's' : ''}
                </p>
                {activeFiltersCount > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedGenre && (
                      <span className="px-2 py-1 rounded-full bg-[#b50000]/20 text-[#b50000] text-xs">
                        {genres.find(g => g.id.toString() === selectedGenre)?.name}
                      </span>
                    )}
                    {selectedYear && (
                      <span className="px-2 py-1 rounded-full bg-[#b50000]/20 text-[#b50000] text-xs">
                        {selectedYear}
                      </span>
                    )}
                    {selectedLanguage && (
                      <span className="px-2 py-1 rounded-full bg-[#b50000]/20 text-[#b50000] text-xs">
                        {languages.find(l => l.code === selectedLanguage)?.name}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={clearSearch}
                className="px-5 md:px-6 py-2 rounded-full bg-[#0F0F1A] border border-[#1F2937] text-gray-300 hover:text-white text-sm font-medium transition-colors hover:border-[#b50000]"
              >
                Back to Sliders
              </button>
            </div>

            {/* Sort info */}
            <div className="mb-6 pb-3 border-b border-[#1F2937] flex justify-end">
              <span className="text-xs text-gray-500">
                Sorted by: <span className="text-[#b50000]">{sortOptions.find(opt => opt.id === sortBy)?.name}</span>
              </span>
            </div>

            {/* Results Grid */}
            {loading && searchResults.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-[#1F2937] border-t-[#b50000] rounded-full animate-spin"></div>
              </div>
            ) : searchResults.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                  {searchResults.map((movie, idx) => {
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
                                <svg className="w-3 h-3 text-[#E50914]" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                                <span className="text-[#E50914] text-xs font-bold">{movie.vote_average.toFixed(1)}</span>
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
                  {loading && searchResults.length > 0 && (
                    <div className="w-8 h-8 border-4 border-[#1F2937] border-t-[#b50000] rounded-full animate-spin"></div>
                  )}
                  {!hasMore && searchResults.length > 0 && searchResults.length === totalResults && totalResults > 0 && (
                    <p className="text-gray-500 text-sm">🎬 You've reached the end — {totalResults} movies found</p>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-20">
                <p className="text-gray-400 text-lg">No movies found.</p>
                <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filters.</p>
                <button
                  onClick={clearSearch}
                  className="mt-6 px-6 py-2 rounded-full bg-[#b50000] text-white text-sm font-bold hover:bg-[#9D174D] transition-colors"
                >
                  Back to Sliders
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Search Modal */}
      <AnimatePresence>
        {isSearchModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setIsSearchModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-br from-[#0F0F1A] to-black rounded-2xl border border-[#1F2937] p-6 md:p-8 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-white">Search Movies</h2>
                  <button
                    onClick={() => setIsSearchModalOpen(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    placeholder="Enter movie title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-12 pr-4 py-3 md:py-4 bg-[#1A1A2E] border border-[#1F2937] rounded-xl text-white text-base md:text-lg focus:outline-none focus:border-[#b50000] transition-colors"
                    autoFocus
                  />
                </div>

                <button
                  onClick={handleSearch}
                  className="w-full mt-6 py-3 md:py-4 bg-gradient-to-r from-[#DC2626] to-[#b50000] hover:from-[#b50000] hover:to-[#9D174D] text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Search
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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