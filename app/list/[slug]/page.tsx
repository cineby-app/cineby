'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { movieLists } from '@/lib/lists';
import { articles } from '@/lib/articles';
import { ArrowLeft, Film, Tv, ListChecks, Play, Star, Calendar, Clock, Heart, Check, Copy, Clapperboard } from 'lucide-react';
import { fetchMovieDetails, fetchTVDetails, fetchMovieVideos, fetchTVVideos } from '@/lib/tmdb';
import { AdsterraAd } from '@/components/AdsterraAd';

const AD_KEY_300x250 = '8162f7b8c34974f34a974b6e7ecfc56c';
const BASE_URL = 'https://cineby.vip';

// ✅ FIX: Use Promise for params (Next.js 15+)
interface Props {
  params: Promise<{ slug: string }>;
}

// Watchlist Icon (Bookmark)
const WatchlistIcon = ({ active }: { active: boolean }) => (
  <svg className={`w-5 h-5 transition-all ${active ? 'fill-blue-900 text-blue-200' : ''}`} fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
);

interface MovieData {
  id: number;
  title: string;
  poster_path: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  genres?: { id: number; name: string }[];
  runtime?: number;
  name?: string;
  media_type?: 'movie' | 'tv';
}

// Helper function to safely get title from TV or Movie data
function getTitle(data: any): string {
  if (!data) return 'Unknown Title';
  // TV shows use 'name', movies use 'title'
  return data.name || data.title || 'Unknown Title';
}

export default function ListPage({ params }: Props) {
  const router = useRouter();
  
  // ✅ FIX: Unwrap params using React.use()
  const { slug } = React.use(params);
  
  const [moviesData, setMoviesData] = useState<MovieData[]>([]);
  const [moviesVideos, setMoviesVideos] = useState<Map<number, any[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [trailerTitle, setTrailerTitle] = useState('');
  const [likedMovies, setLikedMovies] = useState<Set<number>>(new Set());
  const [watchlistMovies, setWatchlistMovies] = useState<Set<number>>(new Set());
  const [copiedId, setCopiedId] = useState<number | null>(null);
  
  const list = movieLists?.find((l) => l.slug === slug) || null;

  const relatedArticles = articles.filter(article => 
    article.id !== '1' &&
    article.keywords.some(keyword => 
      list?.keywords?.some(listKeyword => 
        listKeyword.toLowerCase().includes(keyword.toLowerCase()) ||
        keyword.toLowerCase().includes(listKeyword.toLowerCase())
      )
    )
  ).slice(0, 3);

  useEffect(() => {
    if (!list) {
      router.push('/404');
      return;
    }

    if (!list.movies || list.movies.length === 0) {
      setLoading(false);
      return;
    }

    const fetchMovies = async () => {
      try {
        // Fetch movies and TV shows separately
        const data = await Promise.all(
          list.movies.map(async (movie: any) => {
            if (movie.type === 'tv') {
              // Use TV show API for TV shows
              const tvData = await fetchTVDetails(movie.id.toString());
              return {
                ...tvData,
                media_type: 'tv',
                title: getTitle(tvData),
              };
            } else {
              // Use movie API for movies
              const movieData = await fetchMovieDetails(movie.id.toString());
              return {
                ...movieData,
                media_type: 'movie',
                title: movieData?.title || movie.title || 'Unknown Title',
              };
            }
          })
        );
        
        // ✅ FIX: Filter out items without an id and map to proper type
        const validData = data
          .filter((item) => item && typeof item.id === 'number' && !isNaN(item.id))
          .map((item) => ({
            id: item.id!,
            title: item.title || 'Unknown Title',
            poster_path: item.poster_path || '',
            vote_average: item.vote_average || 0,
            release_date: item.release_date,
            first_air_date: (item as any).first_air_date,
            genres: item.genres,
            runtime: item.runtime,
            name: (item as any).name,
            media_type: item.media_type as 'movie' | 'tv',
          })) as MovieData[];
        
        setMoviesData(validData);

        // Fetch videos for each item
        const videoMap = new Map();
        for (const item of validData) {
          if (item && item.id) {
            let videos;
            if (item.media_type === 'tv') {
              videos = await fetchTVVideos(item.id.toString());
            } else {
              videos = await fetchMovieVideos(item.id.toString());
            }
            videoMap.set(item.id, videos);
          }
        }
        setMoviesVideos(videoMap);
      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [list, router]);

  useEffect(() => {
    if (trailerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [trailerOpen]);

  if (!list) {
    return (
      <div className="min-h-screen bg-[#05050A] flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-red-500 text-lg">List not found</p>
          <Link href="/list" className="mt-4 inline-block text-[#E50914] hover:underline">
            Back to Lists
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05050A] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E50914] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading collection...</p>
        </div>
      </div>
    );
  }

  const movieMap = new Map(moviesData.filter(m => m !== null).map((movie) => [movie.id, movie]));

  const relatedLists = movieLists
    ?.filter((l) => l.id !== list?.id)
    ?.slice(0, 4) || [];

  const toggleLike = (movieId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedMovies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(movieId)) {
        newSet.delete(movieId);
      } else {
        newSet.add(movieId);
      }
      return newSet;
    });
  };

  const toggleWatchlist = (movieId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setWatchlistMovies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(movieId)) {
        newSet.delete(movieId);
      } else {
        newSet.add(movieId);
      }
      return newSet;
    });
  };

  const copyTitle = (title: string, movieId: number) => {
    navigator.clipboard.writeText(title);
    setCopiedId(movieId);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const openTrailer = (movieId: number, title: string) => {
    const videos = moviesVideos.get(movieId) || [];
    const trailer = videos.find(v => v.type === "Trailer" && v.site === "YouTube") || 
                    videos.find(v => v.site === "YouTube");
    if (trailer) {
      setTrailerKey(trailer.key);
      setTrailerTitle(title);
      setTrailerOpen(true);
    }
  };

  const TrailerIcon = () => (
    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  );

  const LikeIcon = ({ active }: { active: boolean }) => (
    <svg className={`w-5 h-5 ${active ? 'fill-white' : ''}`} fill={active ? 'white' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );

  // SEO Data
  const pageUrl = `${BASE_URL}/list/${list.slug}`;
  const imageUrl = list.coverImage?.startsWith('http') ? list.coverImage : `${BASE_URL}${list.coverImage || ''}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': pageUrl,
    'url': pageUrl,
    'name': list.title,
    'headline': list.metaTitle,
    'description': list.metaDescription,
    'keywords': list.keywords?.join(', ') || '',
    'about': {
      '@type': 'Thing',
      'name': 'Movie Collection',
    },
    'mainEntity': {
      '@type': 'ItemList',
      'itemListElement': list.movies?.map((movie: any, index: number) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'item': {
          '@type': 'Movie',
          'name': movie.title || 'Unknown Movie',
        },
      })) || [],
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'Cineby',
      'logo': {
        '@type': 'ImageObject',
        'url': `${BASE_URL}/img/logo.png`,
      },
    },
    'image': imageUrl,
    'datePublished': new Date().toISOString().split('T')[0],
    'dateModified': new Date().toISOString().split('T')[0],
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': BASE_URL,
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Movie Lists',
        'item': `${BASE_URL}/list`,
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': list.title,
        'item': pageUrl,
      },
    ],
  };

  return (
    <>
      <Head>
        <title>{list.metaTitle}</title>
        <meta name="title" content={list.metaTitle} />
        <meta name="description" content={list.metaDescription} />
        <meta name="keywords" content={list.keywords?.join(', ') || ''} />
        <link rel="canonical" href={pageUrl} />
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:title" content={list.metaTitle} />
        <meta property="og:description" content={list.metaDescription} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Cineby - Watch Movies Free Online" />
        <meta property="og:locale" content="en_US" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={pageUrl} />
        <meta name="twitter:title" content={list.metaTitle} />
        <meta name="twitter:description" content={list.metaDescription} />
        <meta name="twitter:image" content={imageUrl} />
        <meta name="twitter:creator" content="@cineby" />
        <meta name="twitter:site" content="@cineby" />
        <meta name="author" content="Cineby Editorial Team" />
        <meta name="publisher" content="Cineby" />
        <meta name="category" content="entertainment" />
        <link rel="alternate" href={pageUrl} hrefLang="en-us" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      </Head>

      <div className="min-h-screen bg-black text-white selection:bg-[#E50914] selection:text-white">
        {/* Hero Section */}
        <div className="relative w-full h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[80vh] min-h-[400px] sm:min-h-[450px] md:min-h-[550px] overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src={list.coverImage}
              alt={list.title}
              fill
              className="object-cover scale-105"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-l from-black/40 via-transparent to-transparent" />
          </div>

          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-[#E50914]/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-40 h-40 sm:w-56 sm:h-56 md:w-80 md:h-80 bg-[#E50914]/10 rounded-full blur-3xl animate-pulse delay-1000" />
          </div>

          <div className="absolute bottom-0 left-0 w-full px-4 sm:px-6 md:px-16 lg:px-24 pb-8 sm:pb-8 md:pb-12 z-10">
            <div className="max-w-7xl mx-auto">
              <Link
                href="/list"
                className="inline-flex items-center text-xs font-mono uppercase tracking-widest text-gray-300 hover:text-white transition-colors mb-4 sm:mb-6 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> All Lists
              </Link>

              <header className="space-y-3 sm:space-y-4">
                <div className="flex flex-wrap gap-2">
                  {list.keywords?.slice(0, 4).map((keyword: string) => (
                    <span
                      key={keyword}
                      className="bg-[#E50914] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded shadow-md"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tighter leading-[1.1] bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
                  {list.title}
                </h1>

                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm font-mono text-gray-300 uppercase tracking-widest">
                  <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-2 rounded-lg">
                    <Film className="w-4 h-4 text-[#E50914]" />
                    <span className="font-bold text-white">
                      {list.movies?.filter((m: any) => m.type === 'movie' || !m.type).length || 0} Movies
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-2 rounded-lg">
                    <Tv className="w-4 h-4 text-[#E50914]" />
                    <span className="font-bold text-white">
                      {list.movies?.filter((m: any) => m.type === 'tv').length || 0} TV Shows
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-2 rounded-lg">
                    <ListChecks className="w-4 h-4 text-[#E50914]" />
                    <span>Curated Collection</span>
                  </div>
                </div>
              </header>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-16 lg:px-24 mt-4 sm:mt-6 md:mt-8 relative z-20">
          <div className="flex flex-col lg:flex-row gap-6 md:gap-8 lg:gap-12">
            {/* Main Content - Left */}
            <div className="lg:w-2/3 space-y-4 sm:space-y-6 md:space-y-8 lg:space-y-10">
              {/* Short Description */}
              <div className="bg-gradient-to-br from-[#0F0F1A] to-black rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 border border-[#1F2937] shadow-xl">
                <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-5">
                  <div className="w-1 h-6 md:h-8 bg-[#E50914] rounded-full" />
                  <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold tracking-tight">About This List</h2>
                </div>
                <p className="text-gray-300 leading-relaxed text-sm sm:text-base lg:text-lg">
                  {list.shortDescription}
                </p>
              </div>

              {/* Introduction */}
              <div 
                className="text-gray-300 leading-relaxed space-y-4 prose prose-invert prose-sm sm:prose-base lg:prose-lg max-w-none"
                dangerouslySetInnerHTML={{
                  __html: list.introduction || '',
                }}
              />

              {/* Movie List Section */}
              <section className="space-y-4 md:space-y-6">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-1 h-6 md:h-8 bg-[#E50914] rounded-full" />
                  <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold tracking-tight">The Collection</h2>
                  <span className="text-[10px] md:text-xs text-gray-500">{list.movies?.length || 0} films</span>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-5">
                  {list.movies?.map((movie: any, index: number) => {
                    const movieData = movieMap.get(movie.id);
                    if (!movieData) return null;

                    const slug = movieData.title
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, '-')
                      .replace(/(^-|-$)+/g, '') + `-${movieData.id}`;
                    
                    const posterUrl = movieData.poster_path
                      ? `https://image.tmdb.org/t/p/w500${movieData.poster_path}`
                      : '/img/placeholder.jpg';
                    
                    // Get year from release_date or first_air_date
                    const year = movieData.release_date 
                      ? new Date(movieData.release_date).getFullYear()
                      : movieData.first_air_date 
                        ? new Date(movieData.first_air_date).getFullYear()
                        : 'N/A';
                    
                    const rating = movieData.vote_average
                      ? movieData.vote_average.toFixed(1)
                      : 'N/A';

                    const videos = moviesVideos.get(movieData.id) || [];
                    const hasTrailer = videos.some(v => v.site === "YouTube");
                    const isLiked = likedMovies.has(movieData.id);
                    const isWatchlisted = watchlistMovies.has(movieData.id);
                    
                    // Use type from lists.ts or detect from API
                    const contentType = movie.type || (movieData.name || movieData.media_type === 'tv' ? 'tv' : 'movie');

                    return (
                      <div
                        key={movie.id}
                        className="group relative bg-gradient-to-br from-[#0F0F1A] to-black border border-[#1F2937] rounded-xl sm:rounded-2xl overflow-hidden hover:border-[#E50914]/50 transition-all duration-300 hover:shadow-xl hover:shadow-red-900/10 hover:-translate-y-1"
                      >
                        <div className="flex flex-row gap-3 sm:gap-4 md:gap-5 p-3 sm:p-4 md:p-5">
                          {/* Poster */}
                          <Link href={`/${slug}`} className="relative group/poster flex-shrink-0">
                            <div className="relative w-[100px] sm:w-[120px] md:w-[140px] lg:w-[160px] aspect-[2/3] overflow-hidden rounded-xl bg-[#1F2937]">
                              <Image
                                src={posterUrl}
                                alt={movieData.title}
                                fill
                                className="object-cover transition-transform duration-500 group-hover/poster:scale-110"
                                sizes="(max-width: 640px) 100px, (max-width: 768px) 120px, (max-width: 1024px) 140px, 160px"
                              />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/poster:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <div className="flex flex-col items-center gap-2">
                                  <Play className="w-10 h-10 sm:w-12 sm:h-12 text-white fill-white" />
                                  <span className="text-white text-xs font-bold uppercase tracking-wider">Watch Now</span>
                                </div>
                              </div>
                              <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded text-xs text-yellow-400 flex items-center gap-1">
                                <Star className="w-3 h-3 fill-current" />
                                {rating}
                              </div>
                              <div className="absolute top-2 left-2 bg-[#E50914] text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                                {index + 1}
                              </div>
                              {/* MOVIE / TV SHOW Badge - Using type from lists.ts */}
                              <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-0.5 rounded text-[8px] sm:text-[9px] font-bold text-white uppercase tracking-wider border border-white/20">
                                {contentType === 'tv' ? 'TV SHOW' : 'MOVIE'}
                              </div>
                            </div>
                          </Link>

                          {/* Content */}
                          <div className="flex flex-col flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Link href={`/${slug}`} className="min-w-0 flex-1">
                                <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white group-hover:text-[#E50914] transition-colors truncate">
                                  {movieData.title}
                                </h3>
                              </Link>
                              <button
                                onClick={() => copyTitle(movieData.title, movieData.id)}
                                className="flex items-center gap-1 text-gray-500 hover:text-white transition-colors shrink-0"
                                title="Copy title"
                              >
                                {copiedId === movieData.id ? (
                                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                                ) : (
                                  <Copy className="w-4 h-4 sm:w-5 sm:h-5" />
                                )}
                              </button>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm md:text-base text-gray-500 mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                                {year}
                              </span>
                              {movieData.genres && movieData.genres.length > 0 && (
                                <>
                                  <span>•</span>
                                  <span className="text-gray-400">
                                    {movieData.genres.slice(0, 2).map((g: any) => g.name).join(', ')}
                                  </span>
                                </>
                              )}
                              {movieData.runtime && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-1 whitespace-nowrap">
                                    <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                                    {Math.floor(movieData.runtime / 60)}h {movieData.runtime % 60}m
                                  </span>
                                </>
                              )}
                            </div>

                            <div 
                              className="text-gray-400 text-sm sm:text-base leading-relaxed my-2 line-clamp-2"
                              dangerouslySetInnerHTML={{
                                __html: movie.note || '',
                              }}
                            />

                            <div className="flex flex-wrap items-center gap-2 mt-auto pt-2 sm:pt-3 border-t border-[#1F2937]">
                              {hasTrailer && (
                                <button
                                  onClick={() => openTrailer(movieData.id, movieData.title)}
                                  className="flex items-center gap-1.5 bg-[#E50914] hover:bg-red-700 text-white font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all text-xs sm:text-sm hover:scale-105 whitespace-nowrap"
                                >
                                  <TrailerIcon />
                                  <span>Watch Trailer</span>
                                </button>
                              )}

                              <Link
                                href={`/${slug}`}
                                className="flex items-center gap-1.5 bg-[#1F2937] hover:bg-[#2A2A3A] text-gray-300 hover:text-white font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all text-xs sm:text-sm hover:scale-105 whitespace-nowrap"
                              >
                                <Clapperboard className="w-5 h-5" />
                                <span>Watch Movie</span>
                              </Link>

                              <button
                                onClick={(e) => toggleLike(movieData.id, e)}
                                className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all text-xs sm:text-sm hover:scale-105 ${
                                  isLiked 
                                    ? 'bg-red-600 text-white hover:bg-red-700' 
                                    : 'bg-[#1F2937] text-gray-300 hover:bg-[#2A2A3A] hover:text-white'
                                }`}
                                title={isLiked ? 'Remove from Loved' : 'Add to Loved'}
                              >
                                <LikeIcon active={isLiked} />
                              </button>

                              <button
                                onClick={(e) => toggleWatchlist(movieData.id, e)}
                                className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all text-xs sm:text-sm hover:scale-105 ${
                                  isWatchlisted 
                                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                    : 'bg-[#1F2937] text-gray-300 hover:bg-[#2A2A3A] hover:text-white'
                                }`}
                                title={isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
                              >
                                <WatchlistIcon active={isWatchlisted} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Conclusion */}
              <section className="border-t border-[#1F2937] pt-4 sm:pt-6 md:pt-8">
                <div 
                  className="text-gray-300 leading-relaxed space-y-4 prose prose-invert prose-sm sm:prose-base lg:prose-lg max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: list.conclusion || '',
                  }}
                />
              </section>
            </div>

            {/* Sidebar - Right with Sticky */}
            <div className="lg:w-1/3 lg:sticky lg:top-24 lg:self-start space-y-4 sm:space-y-6">
              {/* Related Lists */}
              {relatedLists.length > 0 && (
                <div className="bg-gradient-to-br from-[#0F0F1A] to-black rounded-xl md:rounded-2xl border border-[#1F2937] p-3 sm:p-4 md:p-6">
                  <div className="flex items-center gap-2 pb-2 sm:pb-3 border-b border-[#1F2937] mb-3 sm:mb-4">
                    <div className="w-1 h-4 sm:h-5 bg-[#E50914] rounded-full" />
                    <h3 className="text-[10px] sm:text-xs md:text-sm font-bold tracking-widest text-gray-400 uppercase">Related Lists</h3>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    {relatedLists.map((relatedList) => (
                      <Link
                        key={relatedList.id}
                        href={`/list/${relatedList.slug}`}
                        className="group flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-[#0F0F1A] rounded-lg sm:rounded-xl border border-[#1F2937] hover:border-[#E50914]/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                      >
                        <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden flex-shrink-0 bg-[#1F2937]">
                          <Image
                            src={relatedList.coverImage}
                            alt={relatedList.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[10px] sm:text-xs md:text-sm font-bold text-white group-hover:text-[#E50914] transition-colors line-clamp-2">
                            {relatedList.title}
                          </h4>
                          <p className="text-[8px] sm:text-[10px] text-gray-400 mt-0.5 sm:mt-1">
                            {relatedList.movies?.length || 0} films
                          </p>
                        </div>
                        <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 group-hover:text-[#E50914] group-hover:translate-x-1 transition-all rotate-180" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Articles */}
              {relatedArticles.length > 0 && (
                <div className="bg-gradient-to-br from-[#0F0F1A] to-black rounded-xl md:rounded-2xl border border-[#1F2937] p-3 sm:p-4 md:p-6">
                  <div className="flex items-center gap-2 pb-2 sm:pb-3 border-b border-[#1F2937] mb-3 sm:mb-4">
                    <div className="w-1 h-4 sm:h-5 bg-[#E50914] rounded-full" />
                    <h3 className="text-[10px] sm:text-xs md:text-sm font-bold tracking-widest text-gray-400 uppercase">Related Articles</h3>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    {relatedArticles.map((article) => (
                      <Link
                        key={article.id}
                        href={`/blog/${article.slug}`}
                        className="group flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-[#0F0F1A] rounded-lg sm:rounded-xl border border-[#1F2937] hover:border-[#E50914]/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                      >
                        <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden flex-shrink-0 bg-[#1F2937]">
                          <Image
                            src={article.coverImage}
                            alt={article.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[10px] sm:text-xs md:text-sm font-bold text-white group-hover:text-[#E50914] transition-colors line-clamp-2">
                            {article.title}
                          </h4>
                          <p className="text-[8px] sm:text-[10px] text-gray-400 mt-0.5 sm:mt-1">
                            {article.readTime}
                          </p>
                        </div>
                        <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 group-hover:text-[#E50914] group-hover:translate-x-1 transition-all rotate-180" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Collection Stats - Films & TV Shows */}
              <div className="bg-gradient-to-br from-[#0F0F1A] to-black rounded-xl md:rounded-2xl border border-[#1F2937] p-3 sm:p-4 md:p-6">
                <div className="flex items-center gap-2 pb-2 sm:pb-3 border-b border-[#1F2937] mb-3 sm:mb-4">
                  <div className="w-1 h-4 sm:h-5 bg-[#E50914] rounded-full" />
                  <h3 className="text-[10px] sm:text-xs md:text-sm font-bold tracking-widest text-gray-400 uppercase">Collection Stats</h3>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div className="bg-white/5 rounded-lg p-2 sm:p-3 text-center">
                    <p className="text-xl sm:text-2xl md:text-3xl font-black text-white">
                      {list.movies?.filter((m: any) => m.type === 'movie' || !m.type).length || 0}
                    </p>
                    <p className="text-[8px] sm:text-[10px] text-gray-400 uppercase tracking-wider">Films</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2 sm:p-3 text-center">
                    <p className="text-xl sm:text-2xl md:text-3xl font-black text-white">
                      {list.movies?.filter((m: any) => m.type === 'tv').length || 0}
                    </p>
                    <p className="text-[8px] sm:text-[10px] text-gray-400 uppercase tracking-wider">TV Shows</p>
                  </div>
                </div>
              </div>

              {/* Banner Ad 300x250 */}
              <div className="bg-gradient-to-br from-[#0F0F1A] to-black rounded-xl md:rounded-2xl border border-[#1F2937] p-2 sm:p-3">
                <div className="flex justify-center">
                  <AdsterraAd adKey={AD_KEY_300x250} width={300} height={250} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 py-10 sm:mt-12 text-center">
            <Link
              href="/list"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-xs sm:text-sm font-mono uppercase tracking-wider hover:gap-3 transition-all"
            >
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              Browse All Lists
            </Link>
          </div>
        </div>

        {/* Trailer Modal */}
        {trailerOpen && trailerKey && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 md:p-8 bg-black/90 backdrop-blur-md" onClick={() => setTrailerOpen(false)}>
            <div className="relative w-full max-w-6xl aspect-video bg-black rounded-xl sm:rounded-2xl overflow-hidden border border-[#BE185D]/50" onClick={(e) => e.stopPropagation()}>
              <button 
                onClick={() => setTrailerOpen(false)} 
                className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-black/60 hover:bg-[#BE185D] text-white rounded-full flex items-center justify-center transition-all border border-gray-600 hover:border-[#BE185D] backdrop-blur-sm" 
                aria-label="Close Trailer"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-lg border border-white/10">
                <p className="text-white text-xs sm:text-sm font-bold truncate max-w-[200px]">{trailerTitle}</p>
              </div>
              <iframe 
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`} 
                title="Movie Trailer" 
                className="w-full h-full border-none" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen 
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}