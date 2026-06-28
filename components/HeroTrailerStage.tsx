'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from "next/image";
import Link from "next/link";
import { Movie, Crew } from "@/lib/tmdb";

interface HeroTrailerStageProps {
  movies: Movie[];
  heroMovie: Movie | null;
  isSearching: boolean;
}

export default function HeroTrailerStage({ 
  movies, 
  heroMovie, 
  isSearching 
}: HeroTrailerStageProps) {
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [slidingArray, setSlidingArray] = useState<Movie[]>([]);
  const [currentCrew, setCurrentCrew] = useState<Crew[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [isLoadingTrailer, setIsLoadingTrailer] = useState(true);
  const [showPoster, setShowPoster] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const posterTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchTrailer = useCallback(async (movieId: number) => {
    setIsLoadingTrailer(true);
    setTrailerKey(null);
    setShowPoster(true);
    setIsMuted(true);
    
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=ab7ec4451ddd6ddd90cfa65ba80478f5`
      );
      const data = await res.json();
      
      const trailer = data.results?.find(
        (v: any) => v.site === 'YouTube' && v.type === 'Trailer' && v.official === true
      );
      const fallbackTrailer = data.results?.find(
        (v: any) => v.site === 'YouTube' && v.type === 'Trailer'
      );
      const anyVideo = data.results?.find((v: any) => v.site === 'YouTube');
      const selectedTrailer = trailer || fallbackTrailer || anyVideo;
      
      setTrailerKey(selectedTrailer?.key || null);
    } catch (error) {
      console.error('Error fetching trailer:', error);
      setTrailerKey(null);
    } finally {
      setIsLoadingTrailer(false);
    }
  }, []);

  useEffect(() => {
    if (movies && movies.length > 0) {
      setSlidingArray(movies.slice(0, 6));
    } else if (heroMovie) {
      setSlidingArray([heroMovie]);
    }
  }, [movies, heroMovie]);

  const activeMediaItem = slidingArray[activeSlideIdx] || heroMovie;

  useEffect(() => {
    if (!activeMediaItem) return;
    fetchTrailer(activeMediaItem.id);
  }, [activeMediaItem, fetchTrailer]);

  useEffect(() => {
    if (!activeMediaItem) return;
    fetch(`https://api.themoviedb.org/3/movie/${activeMediaItem.id}/credits?api_key=ab7ec4451ddd6ddd90cfa65ba80478f5`)
      .then(res => res.json())
      .then(data => {
        const importantJobs = ['Director', 'Writer', 'Producer', 'Screenplay', 'Story'];
        const filteredCrew = data.crew?.filter((c: any) => importantJobs.includes(c.job)).slice(0, 4) || [];
        setCurrentCrew(filteredCrew);
      })
      .catch(err => console.error("Error fetching crew:", err));
  }, [activeMediaItem]);

  useEffect(() => {
    if (slidingArray.length <= 1) return;

    const timer = setTimeout(() => {
        handleNext();
    }, 15000);

    return () => clearTimeout(timer);
  }, [activeSlideIdx, slidingArray]);

  useEffect(() => {
    if (!activeMediaItem || isLoadingTrailer || !trailerKey) return;
    
    if (posterTimerRef.current) clearTimeout(posterTimerRef.current);
    setShowPoster(true);
    
    posterTimerRef.current = setTimeout(() => {
      setShowPoster(false);
    }, 3000);

    return () => {
      if (posterTimerRef.current) clearTimeout(posterTimerRef.current);
    };
  }, [activeMediaItem, isLoadingTrailer, trailerKey]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  if (isSearching || !activeMediaItem) return null;

  const movieGenresMap: { [key: number]: string } = {
    28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime', 
    99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History', 
    27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 
    53: 'Thriller', 10752: 'War', 37: 'Western'
  };

  // ✅ FIX: Use type assertion for Movie to access name property
  const movieWithName = activeMediaItem as Movie & { name?: string };
  const title = movieWithName.title || movieWithName.name || '';
  
  // ✅ FIX: Use type assertion for date properties
  const movieWithDates = activeMediaItem as Movie & { first_air_date?: string };
  const year = movieWithDates.release_date 
    ? new Date(movieWithDates.release_date).getFullYear() 
    : movieWithDates.first_air_date 
      ? new Date(movieWithDates.first_air_date).getFullYear() 
      : "2026";

  const handleNext = () => {
    if (isTransitioning || slidingArray.length <= 1) return;
    setIsTransitioning(true);
    setActiveSlideIdx((prev) => (prev + 1) % slidingArray.length);
    setTimeout(() => setIsTransitioning(false), 700);
  };

  const handlePrev = () => {
    if (isTransitioning || slidingArray.length <= 1) return;
    setIsTransitioning(true);
    setActiveSlideIdx((prev) => (prev - 1 + slidingArray.length) % slidingArray.length);
    setTimeout(() => setIsTransitioning(false), 700);
  };

  const handleThumbnailClick = (index: number) => {
    if (isTransitioning || index === activeSlideIdx) return;
    setIsTransitioning(true);
    setActiveSlideIdx(index);
    setTimeout(() => setIsTransitioning(false), 700);
  };

  const genres = activeMediaItem.genre_ids?.map(id => movieGenresMap[id]).filter(Boolean).slice(0, 3) || ["Cinema", "Drama"];

  // ✅ WORKING IFRAME with ALL controls hidden
  const youtubeUrl = trailerKey 
    ? `https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&fs=0&playsinline=1&cc_load_policy=0&autohide=1&loop=1&playlist=${trailerKey}`
    : null;

  return (
    <section className="relative w-full bg-[#05050A] overflow-hidden select-none">
      
      {/* PATTERN SQUARES BACKGROUND */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* DESKTOP LAYOUT (md and up) */}
      <div className="hidden md:flex w-full h-screen relative z-10">
        {/* LEFT: Video */}
        <div className="relative w-[45%] h-full">
          <div className="relative w-full h-full">
            {isLoadingTrailer && (
              <div className="absolute inset-0 z-[60] flex items-center justify-center bg-[#05050A]">
                <div className="w-10 h-10 border-[1.5px] border-white/10 border-t-[#E50914] rounded-full animate-spin" />
              </div>
            )}

            <div className="absolute inset-0 z-10">
              <Image
                src={`https://image.tmdb.org/t/p/original${activeMediaItem.poster_path}`}
                alt={title}
                fill
                className="object-cover"
                priority
                referrerPolicy="no-referrer"
              />
            </div>

            {/* ✅ WORKING IFRAME - NO CONTROLS */}
            {youtubeUrl && (
              <div className="absolute inset-0 z-20 overflow-hidden">
                <iframe
                  src={youtubeUrl}
                  className="absolute top-1/2 left-1/2"
                  style={{
                    width: '350.78vh',
                    height: '100%',
                    transform: 'translate(-50%, -50%)',
                    border: 'none',
                    pointerEvents: 'none',
                  }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen={false}
                  loading="eager"
                  title={`${title} trailer`}
                />
                {/* ✅ HIDE CONTROLS WITH OVERLAY */}
                <div className="absolute bottom-0 left-0 right-0 z-[25] pointer-events-none" style={{
                  height: '100px',
                  background: 'linear-gradient(to top, #05050A 0%, transparent 100%)',
                }} />
                <div className="absolute top-0 left-0 right-0 z-[25] pointer-events-none" style={{
                  height: '70px',
                  background: 'linear-gradient(to bottom, #05050A 0%, transparent 100%)',
                }} />
              </div>
            )}

            {/* Poster overlay */}
            <div 
              className={`absolute inset-0 transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)] z-40 ${
                showPoster && !isLoadingTrailer 
                  ? 'opacity-100' 
                  : 'opacity-0 pointer-events-none'
              }`}
            >
              <Image
                src={`https://image.tmdb.org/t/p/original${activeMediaItem.poster_path}`}
                alt={title}
                fill
                className="object-cover"
                priority
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Edge shadow gradient */}
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#05050A] to-transparent z-30 pointer-events-none" />

            {/* Mute toggle button */}
            {!showPoster && !isLoadingTrailer && youtubeUrl && (
              <button
                onClick={toggleMute}
                className="absolute top-8 right-8 z-[60] w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all duration-300"
              >
                {isMuted ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                )}
              </button>
            )}

            {/* Navigation arrows */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 z-[60]">
              <button
                onClick={handlePrev}
                disabled={slidingArray.length <= 1}
                className="w-11 h-11 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 hover:border-white/30 transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10">
                <span className="text-white text-xs font-medium tracking-wider">
                  {String(activeSlideIdx + 1).padStart(2, '0')} / {String(slidingArray.length).padStart(2, '0')}
                </span>
              </div>
              
              <button
                onClick={handleNext}
                disabled={slidingArray.length <= 1}
                className="w-11 h-11 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 hover:border-white/30 transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: Info */}
        <div className="w-[55%] h-full bg-[#05050A] flex flex-col justify-between px-16 xl:px-20 py-10 xl:py-14">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#e50914]" />
              <span className="text-white/80 text-xs font-bold tracking-[0.3em] uppercase">Cineby</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-white/30 text-[10px] tracking-wider uppercase">Now Playing</span>
              <div className="w-1.5 h-1.5 rounded-full bg-[#e50914] animate-pulse ml-1" />
            </div>
          </div>

          <div className={`flex-1 flex flex-col justify-center transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            isTransitioning ? 'opacity-0 translate-y-6' : 'opacity-100 translate-y-0'
          }`}>
            <div className="flex items-center gap-2 mb-4 xl:mb-5 flex-wrap">
              {genres.map((genre, i) => (
                <span key={i} className="px-3 py-1 text-[10px] font-medium tracking-[0.15em] uppercase text-white/40 border border-white/10 rounded-full">
                  {genre}
                </span>
              ))}
            </div>

            <h1 className="text-4xl xl:text-6xl 2xl:text-7xl font-black text-white mb-4 xl:mb-5 tracking-tight leading-[0.95]">
              {title}
            </h1>

            <div className="flex items-center flex-wrap gap-3 xl:gap-5 mb-5 xl:mb-6 text-sm">
              <span className="flex items-center gap-1.5 text-white/80">
                <svg className="w-4 h-4 text-[#e50914] fill-[#e50914]" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-bold">{activeMediaItem.vote_average?.toFixed(1)}</span>
              </span>
              <span className="text-white/20">|</span>
              <span className="text-white/50 font-medium">{year}</span>
              <span className="text-white/20 hidden sm:inline">|</span>
              <span className="text-white/50 font-medium hidden sm:inline">2h 10m</span>
              <span className="text-white/20 hidden sm:inline">|</span>
              <span className="px-2 py-0.5 text-[10px] font-bold text-[#05050A] bg-white/80 rounded-sm tracking-wider uppercase">HD</span>
            </div>
            
            <p className="text-white/40 text-xs xl:text-sm leading-[1.7] max-w-lg mb-6 xl:mb-8 line-clamp-3 xl:line-clamp-none">
              {activeMediaItem.overview 
                ? activeMediaItem.overview.slice(0, 180) + (activeMediaItem.overview.length > 180 ? '...' : '')
                : 'Watch this amazing movie in stunning quality.'
              }
            </p>

            {currentCrew.length > 0 && (
              <div className="mb-6 xl:mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-4 h-[1px] bg-white/20" />
                  <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">
                    Featured Crew
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-6 xl:gap-x-8 gap-y-3">
                  {currentCrew.map((person, index) => (
                    <div key={`${person.id}-${index}`} className="flex items-center gap-3 group cursor-default">
                      <div className="relative w-8 h-8 rounded-full overflow-hidden bg-white/5 ring-1 ring-white/10 group-hover:ring-white/30 transition-all duration-300">
                        {person.profile_path ? (
                          <Image
                            src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                            alt={person.name}
                            fill
                            className="object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/30 text-xs font-bold">
                            {person.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="text-white/70 text-xs font-medium block group-hover:text-white transition-colors">{person.name}</span>
                        <span className="text-white/25 text-[10px] tracking-wider uppercase">{person.job}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center flex-wrap gap-3 xl:gap-4 pb-5">
              <Link 
                href={`/${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${activeMediaItem.id}`}
                className="group inline-flex items-center gap-2 xl:gap-3 px-6 xl:px-8 py-3 xl:py-3.5 bg-[#e50914] text-white rounded-lg font-bold text-xs tracking-[0.15em] uppercase hover:bg-[#b20710] transition-all duration-300 shadow-lg shadow-[#e50914]/20 hover:shadow-[#e50914]/30 hover:scale-[1.02]"
              >
                <svg className="w-3 xl:w-4 h-3 xl:h-4" fill="currentColor" viewBox="0 0 24 24">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Watch Now
              </Link>
              
              <Link 
                href={`/${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${activeMediaItem.id}`}
                className="inline-flex items-center gap-2 px-4 xl:px-6 py-3 xl:py-3.5 border border-white/10 text-white/60 rounded-lg font-bold text-xs tracking-[0.15em] uppercase hover:text-white hover:border-white/30 hover:bg-white/5 transition-all duration-300"
              >
                Details
              </Link>
            </div>
          </div>

          <div className="flex items-end justify-between">
            <div className="flex items-end gap-2 xl:gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {slidingArray.map((movie, index) => {
                // ✅ FIX: Use type assertion for thumbnail title
                const movieWithName = movie as Movie & { name?: string };
                const thumbTitle = movieWithName.title || movieWithName.name || '';
                
                return (
                  <button
                    key={movie.id}
                    onClick={() => handleThumbnailClick(index)}
                    className={`relative flex-shrink-0 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group ${
                      index === activeSlideIdx 
                        ? 'w-20 xl:w-24 h-[120px] xl:h-[140px] opacity-100 ring-1 ring-white/20' 
                        : 'w-16 xl:w-[88px] h-[100px] xl:h-[120px] opacity-40 hover:opacity-70'
                    }`}
                  >
                    <Image
                      src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                      alt={thumbTitle}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    {index === activeSlideIdx && (
                      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#e50914]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE LAYOUT (below md) */}
      <div className="flex md:hidden flex-col w-full min-h-screen bg-[#05050A] relative z-10">
        
        <div className="relative w-full h-[50vh] flex-shrink-0">
          {isLoadingTrailer && (
            <div className="absolute inset-0 z-[60] flex items-center justify-center bg-[#05050A]">
              <div className="w-8 h-8 border-[1.5px] border-white/10 border-t-[#E50914] rounded-full animate-spin" />
            </div>
          )}

          <div className="absolute inset-0 z-10">
            <Image
              src={`https://image.tmdb.org/t/p/original${activeMediaItem.poster_path}`}
              alt={title}
              fill
              className="object-cover"
              priority
              referrerPolicy="no-referrer"
            />
          </div>

          {/* ✅ WORKING IFRAME - MOBILE */}
          {youtubeUrl && (
            <div className="absolute inset-0 z-20 overflow-hidden">
              <iframe
                src={youtubeUrl}
                className="absolute top-1/2 left-1/2"
                style={{
                  width: '250.78vh',
                  height: '100%',
                  transform: 'translate(-50%, -50%)',
                  border: 'none',
                  pointerEvents: 'none',
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen={false}
                loading="eager"
                title={`${title} trailer`}
              />
              <div className="absolute bottom-0 left-0 right-0 z-[25] pointer-events-none" style={{
                height: '80px',
                background: 'linear-gradient(to top, #05050A 0%, transparent 100%)',
              }} />
              <div className="absolute top-0 left-0 right-0 z-[25] pointer-events-none" style={{
                height: '60px',
                background: 'linear-gradient(to bottom, #05050A 0%, transparent 100%)',
              }} />
            </div>
          )}

          <div 
            className={`absolute inset-0 transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)] z-40 ${
              showPoster && !isLoadingTrailer 
                ? 'opacity-100' 
                : 'opacity-0 pointer-events-none'
            }`}
          >
            <Image
              src={`https://image.tmdb.org/t/p/original${activeMediaItem.poster_path}`}
              alt={title}
              fill
              className="object-cover"
              priority
              referrerPolicy="no-referrer"
            />
          </div>

          {!showPoster && !isLoadingTrailer && youtubeUrl && (
            <button
              onClick={toggleMute}
              className="absolute top-4 right-4 z-[60] w-9 h-9 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all duration-300"
            >
              {isMuted ? (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              )}
            </button>
          )}

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-[60]">
            <button
              onClick={handlePrev}
              disabled={slidingArray.length <= 1}
              className="w-9 h-9 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 hover:border-white/30 transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10">
              <span className="text-white text-[10px] font-medium tracking-wider">
                {String(activeSlideIdx + 1).padStart(2, '0')} / {String(slidingArray.length).padStart(2, '0')}
              </span>
            </div>
            
            <button
              onClick={handleNext}
              disabled={slidingArray.length <= 1}
              className="w-9 h-9 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 hover:border-white/30 transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* BOTTOM: Info Section */}
        <div className="flex-1 w-full bg-[#05050A] flex flex-col px-4 py-4 overflow-y-auto">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#e50914]" />
              <span className="text-white/60 text-[10px] font-bold tracking-[0.2em] uppercase">Cineby</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-white/20 text-[8px] tracking-wider uppercase">Now Playing</span>
              <div className="w-1 h-1 rounded-full bg-[#e50914] animate-pulse ml-1" />
            </div>
          </div>

          <div className={`flex-1 transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            isTransitioning ? 'opacity-0 translate-y-6' : 'opacity-100 translate-y-0'
          }`}>
            <div className="flex items-center gap-1.5 mb-2 flex-wrap">
              {genres.map((genre, i) => (
                <span key={i} className="px-2 py-0.5 text-[8px] font-medium tracking-[0.1em] uppercase text-white/40 border border-white/10 rounded-full">
                  {genre}
                </span>
              ))}
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white mb-1 tracking-tight leading-[1.1] line-clamp-2">
              {title}
            </h1>

            <div className="flex items-center flex-wrap gap-2 mb-2 text-xs">
              <span className="flex items-center gap-1 text-white/70">
                <svg className="w-3 h-3 text-[#e50914] fill-[#e50914]" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-bold">{activeMediaItem.vote_average?.toFixed(1)}</span>
              </span>
              <span className="text-white/20">|</span>
              <span className="text-white/40 font-medium">{year}</span>
              <span className="text-white/20">|</span>
              <span className="px-1.5 py-0.5 text-[8px] font-bold text-[#05050A] bg-white/80 rounded-sm tracking-wider uppercase">HD</span>
            </div>
            
            <p className="text-white/40 text-[11px] leading-[1.5] mb-2 line-clamp-2 sm:line-clamp-3">
              {activeMediaItem.overview 
                ? activeMediaItem.overview.slice(0, 100) + (activeMediaItem.overview.length > 100 ? '...' : '')
                : 'Watch this amazing movie in stunning quality.'
              }
            </p>

            {currentCrew.length > 0 && (
              <div className="mb-2">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-3 h-[1px] bg-white/20" />
                  <span className="text-[8px] font-medium uppercase tracking-[0.2em] text-white/30">
                    Crew
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                  {currentCrew.slice(0, 3).map((person, index) => (
                    <div key={`${person.id}-${index}`} className="flex items-center gap-2">
                      <div className="relative w-6 h-6 rounded-full overflow-hidden bg-white/5 ring-1 ring-white/10">
                        {person.profile_path ? (
                          <Image
                            src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                            alt={person.name}
                            fill
                            className="object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/30 text-[8px] font-bold">
                            {person.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="text-white/70 text-[10px] font-medium block">{person.name}</span>
                        <span className="text-white/25 text-[8px] tracking-wider uppercase">{person.job}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 mt-2">
              <Link 
                href={`/${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${activeMediaItem.id}`}
                className="group inline-flex items-center gap-1.5 px-4 py-2 bg-[#e50914] text-white rounded-lg font-bold text-[10px] tracking-[0.1em] uppercase hover:bg-[#b20710] transition-all duration-300 shadow-lg shadow-[#e50914]/20 flex-1 justify-center"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Watch
              </Link>
              
              <Link 
                href={`/${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${activeMediaItem.id}`}
                className="inline-flex items-center gap-1 px-3 py-2 border border-white/10 text-white/50 rounded-lg font-bold text-[10px] tracking-[0.1em] uppercase hover:text-white hover:border-white/30 hover:bg-white/5 transition-all duration-300"
              >
                Details
              </Link>
            </div>
          </div>

          {/* Thumbnails */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 mt-3 scrollbar-hide">
            {slidingArray.map((movie, index) => {
              // ✅ FIX: Use type assertion for thumbnail title
              const movieWithName = movie as Movie & { name?: string };
              const thumbTitle = movieWithName.title || movieWithName.name || '';
              
              return (
                <button
                  key={movie.id}
                  onClick={() => handleThumbnailClick(index)}
                  className={`relative flex-shrink-0 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group ${
                    index === activeSlideIdx 
                      ? 'w-12 h-[65px] opacity-100 ring-1 ring-white/20' 
                      : 'w-10 h-[55px] opacity-40 hover:opacity-70'
                  }`}
                >
                  <Image
                    src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                    alt={thumbTitle}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  {index === activeSlideIdx && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#e50914]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="h-8 md:h-5 relative z-10" />

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}