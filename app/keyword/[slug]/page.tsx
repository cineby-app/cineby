'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from "next/image";
import Link from "next/link";
import { SlidersHorizontal, X, Film, Tv } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Loading from '@/app/loading';

// ✅ Get display name from slug
function getKeywordNameFromSlug(slug: string): string {
  if (!slug) return "Keyword";
  return slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// ✅ Function to get keyword ID from TMDB by name
async function getKeywordIdByName(name: string): Promise<number | null> {
  const keywordMap: Record<string, number> = {
    // Original keywords
    'sequel': 9663,
    'based on novel or book': 818,
    'friendship': 6054,
    'superhero': 9715,
    'space': 9882,
    'martial arts': 779,
    'new york city': 242,
    'murder': 9826,
    'sibling relationship': 380,
    'rivalry': 9823,
    'investigation': 5340,
    'magic': 2343,
    'gore': 10292,
    'ninja': 10278,
    'alien': 9951,
    'space travel': 3801,
    'romance': 9840,
    'witch': 616,
    'sports': 6075,
    'politics': 6078,
    '1970s': 1228,
    'ambition': 3734,
    '1980s': 208289,
    'hero': 1701,
    'female protagonist': 11322,
    'shark': 15097,
    'home invasion': 14903,
    'kidnapping': 1930,
    'infidelity': 1326,
    'astronaut': 14626,
    'scientist': 14760,
    'bullying': 6733,
    'espionage': 5265,
    'spy': 470,
    
    // New keywords
    'space war': 179431,
    'space mission': 156289,
    'space battle': 179432,
    'superhero team': 177677,
    'magic show': 179433,
    'black magic': 11509,
    'evil alien': 179434,
    'alien attack': 179435,
    'alien friendship': 179436,
    'male friendship': 179437,
    'erotic': 179438,
    'erotic movie': 179439,
    'sex': 179440,
    'epic battle': 179441,
    'obsession': 1523,
    'cautionary': 179442,
    'complicated': 179443,
    'madness': 179444,
    'dance': 179445,
    'paranoia': 179446,
    'nightmare': 179447,
    'hallucination': 179448,
    'fear': 179449,
    'theater': 179450,
    'psychological horror': 179451,
    'businessman': 179452,
    'dark comedy': 179453,
    'psychological thriller': 179454,
    'family': 179455,
    'critical': 179456,
    'introspective': 179457,
    'provocative': 179458,
    'apocalypse': 179459,
    'zombie': 179460,
    'addiction': 179461,
    'horror anthology': 179462,
    'anthology': 179463,
    'black and white': 179464,
    'buddy cop': 179465,
    'bank robber': 179466,
    'bank robbery': 179467,
    'time loop': 179468,
    'courtroom': 179469,
    'courtroom drama': 179470,
    'heist': 179471,
    'bank heist': 179472,
    'time travel': 179473,
    'admiring': 179474,
    'complex': 179475,
    'winter': 179476,
    'twist': 179477,
    'shocking': 179478,
    'antagonistic': 179479,
    'teenage romance': 179480,
    'summer romance': 179481,
    'survival': 179482,
    'survival horror': 179483,
    'serial killer': 179484,
    'psycho': 179485,
    'motivational': 179486,
    'revenge': 179487,
    'revenge murderer': 179488,
    'philosophical': 179489,
    'based on true story': 179490,
    'based on novel': 179491,
    'coming of age': 179492,
    'dystopian': 179493,
    'post-apocalyptic': 179494,
    'underdog': 179495,
    'strong female lead': 179496,
    'anti-hero': 179497,
    'vigilante': 179498,
    'conspiracy': 179499,
    'government conspiracy': 179500,
    'artificial intelligence': 179501,
    'parallel universe': 179502,
    'alternate reality': 179503,
    'supernatural': 179504,
    'ghost': 179505,
    'haunted house': 179506,
    'possession': 179507,
    'exorcism': 179508,
  };
  
  const lowerName = name.toLowerCase();
  if (keywordMap[lowerName]) return keywordMap[lowerName];
  
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/keyword?api_key=ab7ec4451ddd6ddd90cfa65ba80478f5&query=${encodeURIComponent(name)}`
    );
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      return data.results[0].id;
    }
  } catch (error) {
    console.error('Error searching keyword:', error);
  }
  
  return null;
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

// ✅ Function to check if item is TV show
function isTVShow(item: any): boolean {
  return item.media_type === 'tv' || item.first_air_date !== undefined;
}

// ✅ Function to get title from movie or TV show
function getItemTitle(item: any): string {
  return item.title || item.name || "Untitled";
}

// ✅ Function to get year from movie or TV show
function getItemYear(item: any): string {
  return (item.release_date?.split("-")[0]) || 
         (item.first_air_date?.split("-")[0]) || 
         "N/A";
}

// ✅ Function to get slug for movie or TV show
function getItemSlug(item: any): string {
  const title = getItemTitle(item);
  const isTV = isTVShow(item);
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return isTV ? `/tv/${slug}-${item.id}` : `/${slug}-${item.id}`;
}

export default function KeywordPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [slug, setSlug] = useState<string | null>(null);
  const [keywordId, setKeywordId] = useState<number | null>(null);
  const [keywordName, setKeywordName] = useState<string>("");
  
  const [allFetchedItems, setAllFetchedItems] = useState<any[]>([]);
  const [displayedItems, setDisplayedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiPage, setApiPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  
  const [sortBy, setSortBy] = useState('popularity.desc');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [appliedSortBy, setAppliedSortBy] = useState('popularity.desc');
  const [appliedGenre, setAppliedGenre] = useState('');
  const [appliedYear, setAppliedYear] = useState('');
  const [appliedLanguage, setAppliedLanguage] = useState('');
  
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadParams() {
      const { slug: slugValue } = await params;
      setSlug(slugValue);
      
      const name = getKeywordNameFromSlug(slugValue);
      setKeywordName(name);
      
      const id = await getKeywordIdByName(name);
      if (id) {
        setKeywordId(id);
      } else {
        console.warn(`Keyword ID not found for: ${name}`);
        setLoading(false);
      }
    }
    loadParams();
  }, [params]);

  const loadGlobalItemPool = useCallback(async (pageNum: number, clearPrevious: boolean = false) => {
    if (!keywordId || !keywordName) return;

    try {
      setLoading(true);
      const API_KEY = "ab7ec4451ddd6ddd90cfa65ba80478f5";
      
      // ✅ Fetch both movies and TV shows
      const movieUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_keywords=${keywordId}&page=${pageNum}&vote_count.gte=3`;
      const tvUrl = `https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&with_keywords=${keywordId}&page=${pageNum}&vote_count.gte=3`;
      const searchUrl = `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(keywordName)}&page=${pageNum}`;

      const [movieRes, tvRes, searchRes] = await Promise.all([
        fetch(movieUrl).then(r => r.json()),
        fetch(tvUrl).then(r => r.json()),
        fetch(searchUrl).then(r => r.json())
      ]);

      const movieResults = movieRes.results?.map((m: any) => ({ ...m, media_type: 'movie' })) || [];
      const tvResults = tvRes.results?.map((t: any) => ({ ...t, media_type: 'tv' })) || [];
      const searchResults = searchRes.results?.filter((item: any) => 
        item.media_type === 'movie' || item.media_type === 'tv'
      ) || [];

      // ✅ Merge all results and deduplicate
      const merged = [...movieResults, ...tvResults, ...searchResults].filter(item => 
        item.poster_path || item.backdrop_path
      );
      
      setAllFetchedItems(prev => {
        const base = clearPrevious ? [] : prev;
        const aggregate = [...base, ...merged];
        // Deduplicate using item ID
        return aggregate.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
      });

      const maxPages = Math.max(movieRes.total_pages || 0, tvRes.total_pages || 0, searchRes.total_pages || 0);
      setHasMore(pageNum < maxPages && merged.length > 0);
      setApiPage(pageNum);
      if (clearPrevious) {
        setTotalItems(movieRes.total_results + tvRes.total_results + searchRes.total_results);
      }
    } catch (err) {
      console.error("Aggregation lookup fault:", err);
    } finally {
      setLoading(false);
    }
  }, [keywordId, keywordName]);

  useEffect(() => {
    if (keywordId && keywordName) {
      loadGlobalItemPool(1, true);
    }
  }, [keywordId, keywordName, loadGlobalItemPool]);

  useEffect(() => {
    const currentTarget = observerTarget.current;
    if (!hasMore || loading || !currentTarget) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          loadGlobalItemPool(apiPage + 1, false);
        }
      },
      { threshold: 0.1 }
    );
    
    observer.observe(currentTarget);
    return () => observer.unobserve(currentTarget);
  }, [loading, hasMore, apiPage, loadGlobalItemPool]);

  // ✅ Client Filtering Engine
  useEffect(() => {
    let dataset = [...allFetchedItems];

    if (appliedGenre) {
      const targetGenreId = parseInt(appliedGenre, 10);
      dataset = dataset.filter(item => item.genre_ids?.includes(targetGenreId));
    }

    if (appliedYear) {
      dataset = dataset.filter(item => {
        const year = item.release_date?.split("-")[0] || item.first_air_date?.split("-")[0];
        return year === appliedYear;
      });
    }

    if (appliedLanguage) {
      dataset = dataset.filter(item => item.original_language === appliedLanguage);
    }

    dataset.sort((a, b) => {
      if (appliedSortBy === 'popularity.desc') return (b.popularity || 0) - (a.popularity || 0);
      if (appliedSortBy === 'vote_average.desc') return (b.vote_average || 0) - (a.vote_average || 0);
      if (appliedSortBy === 'revenue.desc') return (b.revenue || 0) - (a.revenue || 0);
      if (appliedSortBy === 'primary_release_date.desc') {
        const dateA = new Date(a.release_date || a.first_air_date || 0).getTime();
        const dateB = new Date(b.release_date || b.first_air_date || 0).getTime();
        return dateB - dateA;
      }
      if (appliedSortBy === 'primary_release_date.asc') {
        const dateA = new Date(a.release_date || a.first_air_date || 0).getTime();
        const dateB = new Date(b.release_date || b.first_air_date || 0).getTime();
        return dateA - dateB;
      }
      return 0;
    });

    setDisplayedItems(dataset);
  }, [allFetchedItems, appliedSortBy, appliedGenre, appliedYear, appliedLanguage]);

  const handleCommitFilters = () => {
    setAppliedSortBy(sortBy);
    setAppliedGenre(selectedGenre);
    setAppliedYear(selectedYear);
    setAppliedLanguage(selectedLanguage);
    setIsFilterOpen(false);
  };

  const activeFiltersCount = [appliedGenre, appliedYear, appliedLanguage].filter(Boolean).length;

  // ✅ Loading state
  if (loading && displayedItems.length === 0) {
    return <Loading />;
  }

  return (
    <main className="min-h-screen bg-[#05050A] text-[#F3F4F6] selection:bg-[#b50000] selection:text-white pt-28 md:pt-32 pb-24 px-6 md:px-16 lg:px-24">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumbs */}
        <div className="mb-6 text-sm text-gray-400">
          <Link href="/" className="hover:text-[#b50000] transition">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-[#b50000]">Keyword: {keywordName}</span>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter mb-3 text-white">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DC2626] to-[#b50000]">
                {keywordName}
              </span> Movies & TV Shows
            </h1>
            <p className="text-gray-400 text-sm">
              Found <span className="text-white font-semibold">{displayedItems.length}</span> {keywordName} titles
            </p>
          </div>
          
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
            {displayedItems.length} {keywordName} titles found
          </span>
          <span className="text-xs text-[#b50000]">
            Sorted by: {sortOptions.find(opt => opt.id === appliedSortBy)?.name}
          </span>
        </div>

        {/* Grid */}
        {displayedItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
            {displayedItems.map((item, idx) => {
              const isTV = item.media_type === 'tv' || item.first_air_date !== undefined;
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
                  className="group/card relative block aspect-[2/3] shrink-0 rounded-lg overflow-hidden transition-all duration-500 will-change-transform 
                             hover:scale-105 hover:shadow-[0_10px_30px_rgba(181,0,0,0.3)] hover:ring-1 hover:ring-[#b50000]/50 shadow-md"
                >
                  <Image
                    src={`https://image.tmdb.org/t/p/w342${item.poster_path}`}
                    alt={title}
                    fill
                    loading="lazy"
                    sizes="(max-width: 768px) 128px, (max-width: 1024px) 160px, 192px"
                    className="object-cover transition-all duration-500"
                    referrerPolicy="no-referrer"
                  />

                  {/* ✅ TV Show Badge */}
                  {isTV ? (
                    <div className="absolute top-2 left-2 z-20">
                      <div className="flex items-center gap-1 bg-gradient-to-r from-red-800 to-red-600 px-2 py-0.5 rounded-md shadow-lg">
                        <Tv className="w-3 h-3 text-white" />
                        <span className="text-[8px] md:text-[9px] font-bold text-white uppercase tracking-wider">
                          TV Show
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="absolute top-2 left-2 z-20">
                      <div className="flex items-center gap-1 bg-gradient-to-r from-blue-700 to-blue-500 px-2 py-0.5 rounded-md shadow-lg">
                        <Film className="w-3 h-3 text-white" />
                        <span className="text-[8px] md:text-[9px] font-bold text-white uppercase tracking-wider">
                          Movie
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Rating Badge */}
                  <div className="absolute top-2 right-2 z-20 flex items-center gap-1 bg-black/70 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded-full shadow-md">
                    <span className="text-yellow-400 text-[10px] md:text-xs">★</span>
                    <span className="text-white font-bold text-[9px] md:text-[11px]">
                      {rating ? rating.toFixed(1) : "N/A"}
                    </span>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#05050A]/95 via-[#05050A]/40 to-transparent opacity-0 transition-opacity duration-500 flex flex-col justify-end p-4 group-hover/card:opacity-100 z-10">
                    <span className="text-gray-400 text-[11px] font-medium mb-0.5">
                      {year}
                    </span>

                    <h3 className="text-white font-bold text-xs md:text-sm leading-tight mb-2 line-clamp-2">
                      {title}
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
              <p className="text-gray-400 text-lg">No {keywordName} titles found.</p>
              <p className="text-gray-500 text-sm mt-2">Try adjusting your filters or browse other keywords.</p>
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