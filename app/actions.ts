'use server';

import { TMDB_API_KEY } from '@/lib/tmdb';

// Define Movie type locally to ensure all properties are included
interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity?: number;
  genre_ids?: number[];
  original_language?: string;
  original_title?: string;
}

// Cache for API responses to reduce duplicate calls
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function fetchWithCache(url: string, cacheKey: string): Promise<any> {
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 }, // Next.js cache for 1 hour
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    console.error(`Fetch error for ${url}:`, error);
    throw error;
  }
}

export async function getMatchedMoviesAction(params: {
  withGenres: string[];
  sortBy: string;
  voteAverageMin: number;
  yearMin: number | null;
  yearMax: number | null;
  runtimeMin: number | null;
  runtimeMax: number | null;
  skippedMovieIds: number[];
}): Promise<Movie[]> {
  try {
    // Validate input parameters
    if (!params.sortBy) {
      params.sortBy = 'popularity.desc';
    }

    const searchParams = new URLSearchParams();
    searchParams.append('api_key', TMDB_API_KEY);
    searchParams.append('sort_by', params.sortBy);
    searchParams.append('vote_count.gte', '500');
    searchParams.append('page', '1');
    searchParams.append('language', 'en-US');

    // Add genre filters
    if (params.withGenres.length > 0) {
      searchParams.append('with_genres', params.withGenres.join('|'));
    }
    
    // Add vote average filter
    if (params.voteAverageMin > 0) {
      searchParams.append('vote_average.gte', Math.min(params.voteAverageMin, 10).toString());
    }
    
    // Add year range filter
    if (params.yearMin && params.yearMax) {
      const minYear = Math.max(1900, params.yearMin);
      const maxYear = Math.min(new Date().getFullYear(), params.yearMax);
      if (minYear <= maxYear) {
        searchParams.append('primary_release_date.gte', `${minYear}-01-01`);
        searchParams.append('primary_release_date.lte', `${maxYear}-12-31`);
      }
    }
    
    // Add runtime filters
    if (params.runtimeMin !== null && params.runtimeMin > 0) {
      searchParams.append('with_runtime.gte', String(Math.min(params.runtimeMin, 500)));
    }
    if (params.runtimeMax !== null && params.runtimeMax > 0) {
      searchParams.append('with_runtime.lte', String(Math.min(params.runtimeMax, 500)));
    }

    const cacheKey = `discover_${searchParams.toString()}`;
    let data = await fetchWithCache(
      `https://api.themoviedb.org/3/discover/movie?${searchParams.toString()}`,
      cacheKey
    );
    let results: Movie[] = data.results || [];

    // Fallback to popular movies if no results
    if (results.length === 0) {
      const fallbackData = await fetchWithCache(
        `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&page=1&language=en-US`,
        'popular_movies'
      );
      results = fallbackData.results || [];
    }

    // Filter out skipped movies and those without posters
    const skippedSet = new Set(params.skippedMovieIds);
    results = results.filter(m => !skippedSet.has(m.id) && m.poster_path);

    if (results.length === 0) {
      return [];
    }

    // Score and sort movies
    const scoredMovies = results.map(movie => {
      let score = 40;
      
      // Genre match score (max 25 points)
      if (params.withGenres.length > 0 && movie.genre_ids) {
        const matches = movie.genre_ids.filter(id => params.withGenres.includes(id.toString())).length;
        score += (matches / params.withGenres.length) * 25;
      }

      // Rating score (max 20 points)
      if (movie.vote_average) {
        if (movie.vote_average >= 8.0) score += 20;
        else if (movie.vote_average >= 7.5) score += 18;
        else if (movie.vote_average >= 7.0) score += 15;
        else if (movie.vote_average >= 6.0) score += 10;
        else if (movie.vote_average >= 5.0) score += 5;
        else score += 2;
      } else {
        score += 5;
      }

      // Popularity score (max 10 points) - using optional chaining
      const popularity = (movie as any).popularity;
      if (popularity !== undefined && popularity !== null) {
        if (popularity > 200) score += 10;
        else if (popularity > 100) score += 8;
        else if (popularity > 50) score += 5;
        else if (popularity > 20) score += 3;
        else if (popularity > 10) score += 1;
      }

      // Vote count score (max 5 points)
      if (movie.vote_count !== undefined) {
        if (movie.vote_count > 10000) score += 5;
        else if (movie.vote_count > 5000) score += 3;
        else if (movie.vote_count > 1000) score += 2;
        else if (movie.vote_count > 500) score += 1;
      }

      // Year match bonus (max 10 points)
      if (movie.release_date && params.yearMin && params.yearMax) {
        const year = parseInt(movie.release_date.split('-')[0], 10);
        if (year >= params.yearMin && year <= params.yearMax) {
          score += 10;
        }
      }

      // Small random factor for variety (±5 points)
      score += (Math.random() * 10 - 5);

      return { movie, score: Math.max(0, Math.min(100, score)) };
    });

    // Sort by score descending and return top 20
    scoredMovies.sort((a, b) => b.score - a.score);
    return scoredMovies.slice(0, 20).map(item => item.movie);
    
  } catch (error) {
    console.error("Error in getMatchedMoviesAction:", error);
    // Return empty array instead of throwing to prevent UI crashes
    return [];
  }
}

export async function getMoviesByKeywordsAction(keywords: string[]): Promise<Movie[]> {
  try {
    // Validate input
    if (!keywords || keywords.length === 0) {
      return await getPopularMoviesFallback();
    }

    // List of generic terms to skip
    const skipTerms = new Set([
      'Sci-Fi', 'Movies', 'Top 10', 'Indie', 'Cinema', 'A24', 
      'Filmmaking', 'Hollywood', 'Thrillers', 'Directing', 'Film',
      'Movie', 'Watch', 'Stream', 'Best', 'Top', 'New', 'Latest'
    ]);

    // Try each keyword until we find results
    for (const keyword of keywords) {
      const trimmedKeyword = keyword.trim();
      
      // Skip empty or generic keywords
      if (!trimmedKeyword || skipTerms.has(trimmedKeyword) || trimmedKeyword.length < 2) {
        continue;
      }

      const searchParams = new URLSearchParams();
      searchParams.append('api_key', TMDB_API_KEY);
      searchParams.append('query', trimmedKeyword);
      searchParams.append('page', '1');
      searchParams.append('language', 'en-US');
      searchParams.append('include_adult', 'false');

      const cacheKey = `search_${trimmedKeyword}`;
      const data = await fetchWithCache(
        `https://api.themoviedb.org/3/search/movie?${searchParams.toString()}`,
        cacheKey
      );
      
      const results: Movie[] = data.results || [];
      const validMovies = results.filter(m => m.poster_path && m.vote_average > 5);
      
      if (validMovies.length >= 3) {
        // Return top 5 most relevant movies
        return validMovies
          .sort((a, b) => {
            const popA = (a as any).popularity || 0;
            const popB = (b as any).popularity || 0;
            return popB - popA;
          })
          .slice(0, 5);
      }
    }

    // Fallback to popular movies
    return await getPopularMoviesFallback();
    
  } catch (error) {
    console.error("Error in getMoviesByKeywordsAction:", error);
    return await getPopularMoviesFallback();
  }
}

// Helper function to get popular movies as fallback
async function getPopularMoviesFallback(): Promise<Movie[]> {
  try {
    const data = await fetchWithCache(
      `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&page=1&language=en-US`,
      'popular_movies_fallback'
    );
    const results: Movie[] = data.results || [];
    return results.filter(m => m.poster_path).slice(0, 5);
  } catch (error) {
    console.error("Error in fallback:", error);
    return [];
  }
}

// Optional: Add a function to clear cache when needed
export async function clearMovieCache(): Promise<void> {
  cache.clear();
}