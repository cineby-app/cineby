'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from "next/image";
import Link from "next/link";
import { Search, ChevronLeft, X, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Sort options
const sortOptions = [
  { id: 'popularity.desc', name: 'Popularity' },
  { id: 'vote_average.desc', name: 'Top Rated' },
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

// Genre mapping for display
const TMDB_GENRES: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy",
  80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family",
  14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music",
  9648: "Mystery", 10749: "Romance", 878: "Sci-Fi", 10770: "TV Movie",
  53: "Thriller", 10752: "War", 37: "Western"
};

// Function to highlight search keyword in text
const highlightText = (text: string, keyword: string) => {
  if (!keyword || !text) return text;
  const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) => 
    regex.test(part) ? 
      <span key={i} className="text-white font-bold">{part}</span> : 
      part
  );
};

export default function SearchPage() {
  const params = useParams();
  const router = useRouter();
  const query = params.query as string;
  const decodedQuery = decodeURIComponent(query || '');
  
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [searchInput, setSearchInput] = useState(decodedQuery);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  const observerTarget = useRef<HTMLDivElement>(null);
  
  // TEMP filter states
  const [tempSortBy, setTempSortBy] = useState('popularity.desc');
  const [tempSelectedGenre, setTempSelectedGenre] = useState('');
  const [tempSelectedYear, setTempSelectedYear] = useState('');
  const [tempSelectedLanguage, setTempSelectedLanguage] = useState('');
  
  // ACTIVE filter states
  const [activeSortBy, setActiveSortBy] = useState('popularity.desc');
  const [activeSelectedGenre, setActiveSelectedGenre] = useState('');
  const [activeSelectedYear, setActiveSelectedYear] = useState('');
  const [activeSelectedLanguage, setActiveSelectedLanguage] = useState('');
  
  const activeFiltersCount = [activeSelectedGenre, activeSelectedYear, activeSelectedLanguage, activeSortBy !== 'popularity.desc' ? 'sort' : null].filter(Boolean).length;

  const fetchMovies = useCallback(async (pageNum: number, isLoadMore: boolean = false) => {
    const hasSearchQuery = decodedQuery && decodedQuery.trim().length > 0;
    const hasFilters = activeSelectedGenre || activeSelectedYear || activeSelectedLanguage;
    
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    
    try {
      const API_KEY = 'ab7ec4451ddd6ddd90cfa65ba80478f5';
      let url = '';
      
      if (hasSearchQuery) {
        url = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(decodedQuery)}&page=${pageNum}&include_adult=false`;
      } else if (hasFilters) {
        url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&sort_by=${activeSortBy}&page=${pageNum}&vote_count.gte=50`;
        if (activeSelectedGenre) url += `&with_genres=${activeSelectedGenre}`;
        if (activeSelectedYear) url += `&primary_release_year=${activeSelectedYear}`;
        if (activeSelectedLanguage) url += `&with_original_language=${activeSelectedLanguage}`;
      } else {
        url = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&page=${pageNum}`;
      }
      
      const res = await fetch(url);
      const data = await res.json();
      
      let fetchedMovies = data.results || [];
      
      // Apply filters client-side for search results
      if (hasSearchQuery) {
        if (activeSelectedGenre) {
          fetchedMovies = fetchedMovies.filter((m: any) => 
            m.genre_ids?.includes(Number(activeSelectedGenre))
          );
        }
        if (activeSelectedYear) {
          fetchedMovies = fetchedMovies.filter((m: any) => 
            m.release_date && m.release_date.startsWith(activeSelectedYear)
          );
        }
        if (activeSelectedLanguage) {
          fetchedMovies = fetchedMovies.filter((m: any) => 
            m.original_language === activeSelectedLanguage
          );
        }
      }
      
      // Apply sorting
      if (activeSortBy !== 'popularity.desc') {
        fetchedMovies.sort((a: any, b: any) => {
          if (activeSortBy === 'vote_average.desc') return (b.vote_average || 0) - (a.vote_average || 0);
          if (activeSortBy === 'primary_release_date.desc') {
            return new Date(b.release_date || 0).getTime() - new Date(a.release_date || 0).getTime();
          }
          if (activeSortBy === 'primary_release_date.asc') {
            return new Date(a.release_date || 0).getTime() - new Date(b.release_date || 0).getTime();
          }
          return 0;
        });
      }
      
      // Filter out movies without posters
      fetchedMovies = fetchedMovies.filter((m: any) => m.poster_path);
      
      if (isLoadMore) {
        setMovies(prev => [...prev, ...fetchedMovies]);
      } else {
        setMovies(fetchedMovies);
        setTotalResults(data.total_results || fetchedMovies.length);
        setTotalPages(data.total_pages || 0);
      }
      
      setPage(pageNum);
      setHasMore(pageNum < data.total_pages);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      if (isLoadMore) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  }, [decodedQuery, activeSortBy, activeSelectedGenre, activeSelectedYear, activeSelectedLanguage]);

  // Fetch when dependencies change
  useEffect(() => {
    setPage(1);
    setMovies([]);
    setHasMore(true);
    fetchMovies(1, false);
  }, [decodedQuery, activeSortBy, activeSelectedGenre, activeSelectedYear, activeSelectedLanguage, fetchMovies]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !loading && !loadingMore && hasMore) {
          fetchMovies(page + 1, true);
        }
      },
      { threshold: 0.1 }
    );
    
    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }
    
    return () => observer.disconnect();
  }, [loading, loadingMore, hasMore, page, fetchMovies]);

  const handleNewSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim() !== decodedQuery) {
      setTempSortBy('popularity.desc');
      setTempSelectedGenre('');
      setTempSelectedYear('');
      setTempSelectedLanguage('');
      setActiveSortBy('popularity.desc');
      setActiveSelectedGenre('');
      setActiveSelectedYear('');
      setActiveSelectedLanguage('');
      router.push(`/search/${encodeURIComponent(searchInput.trim())}`);
    }
  };

  const clearSearch = () => {
    setSearchInput('');
    router.push('/');
  };

  const applyFilters = () => {
    setActiveSortBy(tempSortBy);
    setActiveSelectedGenre(tempSelectedGenre);
    setActiveSelectedYear(tempSelectedYear);
    setActiveSelectedLanguage(tempSelectedLanguage);
    setIsFilterOpen(false);
  };

  const resetFilters = () => {
    setTempSortBy('popularity.desc');
    setTempSelectedGenre('');
    setTempSelectedYear('');
    setTempSelectedLanguage('');
    setActiveSortBy('popularity.desc');
    setActiveSelectedGenre('');
    setActiveSelectedYear('');
    setActiveSelectedLanguage('');
    setIsFilterOpen(false);
  };

  const openFilterPanel = () => {
    setTempSortBy(activeSortBy);
    setTempSelectedGenre(activeSelectedGenre);
    setTempSelectedYear(activeSelectedYear);
    setTempSelectedLanguage(activeSelectedLanguage);
    setIsFilterOpen(true);
  };

  const removeFilter = (type: string) => {
    if (type === 'sort') {
      setActiveSortBy('popularity.desc');
      setTempSortBy('popularity.desc');
    } else if (type === 'genre') {
      setActiveSelectedGenre('');
      setTempSelectedGenre('');
    } else if (type === 'year') {
      setActiveSelectedYear('');
      setTempSelectedYear('');
    } else if (type === 'language') {
      setActiveSelectedLanguage('');
      setTempSelectedLanguage('');
    }
  };

  const getTopGenres = (movie: any) => {
    if (!movie.genre_ids || movie.genre_ids.length === 0) return [];
    return movie.genre_ids.slice(0, 2).map((id: number) => TMDB_GENRES[id]).filter(Boolean);
  };

  const getResultText = () => {
    if (totalResults === 0) return 'No movies found';
    if (totalResults === 1) return 'Found 1 movie';
    return `Found ${totalResults.toLocaleString()} movies`;
  };

  const getHeaderTitle = () => {
    if (decodedQuery) {
      return `Search Results for "${decodedQuery}"`;
    }
    if (activeSelectedGenre) {
      const genreName = genres.find(g => g.id.toString() === activeSelectedGenre)?.name;
      return `${genreName} Movies`;
    }
    return 'Popular Movies';
  };

  const displayedCount = movies.length;

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#05050A] to-black text-white pt-24 md:pt-28 pb-16 px-6 md:px-16 lg:px-24">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6">
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
          
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleNewSearch} className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Search for movies..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-12 pr-24 py-4 bg-[#0F0F1A] border border-[#1F2937] rounded-xl text-white text-lg focus:outline-none focus:border-[#b50000] transition-colors"
              />
              <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-2">
                {searchInput && (
                  <button type="button" onClick={clearSearch} className="p-2 text-gray-400 hover:text-white transition">
                    <X className="w-5 h-5" />
                  </button>
                )}
                <button type="submit" className="px-4 py-2 rounded-lg bg-[#b50000] text-white font-medium text-sm transition-all hover:bg-[#8b0000]">
                  Search
                </button>
              </div>
            </form>
            
            <button
              onClick={openFilterPanel}
              className={`flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold uppercase tracking-wider text-sm transition-all shadow-lg ${
                isFilterOpen || activeFiltersCount > 0
                  ? 'bg-[#b50000] text-white' 
                  : 'bg-[#0F0F1A] border border-[#1F2937] text-white hover:border-gray-500'
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="ml-1 bg-white text-[#b50000] rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 overflow-hidden"
            >
              <div className="bg-[#0F0F1A] border border-[#1F2937] rounded-2xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                  
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Genre</h4>
                      {tempSelectedGenre && <button onClick={() => setTempSelectedGenre('')} className="text-xs text-red-400">Clear</button>}
                    </div>
                    <div className="space-y-1 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {genres.map(g => (
                        <button
                          key={g.id}
                          onClick={() => setTempSelectedGenre(g.id.toString())}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${tempSelectedGenre === g.id.toString() ? 'bg-[#b50000] text-white' : 'text-gray-400 hover:bg-[#1F2937] hover:text-white'}`}
                        >
                          {g.name}
                        </button>
                      ))}
                    </div>
                  </div>

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
                  <button onClick={applyFilters} className="flex-1 px-4 py-2 rounded-lg bg-[#b50000] text-white text-sm font-bold transition-colors hover:bg-[#8b0000]">
                    Apply Filters
                  </button>
                  <button onClick={resetFilters} className="px-4 py-2 rounded-lg border border-[#1F2937] text-gray-400 hover:text-white text-sm transition-colors">
                    Reset All
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {activeFiltersCount > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {activeSelectedGenre && (
              <span className="px-3 py-1.5 rounded-full bg-[#b50000] text-white text-xs font-medium flex items-center gap-1">
                {genres.find(g => g.id.toString() === activeSelectedGenre)?.name}
                <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => removeFilter('genre')} />
              </span>
            )}
            {activeSelectedYear && (
              <span className="px-3 py-1.5 rounded-full bg-[#b50000] text-white text-xs font-medium flex items-center gap-1">
                Year: {activeSelectedYear}
                <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => removeFilter('year')} />
              </span>
            )}
            {activeSelectedLanguage && (
              <span className="px-3 py-1.5 rounded-full bg-[#b50000] text-white text-xs font-medium flex items-center gap-1">
                {languages.find(l => l.code === activeSelectedLanguage)?.name}
                <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => removeFilter('language')} />
              </span>
            )}
            {activeSortBy !== 'popularity.desc' && (
              <span className="px-3 py-1.5 rounded-full bg-[#b50000] text-white text-xs font-medium flex items-center gap-1">
                Sort: {sortOptions.find(opt => opt.id === activeSortBy)?.name}
                <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => removeFilter('sort')} />
              </span>
            )}
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
            {decodedQuery ? (
              <>
                Search Results for{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DC2626] to-[#b50000]">
                  "{decodedQuery}"
                </span>
              </>
            ) : getHeaderTitle()}
          </h1>
          <p className="text-gray-400 text-sm">
            Related Movies
          </p>
        </div>

        <div className="mb-6 pb-3 border-b border-[#1F2937] flex justify-end">
          <span className="text-xs text-gray-500">
            Sorted by: <span className="text-[#b50000]">{sortOptions.find(opt => opt.id === activeSortBy)?.name}</span>
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full bg-[#E50914] blur-xl opacity-20 animate-pulse" />
              <div className="w-16 h-16 border-4 border-[#1F2937] border-t-[#b50000] rounded-full animate-spin mx-auto" />
            </div>
            <p className="text-gray-400 text-lg">Loading movies...</p>
          </div>
        ) : movies.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
              {movies.map((movie, idx) => {
                const slug = `${movie.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${movie.id}`;
                const year = movie.release_date ? new Date(movie.release_date).getFullYear() : '';
                const topGenres = getTopGenres(movie);
                
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
                      
                      <div className="absolute top-2 right-2 z-20 flex items-center gap-1 bg-black/70 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded-full shadow-md">
                        <span className="text-yellow-400 text-[10px] md:text-xs">★</span>
                        <span className="text-white font-bold text-[9px] md:text-[11px]">
                          {movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}
                        </span>
                      </div>

                      <div className="absolute inset-0 bg-gradient-to-t from-[#05050A]/95 via-[#05050A]/40 to-transparent opacity-0 transition-opacity duration-500 flex flex-col justify-end p-4 group-hover:opacity-100 z-10">
                        <span className="text-gray-400 text-[11px] font-medium mb-0.5">
                          {year || "N/A"}
                        </span>
                        <h3 className="text-white font-bold text-xs md:text-sm leading-tight mb-2 line-clamp-2">
                          {decodedQuery && highlightText(movie.title, decodedQuery)}
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
                    </div>
                  </Link>
                );
              })}
            </div>
            
            {/* Auto-load trigger */}
            {hasMore && !loading && !loadingMore && (
              <div ref={observerTarget} className="w-full flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-[#1F2937] border-t-[#b50000] rounded-full animate-spin"></div>
              </div>
            )}
            
            {loadingMore && (
              <div className="w-full flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-[#1F2937] border-t-[#b50000] rounded-full animate-spin"></div>
              </div>
            )}
            
            {!hasMore && movies.length > 0 && (
              <div className="text-center mt-12">
                <p className="text-gray-500 text-sm">End of results — {totalResults.toLocaleString()} movies found</p>
              </div>
            )}
          </>
        ) : (
          !loading && (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">No movies found.</p>
              <p className="text-gray-500 text-sm mt-2">Try a different search term or adjust your filters.</p>
            </div>
          )
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #1F2937; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #b50000; border-radius: 10px; }
      `}</style>
    </main>
  );
}