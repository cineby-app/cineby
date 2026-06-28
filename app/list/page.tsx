'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { movieLists } from '@/lib/lists';
import { Film, Tv, ArrowRight } from 'lucide-react';
import { fetchTrendingMovies } from '@/lib/tmdb';
import Loading from '@/app/loading'; // Import your custom Loading component

export default function ListsPage() {
  const [heroImage, setHeroImage] = useState('/img/lists-og-image.jpg');
  const [loading, setLoading] = useState(true);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [loadMoreClicks, setLoadMoreClicks] = useState(0);
  const ITEMS_PER_PAGE = 6;
  const MAX_LOAD_MORE_CLICKS = 3;

  // Fetch trending movies for hero backdrop
  useEffect(() => {
    const fetchHeroImage = async () => {
      try {
        const trendingMovies = await fetchTrendingMovies();
        if (trendingMovies && trendingMovies.length > 0) {
          const randomMovie = trendingMovies[Math.floor(Math.random() * trendingMovies.length)];
          if (randomMovie?.backdrop_path) {
            setHeroImage(`https://image.tmdb.org/t/p/original${randomMovie.backdrop_path}`);
          }
        }
      } catch (error) {
        console.error('Error fetching trending movies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHeroImage();
  }, []);

  const getTypeCounts = (list: any) => {
    const movies = list.movies?.filter((m: any) => m.type === 'movie' || !m.type).length || 0;
    const tvShows = list.movies?.filter((m: any) => m.type === 'tv').length || 0;
    return { movies, tvShows };
  };

  // Pagination logic
  const totalLists = movieLists.length;
  const totalPages = Math.ceil(totalLists / ITEMS_PER_PAGE);
  const showNumberedPagination = loadMoreClicks >= MAX_LOAD_MORE_CLICKS;

  // Get current page items
  const getCurrentPageItems = () => {
    if (showNumberedPagination) {
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      return movieLists.slice(startIndex, endIndex);
    } else {
      const displayCount = (loadMoreClicks + 1) * ITEMS_PER_PAGE;
      return movieLists.slice(0, displayCount);
    }
  };

  const currentItems = getCurrentPageItems();

  // Load more handler
  const handleLoadMore = () => {
    if (loadMoreClicks < MAX_LOAD_MORE_CLICKS - 1) {
      setLoadMoreClicks(loadMoreClicks + 1);
    } else if (loadMoreClicks === MAX_LOAD_MORE_CLICKS - 1) {
      setLoadMoreClicks(loadMoreClicks + 1);
      setCurrentPage(1);
    }
  };

  // Page change handler
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) {
        pages.push('...');
      }
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      pages.push(totalPages);
    }
    return pages;
  };

  // Show custom Loading component
  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-[#05050A] relative overflow-x-hidden">
      
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
      <div className="relative w-full h-[50vh] min-h-[400px] overflow-hidden">
        {/* Dynamic Backdrop Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={heroImage}
            alt="Cineby Lists - Curated Collections"
            fill
            className="object-cover scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#05050A] via-[#05050A]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#05050A] via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-l from-[#05050A]/40 via-transparent to-transparent" />
        </div>

        {/* Animated glow effect */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 bg-[#E50914]/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-40 h-40 sm:w-56 sm:h-56 md:w-72 md:h-72 bg-[#E50914]/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 w-full h-full flex flex-col justify-center px-6">
          <div className="max-w-7xl mx-auto w-full">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase text-white drop-shadow-xl">
              <span className="text-[#E50914]">Cineby</span> Lists
            </h1>
            <p className="text-gray-400 font-mono tracking-widest uppercase text-sm max-w-2xl leading-relaxed mt-2">
              Curated collections of the best movies and TV shows
            </p>
            
            <div className="flex flex-wrap items-center gap-3 mt-6">
              <span className="bg-black/40 backdrop-blur-md text-gray-300 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/10">
                <Film className="w-3.5 h-3.5 text-[#E50914]" />
                Films
              </span>
              <span className="bg-black/40 backdrop-blur-md text-gray-300 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/10">
                <Tv className="w-3.5 h-3.5 text-[#E50914]" />
                TV Shows
              </span>
              <span className="bg-black/40 backdrop-blur-md text-gray-300 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/10">
                Curated Collections
              </span>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 animate-bounce">
          <span className="text-white/40 text-[8px] sm:text-[10px] uppercase tracking-[0.2em] font-mono">
            Scroll
          </span>
          <svg 
            className="w-4 h-4 sm:w-5 sm:h-5 text-white/40"
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div>

      {/* Lists Grid */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {currentItems.map((list) => {
            const { movies, tvShows } = getTypeCounts(list);
            const totalItems = list.movies?.length || 0;
            
            return (
              <Link
                key={list.id}
                href={`/list/${list.slug}`}
                className="group relative bg-[#0F0F1A] border border-[#1F2937] rounded-xl overflow-hidden hover:border-[#E50914]/50 transition-all duration-300 hover:shadow-xl hover:shadow-red-900/10 hover:-translate-y-1"
              >
                {/* Cover Image */}
                <div className="relative w-full aspect-[16/9] overflow-hidden">
                  <Image
                    src={list.coverImage}
                    alt={list.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F1A] via-[#0F0F1A]/60 to-transparent opacity-80" />
                  
                  {/* Badge */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded">
                      {totalItems} {totalItems === 1 ? 'Item' : 'Items'}
                    </span>
                  </div>
                  
                  {/* Type badges - Right side */}
                  <div className="absolute top-4 right-4 flex flex-col gap-1">
                    {movies > 0 && (
                      <span className="bg-black/60 backdrop-blur-md text-white text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded flex items-center gap-1">
                        <Film className="w-2.5 h-2.5" />
                        {movies}
                      </span>
                    )}
                    {tvShows > 0 && (
                      <span className="bg-black/60 backdrop-blur-md text-white text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded flex items-center gap-1">
                        <Tv className="w-2.5 h-2.5" />
                        {tvShows}
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                  <h2 className="text-xl font-bold text-white mb-3 tracking-tight group-hover:text-[#E50914] transition-colors line-clamp-2">
                    {list.title}
                  </h2>
                  
                  <p className="text-sm text-gray-400 line-clamp-3 mb-6 leading-relaxed flex-1">
                    {list.shortDescription}
                  </p>

                  <div className="flex items-center text-xs font-bold uppercase tracking-widest text-white mt-auto group-hover:text-[#E50914] transition-colors">
                    <span>View List</span>
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Pagination Controls - Simple & Clean */}
        {totalLists > ITEMS_PER_PAGE && (
          <div className="flex flex-col items-center gap-4 pt-8 mt-6 border-t border-[#1F2937]">
            {!showNumberedPagination ? (
              // Load More Button - Simple, clean, modern
              loadMoreClicks < MAX_LOAD_MORE_CLICKS && (
                <button
                  onClick={handleLoadMore}
                  className="px-8 py-3 bg-[#E50914] hover:bg-red-700 text-white font-medium rounded-lg transition-all duration-200 text-sm"
                >
                  Load More
                </button>
              )
            ) : (
              // Numbered Pagination - Simple & Clean
              <div className="flex flex-col items-center gap-4">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {/* Previous */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                      currentPage === 1
                        ? 'bg-[#1F2937] text-gray-600 cursor-not-allowed'
                        : 'bg-[#1F2937] hover:bg-[#2A2A3A] text-gray-300 hover:text-white'
                    }`}
                  >
                    ←
                  </button>

                  {/* Page numbers */}
                  {getPageNumbers().map((page, index) => (
                    <button
                      key={index}
                      onClick={() => typeof page === 'number' && handlePageChange(page)}
                      disabled={page === '...' || typeof page === 'string'}
                      className={`min-w-[40px] px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                        page === currentPage
                          ? 'bg-[#E50914] text-white'
                          : page === '...'
                          ? 'bg-transparent text-gray-500 cursor-default'
                          : 'bg-[#1F2937] hover:bg-[#2A2A3A] text-gray-300 hover:text-white'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  {/* Next */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                      currentPage === totalPages
                        ? 'bg-[#1F2937] text-gray-600 cursor-not-allowed'
                        : 'bg-[#1F2937] hover:bg-[#2A2A3A] text-gray-300 hover:text-white'
                    }`}
                  >
                    →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {movieLists.length === 0 && (
          <div className="text-center py-16 sm:py-20">
            <p className="text-gray-500 text-base sm:text-lg">No lists available yet.</p>
            <p className="text-gray-600 text-sm mt-2">Check back soon for curated collections.</p>
          </div>
        )}
      </div>
    </div>
  );
}