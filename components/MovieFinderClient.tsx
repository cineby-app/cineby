'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, SlidersHorizontal, ChevronDown, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Movie, slugify } from '@/lib/tmdb';

interface Genre {
  id: number;
  name: string;
}

interface MovieFinderClientProps {
  genres: Genre[];
  initialQuery?: string;
  hideHeader?: boolean;
}

export function MovieFinderClient({ genres, initialQuery = '', hideHeader = false }: MovieFinderClientProps) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState('popularity.desc');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  const fetchResults = useCallback(async (pageNum: number, reset: boolean = false) => {
    try {
      setLoading(true);
      let url = '';
      
      if (debouncedQuery.trim()) {
        url = `https://api.themoviedb.org/3/search/movie?api_key=ab7ec4451ddd6ddd90cfa65ba80478f5&query=${encodeURIComponent(debouncedQuery)}&page=${pageNum}`;
      } else {
        url = `https://api.themoviedb.org/3/discover/movie?api_key=ab7ec4451ddd6ddd90cfa65ba80478f5&sort_by=${sortBy}&page=${pageNum}`;
        if (selectedGenre) url += `&with_genres=${selectedGenre}`;
        if (selectedYear) url += `&primary_release_year=${selectedYear}`;
        if (selectedLanguage) url += `&with_original_language=${selectedLanguage}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      
      const newMovies = data.results?.filter((m: Movie) => m.poster_path && m.backdrop_path) || [];
      
      if (newMovies.length === 0 || pageNum >= data.total_pages) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      if (reset) {
        setMovies(newMovies);
      } else {
        setMovies(prev => [...prev, ...newMovies].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i));
      }
    } catch (e) {
      console.error('Fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, sortBy, selectedGenre, selectedYear, selectedLanguage]);

  // Reset and fetch when dependencies change
  useEffect(() => {
    setPage(1);
    fetchResults(1, true);
  }, [fetchResults]);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          setPage(p => {
            const next = p + 1;
            fetchResults(next, false);
            return next;
          });
        }
      },
      { threshold: 0.1 }
    );
    
    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }
    
    return () => observer.disconnect();
  }, [loading, hasMore, fetchResults]);

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 30 }, (_, i) => (currentYear - i).toString());

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'it', name: 'Italian' },
    { code: 'de', name: 'German' },
    { code: 'zh', name: 'Chinese' },
    { code: 'hi', name: 'Hindi' },
  ];

  const sortOptions = [
    { id: 'popularity.desc', name: 'Popularity' },
    { id: 'vote_average.desc', name: 'Top Rated' },
    { id: 'revenue.desc', name: 'Highest Revenue' },
    { id: 'primary_release_date.desc', name: 'Newest First' },
    { id: 'primary_release_date.asc', name: 'Oldest First' },
  ];

  return (
    <div className={`w-full ${hideHeader ? 'py-0 space-y-8' : 'min-h-screen bg-[#05050A] text-[#F3F4F6] selection:bg-[#BE185D] selection:text-white pt-24 md:pt-32 pb-24'} px-6 md:px-16 lg:px-24`}>
      <div className={`max-w-7xl mx-auto flex flex-col ${hideHeader ? 'items-start' : 'items-center'} mb-16 px-4`}>
        {!hideHeader && (
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter uppercase drop-shadow-lg text-center mb-6">
            Advanced <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#BE185D] to-[#9D174D]">Finder</span>
          </h1>
        )}
        
        <div className={`w-full ${hideHeader ? 'max-w-7xl' : 'max-w-3xl'} flex flex-col md:flex-row gap-4 relative z-20`}>
           <div className="relative flex-1">
             <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
               <Search className="h-6 w-6 text-gray-500" />
             </div>
             <input
               type="text"
               placeholder="Search by movie title..."
               value={query}
               onChange={(e) => setQuery(e.target.value)}
               className="w-full pl-16 pr-6 py-4 md:py-5 bg-[#0F0F1A] border border-[#1F2937] rounded-full text-base md:text-lg text-white font-bold focus:outline-none focus:border-[#BE185D] transition-colors shadow-2xl"
             />
           </div>
           
           <button
             onClick={() => setIsFilterOpen(!isFilterOpen)}
             className={`flex items-center justify-center gap-3 px-8 py-4 md:py-5 rounded-full font-bold uppercase tracking-wider text-sm transition-all shadow-xl
               ${isFilterOpen || selectedGenre || selectedYear || selectedLanguage || sortBy !== 'popularity.desc'
                 ? 'bg-[#BE185D] text-white border border-[#BE185D]' 
                 : 'bg-[#0F0F1A] border border-[#1F2937] text-white hover:border-gray-500'
               }`}
           >
             <SlidersHorizontal className="w-5 h-5" />
             <span className="hidden md:inline">Filters</span>
           </button>
        </div>
      </div>

      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full max-w-7xl mx-auto mb-16 overflow-hidden relative z-10"
          >
            <div className="bg-[#0F0F1A] border border-[#1F2937] rounded-2xl p-6 md:p-10 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Check if user is searching – discovery filters disable when searching TMDB */}
                {query.trim().length > 0 && (
                  <div className="col-span-full mb-4 p-4 rounded-lg bg-[#DC2626]/10 border border-[#DC2626]/20 text-[#DC2626] font-mono text-sm text-center">
                    Advanced filters (Sort, Genre, Year) are disabled while searching by title. Clear search to use filters.
                  </div>
                )}
                
                <div className={query.length > 0 ? 'opacity-30 pointer-events-none' : ''}>
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Sort By</h4>
                  <div className="flex flex-col gap-2">
                    {sortOptions.map(opt => (
                      <button
                         key={opt.id}
                         onClick={() => setSortBy(opt.id)}
                         className={`text-left px-4 py-2 rounded-lg text-sm font-bold transition-colors ${sortBy === opt.id ? 'bg-[#BE185D] text-white' : 'text-gray-400 hover:bg-[#1F2937] hover:text-white'}`}
                      >
                         {opt.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className={query.length > 0 ? 'opacity-30 pointer-events-none' : ''}>
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
                         className={`text-left px-4 py-2 rounded-lg text-sm font-bold transition-colors ${selectedGenre === g.id.toString() ? 'bg-[#BE185D] text-white' : 'text-gray-400 hover:bg-[#1F2937] hover:text-white'}`}
                      >
                         {g.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={query.length > 0 ? 'opacity-30 pointer-events-none' : ''}>
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Year</h4>
                  <div className="flex justify-between items-center mb-2">
                     <span className="text-xs text-gray-500">Pick one</span>
                     {selectedYear && <button onClick={() => setSelectedYear('')} className="text-xs text-red-400 hover:text-red-300">Clear</button>}
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                    {yearOptions.map(y => (
                      <button
                         key={y}
                         onClick={() => setSelectedYear(y)}
                         className={`px-2 py-2 rounded-lg text-xs font-bold transition-colors ${selectedYear === y ? 'bg-[#BE185D] text-white' : 'bg-[#1A1A24] text-gray-400 hover:bg-[#1F2937] hover:text-white'}`}
                      >
                         {y}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={query.length > 0 ? 'opacity-30 pointer-events-none' : ''}>
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
                         className={`text-left px-4 py-2 rounded-lg text-sm font-bold transition-colors ${selectedLanguage === lang.code ? 'bg-[#BE185D] text-white' : 'text-gray-400 hover:bg-[#1F2937] hover:text-white'}`}
                      >
                         {lang.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {movies.map((movie, idx) => {
          const slug = slugify(movie.title, movie.id);
          return (
            <Link
              href={`/${slug}`}
              key={`${movie.id}-${idx}`}
              className="relative block w-full aspect-[2/3] shrink-0 rounded-lg overflow-hidden transition-all duration-300 group hover:scale-105 hover:shadow-[0_10px_30px_rgba(220,38,38,0.2)] hover:ring-1 hover:ring-[#BE185D]/50 bg-[#0F0F1A]"
            >
              <Image
                src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                alt={movie.title}
                fill
                loading="lazy"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                className="object-cover transition-all duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#05050A] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 md:p-4">
                <h3 className="text-white font-bold text-xs md:text-sm leading-tight mb-1">{movie.title}</h3>
                <span className="text-[#BE185D] font-bold text-[10px] md:text-xs tracking-wider">★ {movie.vote_average.toFixed(1)}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {movies.length === 0 && !loading && (
        <div className="w-full py-24 text-center">
           <p className="text-gray-500 font-mono tracking-widest uppercase">No movies found.</p>
        </div>
      )}
      
      {/* Loading Trigger */}
      <div ref={observerTarget} className="w-full h-24 flex items-center justify-center mt-12">
        {loading && (
          <div className="w-8 h-8 border-4 border-[#1F2937] border-t-[#BE185D] rounded-full animate-spin"></div>
        )}
      </div>
    </div>
  );
}
