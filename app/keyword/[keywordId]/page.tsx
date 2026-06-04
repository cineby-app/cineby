'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchKeywordDetails } from "@/lib/tmdb";
import Image from "next/image";
import Link from "next/link";
import { SlidersHorizontal, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

function getIdFromSlug(slug: string): number | null {
  if (!slug) return null;
  const parts = slug.split("-");
  const id = parts.pop();
  return id ? parseInt(id, 10) : null;
}

function getNameFromSlug(slug: string): string {
  if (!slug) return "Keyword";
  const parts = slug.split("-");
  parts.pop();
  const name = parts.join(" ");
  return name.charAt(0).toUpperCase() + name.slice(1);
}

const sortOptions = [
  { id: 'popularity.desc', name: 'Popularity' },
  { id: 'vote_average.desc', name: 'Top Rated' },
  { id: 'revenue.desc', name: 'Highest Revenue' },
  { id: 'primary_release_date.desc', name: 'Newest First' },
  { id: 'primary_release_date.asc', name: 'Oldest First' },
];

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

export default function KeywordPage({
  params,
}: {
  params: Promise<{ keywordId: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [keywordId, setKeywordId] = useState<string | null>(null);
  const [keywordName, setKeywordName] = useState<string>("");
  
  // Data States
  const [allFetchedMovies, setAllFetchedMovies] = useState<any[]>([]); // Global master pool
  const [displayedMovies, setDisplayedMovies] = useState<any[]>([]);  // Locally Filtered subset
  const [loading, setLoading] = useState(true);
  const [apiPage, setApiPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Local Filter UI adjustments (Temporary parameters)
  const [sortBy, setSortBy] = useState('popularity.desc');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Commited Filters (Changes only when clicking "Apply Filters")
  const [appliedSortBy, setAppliedSortBy] = useState('popularity.desc');
  const [appliedGenre, setAppliedGenre] = useState('');
  const [appliedYear, setAppliedYear] = useState('');
  const [appliedLanguage, setAppliedLanguage] = useState('');
  
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadParams() {
      const { keywordId: id } = await params;
      setKeywordId(id);
    }
    loadParams();
  }, [params]);

  // Read clean string translations for titles queries
  useEffect(() => {
    if (!keywordId) return;
    async function loadKeyword() {
      const id = getIdFromSlug(keywordId);
      if (!id) return;
      const keyword = await fetchKeywordDetails(id.toString());
      setKeywordName(keyword?.name || getNameFromSlug(keywordId));
    }
    loadKeyword();
  }, [keywordId]);

  // Core API loader - Appends subsequent data chunks to master pool continuously
  const loadGlobalMoviePool = useCallback(async (pageNum: number, clearPrevious: boolean = false) => {
    if (!keywordId || !keywordName) return;
    const cleanId = getIdFromSlug(keywordId);
    if (!cleanId) return;

    try {
      setLoading(true);
      const API_KEY = "ab7ec4451ddd6ddd90cfa65ba80478f5";
      
      const discoverUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_keywords=${cleanId}&page=${pageNum}&vote_count.gte=3`;
      const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(keywordName)}&page=${pageNum}`;

      const [discoverRes, searchRes] = await Promise.all([
        fetch(discoverUrl).then(r => r.json()),
        fetch(searchUrl).then(r => r.json())
      ]);

      const discoverResults = discoverRes.results || [];
      const searchResults = searchRes.results || [];

      // Combine both lookup metrics
      const merged = [...discoverResults, ...searchResults].filter(m => m.poster_path);
      
      // Update data collections incrementally
      setAllFetchedMovies(prev => {
        const base = clearPrevious ? [] : prev;
        const aggregate = [...base, ...merged];
        // Deduplicate using primary movie IDs
        return aggregate.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
      });

      const maxPages = Math.max(discoverRes.total_pages || 0, searchRes.total_pages || 0);
      setHasMore(pageNum < maxPages && merged.length > 0);
      setApiPage(pageNum);
    } catch (err) {
      console.error("Aggregation lookup fault:", err);
    } finally {
      setLoading(false);
    }
  }, [keywordId, keywordName]);

  // Triggers initial load
  useEffect(() => {
    if (keywordId && keywordName) {
      loadGlobalMoviePool(1, true);
    }
  }, [keywordId, keywordName, loadGlobalMoviePool]);

  // Dynamic Scroll Listeners - Automatically fetch next page arrays
  useEffect(() => {
    const currentTarget = observerTarget.current;
    if (!hasMore || loading || !currentTarget) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          loadGlobalMoviePool(apiPage + 1, false);
        }
      },
      { threshold: 0.1 }
    );
    
    observer.observe(currentTarget);
    return () => observer.unobserve(currentTarget);
  }, [loading, hasMore, apiPage, loadGlobalMoviePool]);

  // Client Filtering Engine over the accumulated master array
  useEffect(() => {
    let dataset = [...allFetchedMovies];

    if (appliedGenre) {
      const targetGenreId = parseInt(appliedGenre, 10);
      dataset = dataset.filter(movie => movie.genre_ids?.includes(targetGenreId));
    }

    if (appliedYear) {
      dataset = dataset.filter(movie => movie.release_date?.startsWith(appliedYear));
    }

    if (appliedLanguage) {
      dataset = dataset.filter(movie => movie.original_language === appliedLanguage);
    }

    dataset.sort((a, b) => {
      if (appliedSortBy === 'popularity.desc') return (b.popularity || 0) - (a.popularity || 0);
      if (appliedSortBy === 'vote_average.desc') return (b.vote_average || 0) - (a.vote_average || 0);
      if (appliedSortBy === 'revenue.desc') return (b.revenue || 0) - (a.revenue || 0);
      if (appliedSortBy === 'primary_release_date.desc') {
        return new Date(b.release_date || 0).getTime() - new Date(a.release_date || 0).getTime();
      }
      if (appliedSortBy === 'primary_release_date.asc') {
        return new Date(a.release_date || 0).getTime() - new Date(b.release_date || 0).getTime();
      }
      return 0;
    });

    setDisplayedMovies(dataset);
  }, [allFetchedMovies, appliedSortBy, appliedGenre, appliedYear, appliedLanguage]);

  // Process explicitly clicking 'Apply Filters'
  const handleCommitFilters = () => {
    setAppliedSortBy(sortBy);
    setAppliedGenre(selectedGenre);
    setAppliedYear(selectedYear);
    setAppliedLanguage(selectedLanguage);
    setIsFilterOpen(false);
  };

  const activeFiltersCount = [appliedGenre, appliedYear, appliedLanguage].filter(Boolean).length;

  return (
    <main className="min-h-screen bg-[#05050A] text-[#F3F4F6] selection:bg-[#b50000] selection:text-white pt-28 md:pt-32 pb-24 px-6 md:px-16 lg:px-24">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumbs */}
        <div className="mb-6 text-sm text-gray-400">
          <Link href="/" className="hover:text-[#b50000] transition">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/finder" className="hover:text-[#b50000] transition">Movies</Link>
          <span className="mx-2">/</span>
          <span className="text-[#b50000]">Keyword: {keywordName}</span>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter mb-3 text-white">
              Movies tagged with:{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DC2626] to-[#b50000]">
                &quot;{keywordName}&quot;
              </span>
            </h1>
          </div>
          
          {/* Filter Toggle Button */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center justify-center gap-3 px-6 py-3 rounded-full font-bold uppercase tracking-wider text-sm transition-all shadow-xl
              ${isFilterOpen || activeFiltersCount > 0 || appliedSortBy !== 'popularity.desc'
                ? 'bg-[#b50000] text-white border border-[#b50000]' 
                : 'bg-[#0F0F1A] border border-[#1F2937] text-white hover:border-gray-500'
              }`}
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span>Filters</span>
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
              <div className="bg-[#0F0F1A] border border-[#1F2937] rounded-2xl p-6 md:p-8 shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-6">
                  {/* Sort By */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Sort By</h4>
                    <div className="flex flex-col gap-2">
                      {sortOptions.map(opt => (
                        <button
                          key={opt.id}
                          type="button"
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
                      {selectedGenre && <button type="button" onClick={() => setSelectedGenre('')} className="text-xs text-red-400 hover:text-red-300">Clear</button>}
                    </div>
                    <div className="flex flex-col gap-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                      {genres.map(g => (
                        <button
                          key={g.id}
                          type="button"
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
                      {selectedYear && <button type="button" onClick={() => setSelectedYear('')} className="text-xs text-red-400 hover:text-red-300">Clear</button>}
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                      {yearOptions.map(y => (
                        <button
                          key={y}
                          type="button"
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
                      {selectedLanguage && <button type="button" onClick={() => setSelectedLanguage('')} className="text-xs text-red-400 hover:text-red-300">Clear</button>}
                    </div>
                    <div className="flex flex-col gap-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                      {languages.map(lang => (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => setSelectedLanguage(lang.code)}
                          className={`text-left px-4 py-2 rounded-lg text-sm font-bold transition-colors ${selectedLanguage === lang.code ? 'bg-[#b50000] text-white' : 'text-gray-400 hover:bg-[#1F2937] hover:text-white'}`}
                        >
                          {lang.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Apply Button Section */}
                <div className="flex justify-end pt-4 border-t border-[#1F2937]">
                  <button
                    type="button"
                    onClick={handleCommitFilters}
                    className="px-8 py-3 bg-[#b50000] text-white font-bold uppercase tracking-wider text-sm rounded-xl hover:bg-[#940000] transition shadow-lg"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {appliedGenre && (
              <span className="px-3 py-1.5 rounded-full bg-[#b50000] text-white text-xs font-medium flex items-center gap-1">
                {genres.find(g => g.id.toString() === appliedGenre)?.name}
                <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => { setSelectedGenre(''); setAppliedGenre(''); }} />
              </span>
            )}
            {appliedYear && (
              <span className="px-3 py-1.5 rounded-full bg-[#b50000] text-white text-xs font-medium flex items-center gap-1">
                Year: {appliedYear}
                <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => { setSelectedYear(''); setAppliedYear(''); }} />
              </span>
            )}
            {appliedLanguage && (
              <span className="px-3 py-1.5 rounded-full bg-[#b50000] text-white text-xs font-medium flex items-center gap-1">
                {languages.find(l => l.code === appliedLanguage)?.name}
                <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => { setSelectedLanguage(''); setAppliedLanguage(''); }} />
              </span>
            )}
          </div>
        )}

        {/* Results Metadata */}
        <div className="mb-6 pb-3 border-b border-[#1F2937] flex justify-between items-center">
          <span className="text-xs text-gray-500">
            Related Movies.
          </span>
          <span className="text-xs text-[#b50000]">
            Sorted by: {sortOptions.find(opt => opt.id === appliedSortBy)?.name}
          </span>
        </div>

        {/* Movie Grid */}
        {displayedMovies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
            {displayedMovies.map((movie, idx) => {
              const slug = `${movie.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${movie.id}`;
              const releaseYear = movie.release_date ? movie.release_date.split("-")[0] : "N/A";
              
              const topGenres = movie.genre_ids
                ?.slice(0, 2)
                .map((id: number) => genres.find(g => g.id === id)?.name)
                .filter(Boolean) || [];

              return (
                <Link
                  key={`${movie.id}-${idx}`}
                  href={`/${slug}`}
                  className="group/card relative block aspect-[2/3] shrink-0 rounded-lg overflow-hidden transition-all duration-500 will-change-transform 
                             hover:scale-105 hover:shadow-[0_10px_30px_rgba(181,0,0,0.3)] hover:ring-1 hover:ring-[#b50000]/50 shadow-md"
                >
                  <Image
                    src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                    alt={movie.title}
                    fill
                    loading="lazy"
                    sizes="(max-width: 768px) 128px, (max-width: 1024px) 160px, 192px"
                    className="object-cover transition-all duration-500"
                    referrerPolicy="no-referrer"
                  />

                  <div className="absolute top-2 right-2 z-20 flex items-center gap-1 bg-black/70 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded-full shadow-md">
                    <span className="text-yellow-400 text-[10px] md:text-xs">★</span>
                    <span className="text-white font-bold text-[9px] md:text-[11px]">
                      {movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}
                    </span>
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-[#05050A]/95 via-[#05050A]/40 to-transparent opacity-0 transition-opacity duration-500 flex flex-col justify-end p-4 group-hover/card:opacity-100 z-10">
                    <span className="text-gray-400 text-[11px] font-medium mb-0.5">
                      {releaseYear}
                    </span>

                    <h3 className="text-white font-bold text-xs md:text-sm leading-tight mb-2 line-clamp-2">
                      {movie.title}
                    </h3>

                    {topGenres.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {topGenres.map((genreName: string, gIdx: number) => (
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
                </Link>
              );
            })}
          </div>
        ) : (
          !loading && (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">No filtered parameters matched your master layout pool.</p>
              <p className="text-gray-500 text-sm mt-2">Scroll down more to append more raw components, or modify selections.</p>
            </div>
          )
        )}
        
        {/* Infinite Scroll Trigger Block */}
        <div ref={observerTarget} className="w-full flex items-center justify-center py-12">
          {loading && (
            <div className="w-8 h-8 border-4 border-[#1F2937] border-t-[#b50000] rounded-full animate-spin"></div>
          )}
        </div>
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