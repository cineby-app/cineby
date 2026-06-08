export const TMDB_API_KEY = "ab7ec4451ddd6ddd90cfa65ba80478f5";

export interface Movie {
  id: number;
  title: string;
  original_title?: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  vote_count?: number;
  release_date: string;
  overview: string;
  genre_ids?: number[];
  runtime?: number;
  original_language?: string;
  status?: string;
  genres?: { id: number; name: string }[];
  production_companies?: { id: number; logo_path: string | null; name: string; origin_country?: string }[];
  production_countries?: { iso_3166_1: string; name: string }[];
  spoken_languages?: { english_name: string; iso_639_1: string; name: string }[];
}

export interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface Crew {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
}

export interface Keyword {
  id: number;
  name: string;
}

export interface MediaImage {
  aspect_ratio: number;
  file_path: string;
  width: number;
  height: number;
}

export interface Person {
  id: number;
  name: string;
  biography: string;
  profile_path: string | null;
  known_for_department: string;
}

// Helper to convert typical title to slug
export function slugify(title: string, id: number): string {
  const safeTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  return `${safeTitle}-${id}`;
}

// Function to fetch a large batch of unique movies for the homepage
export async function fetchInfiniteMovies(): Promise<Movie[]> {
  const endpoints = [
    `trending/movie/week`,
    `movie/popular`,
    `movie/top_rated`,
    `movie/now_playing`,
    `movie/upcoming`
  ];

  const moviesMap = new Map<number, Movie>();
  const fetchPromises = [];

  for (const endpoint of endpoints) {
    for (let page = 1; page <= 3; page++) {
      fetchPromises.push(
        fetch(`https://api.themoviedb.org/3/${endpoint}?api_key=${TMDB_API_KEY}&page=${page}`, { next: { revalidate: 3600 } })
          .then(res => res.json())
      );
    }
  }

  const results = await Promise.all(fetchPromises);
  
  for (const pageData of results) {
    if (pageData.results) {
      for (const movie of pageData.results) {
        if (movie.poster_path && movie.backdrop_path && movie.overview) {
          moviesMap.set(movie.id, movie as Movie);
        }
      }
    }
  }

  return Array.from(moviesMap.values());
}

export async function fetchMovieDetails(id: string): Promise<Movie | null> {
  const res = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}`, { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  return res.json();
}

export async function fetchMovieCredits(id: string): Promise<Cast[]> {
  const res = await fetch(`https://api.themoviedb.org/3/movie/${id}/credits?api_key=${TMDB_API_KEY}`, { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.cast?.filter((c: Cast) => c.profile_path).slice(0, 15) || [];
}

export async function fetchMovieCrew(id: string): Promise<Crew[]> {
  const res = await fetch(`https://api.themoviedb.org/3/movie/${id}/credits?api_key=${TMDB_API_KEY}`, { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  const data = await res.json();
  const importantJobs = ['Director', 'Writer', 'Producer', 'Original Music Composer', 'Director of Photography'];
  return data.crew?.filter((c: Crew) => c.profile_path && importantJobs.includes(c.job)).slice(0, 12) || [];
}

export async function fetchMovieKeywords(id: string): Promise<Keyword[]> {
  const res = await fetch(`https://api.themoviedb.org/3/movie/${id}/keywords?api_key=${TMDB_API_KEY}`, { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.keywords || [];
}

export async function fetchMovieImages(id: string): Promise<{ backdrops: MediaImage[], posters: MediaImage[] }> {
  const res = await fetch(`https://api.themoviedb.org/3/movie/${id}/images?api_key=${TMDB_API_KEY}`, { next: { revalidate: 3600 } });
  if (!res.ok) return { backdrops: [], posters: [] };
  const data = await res.json();
  return { 
    backdrops: data.backdrops?.slice(0, 10) || [], 
    posters: data.posters?.slice(0, 10) || [] 
  };
}

export async function fetchMovieVideos(id: string): Promise<Video[]> {
  const res = await fetch(`https://api.themoviedb.org/3/movie/${id}/videos?api_key=${TMDB_API_KEY}`, { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.results || [];
}

export async function fetchMovieSimilar(id: string): Promise<Movie[]> {
  const res = await fetch(`https://api.themoviedb.org/3/movie/${id}/similar?api_key=${TMDB_API_KEY}`, { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.results?.filter((m: Movie) => m.poster_path && m.backdrop_path) || [];
}

export async function fetchMovieRecommendations(id: string): Promise<Movie[]> {
  const res = await fetch(`https://api.themoviedb.org/3/movie/${id}/recommendations?api_key=${TMDB_API_KEY}`, { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.results?.filter((m: Movie) => m.poster_path && m.backdrop_path) || [];
}

export async function fetchPersonDetails(id: string): Promise<Person | null> {
  const res = await fetch(`https://api.themoviedb.org/3/person/${id}?api_key=${TMDB_API_KEY}`, { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  return res.json();
}

export async function fetchPersonMovies(id: string): Promise<Movie[]> {
  const res = await fetch(`https://api.themoviedb.org/3/person/${id}/movie_credits?api_key=${TMDB_API_KEY}`, { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  const data = await res.json();
  const movies = data.cast?.filter((m: Movie) => m.poster_path && m.backdrop_path) || [];
  return movies.filter((v: Movie, i: number, a: Movie[]) => a.findIndex(t => t.id === v.id) === i);
}

export async function fetchMoviesByGenre(id: string, sortBy: string = 'popularity.desc', page: number = 1): Promise<Movie[]> {
  const res = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${id}&sort_by=${sortBy}&page=${page}`, { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.results?.filter((m: Movie) => m.poster_path && m.backdrop_path) || [];
}

export async function getGenres(): Promise<{id: number, name: string}[]> {
  const res = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_API_KEY}`, { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.genres || [];
}

export async function fetchTrendingMovies(): Promise<Movie[]> {
  const res = await fetch(`https://api.themoviedb.org/3/trending/movie/day?api_key=${TMDB_API_KEY}`, { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.results?.filter((m: Movie) => m.poster_path && m.backdrop_path) || [];
}

export async function fetchMoviesByKeyword(id: string, sortBy: string = 'popularity.desc', page: number = 1): Promise<Movie[]> {
  const res = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_keywords=${id}&sort_by=${sortBy}&page=${page}`, { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.results?.filter((m: Movie) => m.poster_path && m.backdrop_path) || [];
}

// NEW FUNCTION: Fetch ALL movies for a keyword (paginated)
export async function fetchAllMoviesByKeyword(id: string, sortBy: string = 'popularity.desc'): Promise<Movie[]> {
  let allMovies: Movie[] = [];
  let currentPage = 1;
  let totalPages = 1;
  
  try {
    while (currentPage <= totalPages && currentPage <= 10) { // Limit to 10 pages max (about 200 movies)
      const res = await fetch(
        `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_keywords=${id}&sort_by=${sortBy}&page=${currentPage}`,
        { next: { revalidate: 3600 } }
      );
      
      if (!res.ok) break;
      
      const data = await res.json();
      const filteredMovies = data.results?.filter((m: Movie) => m.poster_path && m.backdrop_path) || [];
      allMovies = [...allMovies, ...filteredMovies];
      
      totalPages = Math.min(data.total_pages || 1, 10); // Limit to 10 pages
      currentPage++;
    }
  } catch (error) {
    console.error('Error fetching keyword movies:', error);
  }
  
  return allMovies;
}

// Add fetchKeywordDetails function
export async function fetchKeywordDetails(id: string): Promise<{ id: number; name: string } | null> {
  const res = await fetch(`https://api.themoviedb.org/3/keyword/${id}?api_key=${TMDB_API_KEY}`, { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  return res.json();
}

// Add to lib/tmdb.ts - place this with your other fetch functions

export interface Review {
  id: string;
  author: string;
  author_details: {
    name: string;
    username: string;
    avatar_path: string;
    rating: number | null;
  };
  content: string;
  created_at: string;
  updated_at: string;
  url: string;
}

export async function fetchMovieReviews(id: string, page: number = 1): Promise<{ results: Review[]; total_pages: number; total_results: number }> {
  const res = await fetch(`https://api.themoviedb.org/3/movie/${id}/reviews?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`, { next: { revalidate: 3600 } });
  if (!res.ok) return { results: [], total_pages: 0, total_results: 0 };
  const data = await res.json();
  return {
    results: data.results || [],
    total_pages: data.total_pages || 0,
    total_results: data.total_results || 0
  };
}

// ============================================
// TV SERIES FUNCTIONS
// ============================================

// Fetch infinite TV shows for homepage rows
export async function fetchInfiniteTV(): Promise<Movie[]> {
  const endpoints = [
    `trending/tv/day`,
    `tv/popular`,
    `tv/top_rated`
  ];

  const tvMap = new Map<number, Movie>();
  const fetchPromises = [];

  for (const endpoint of endpoints) {
    for (let page = 1; page <= 3; page++) {
      fetchPromises.push(
        fetch(`https://api.themoviedb.org/3/${endpoint}?api_key=${TMDB_API_KEY}&page=${page}`, { next: { revalidate: 3600 } })
          .then(res => res.json())
      );
    }
  }

  const results = await Promise.all(fetchPromises);
  
  for (const pageData of results) {
    if (pageData.results) {
      for (const tv of pageData.results) {
        if (tv.poster_path && tv.backdrop_path && tv.overview) {
          tvMap.set(tv.id, {
            id: tv.id,
            title: tv.name,
            original_title: tv.original_name,
            poster_path: tv.poster_path,
            backdrop_path: tv.backdrop_path,
            vote_average: tv.vote_average,
            vote_count: tv.vote_count,
            release_date: tv.first_air_date,
            overview: tv.overview,
            genre_ids: tv.genre_ids,
            original_language: tv.original_language,
            status: tv.status,
          } as Movie);
        }
      }
    }
  }

  return Array.from(tvMap.values());
}

// Fetch trending TV shows
export async function fetchTrendingTV(): Promise<Movie[]> {
  const res = await fetch(`https://api.themoviedb.org/3/trending/tv/day?api_key=${TMDB_API_KEY}`, { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.results?.filter((tv: any) => tv.poster_path && tv.backdrop_path).map((tv: any) => ({
    id: tv.id,
    title: tv.name,
    original_title: tv.original_name,
    poster_path: tv.poster_path,
    backdrop_path: tv.backdrop_path,
    vote_average: tv.vote_average,
    vote_count: tv.vote_count,
    release_date: tv.first_air_date,
    overview: tv.overview,
    genre_ids: tv.genre_ids,
    original_language: tv.original_language,
    status: tv.status,
  } as Movie)) || [];
}

// Fetch popular TV shows
export async function fetchPopularTV(): Promise<Movie[]> {
  const res = await fetch(`https://api.themoviedb.org/3/tv/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`, { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.results?.filter((tv: any) => tv.poster_path && tv.backdrop_path).map((tv: any) => ({
    id: tv.id,
    title: tv.name,
    original_title: tv.original_name,
    poster_path: tv.poster_path,
    backdrop_path: tv.backdrop_path,
    vote_average: tv.vote_average,
    vote_count: tv.vote_count,
    release_date: tv.first_air_date,
    overview: tv.overview,
    genre_ids: tv.genre_ids,
    original_language: tv.original_language,
    status: tv.status,
  } as Movie)) || [];
}

// Fetch top rated TV shows
export async function fetchTopRatedTV(): Promise<Movie[]> {
  const res = await fetch(`https://api.themoviedb.org/3/tv/top_rated?api_key=${TMDB_API_KEY}&language=en-US&page=1`, { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.results?.filter((tv: any) => tv.poster_path && tv.backdrop_path).map((tv: any) => ({
    id: tv.id,
    title: tv.name,
    original_title: tv.original_name,
    poster_path: tv.poster_path,
    backdrop_path: tv.backdrop_path,
    vote_average: tv.vote_average,
    vote_count: tv.vote_count,
    release_date: tv.first_air_date,
    overview: tv.overview,
    genre_ids: tv.genre_ids,
    original_language: tv.original_language,
    status: tv.status,
  } as Movie)) || [];
}

// Fetch TV show details
export async function fetchTVDetails(id: string): Promise<Movie | null> {
  const res = await fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=${TMDB_API_KEY}&language=en-US`, { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  const tv = await res.json();
  return {
    id: tv.id,
    title: tv.name,
    original_title: tv.original_name,
    poster_path: tv.poster_path,
    backdrop_path: tv.backdrop_path,
    vote_average: tv.vote_average,
    vote_count: tv.vote_count,
    release_date: tv.first_air_date,
    overview: tv.overview,
    genres: tv.genres,
    runtime: tv.episode_run_time?.[0],
    original_language: tv.original_language,
    status: tv.status,
  } as Movie;
}

// Fetch TV show credits (cast)
export async function fetchTVCredits(id: string): Promise<Cast[]> {
  const res = await fetch(`https://api.themoviedb.org/3/tv/${id}/credits?api_key=${TMDB_API_KEY}`, { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.cast?.filter((c: Cast) => c.profile_path).slice(0, 15) || [];
}

// Fetch TV show crew
export async function fetchTVCrew(id: string): Promise<Crew[]> {
  const res = await fetch(`https://api.themoviedb.org/3/tv/${id}/credits?api_key=${TMDB_API_KEY}`, { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  const data = await res.json();
  const importantJobs = ['Director', 'Writer', 'Producer', 'Original Music Composer', 'Director of Photography'];
  return data.crew?.filter((c: Crew) => c.profile_path && importantJobs.includes(c.job)).slice(0, 12) || [];
}

// Fetch TV show videos (trailers)
export async function fetchTVVideos(id: string): Promise<Video[]> {
  const res = await fetch(`https://api.themoviedb.org/3/tv/${id}/videos?api_key=${TMDB_API_KEY}`, { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.results || [];
}

// Fetch TV show similar - REPLACE THIS
export async function fetchTVSimilar(id: string): Promise<Movie[]> {
  const res = await fetch(`https://api.themoviedb.org/3/tv/${id}/similar?api_key=${TMDB_API_KEY}&language=en-US`, { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  const data = await res.json();
  // Return ALL results without filtering out by poster_path
  return data.results?.map((tv: any) => ({
    id: tv.id,
    title: tv.name,
    poster_path: tv.poster_path,
    backdrop_path: tv.backdrop_path,
    vote_average: tv.vote_average,
    release_date: tv.first_air_date,
    overview: tv.overview,
  } as Movie)) || [];
}

// Fetch TV show recommendations - REPLACE THIS
export async function fetchTVRecommendations(id: string): Promise<Movie[]> {
  const res = await fetch(`https://api.themoviedb.org/3/tv/${id}/recommendations?api_key=${TMDB_API_KEY}&language=en-US`, { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  const data = await res.json();
  // Return ALL results without filtering out by poster_path
  return data.results?.map((tv: any) => ({
    id: tv.id,
    title: tv.name,
    poster_path: tv.poster_path,
    backdrop_path: tv.backdrop_path,
    vote_average: tv.vote_average,
    release_date: tv.first_air_date,
    overview: tv.overview,
  } as Movie)) || [];
}

// Fetch TV show keywords
export async function fetchTVKeywords(id: string): Promise<Keyword[]> {
  const res = await fetch(`https://api.themoviedb.org/3/tv/${id}/keywords?api_key=${TMDB_API_KEY}`, { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.results || [];
}

// Fetch TV show images
export async function fetchTVImages(id: string): Promise<{ backdrops: MediaImage[], posters: MediaImage[] }> {
  const res = await fetch(`https://api.themoviedb.org/3/tv/${id}/images?api_key=${TMDB_API_KEY}`, { next: { revalidate: 3600 } });
  if (!res.ok) return { backdrops: [], posters: [] };
  const data = await res.json();
  return { 
    backdrops: data.backdrops?.slice(0, 10) || [], 
    posters: data.posters?.slice(0, 10) || [] 
  };
}

// Fetch TV show reviews
export async function fetchTVReviews(id: string, page: number = 1): Promise<{ results: Review[]; total_pages: number; total_results: number }> {
  const res = await fetch(`https://api.themoviedb.org/3/tv/${id}/reviews?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`, { next: { revalidate: 3600 } });
  if (!res.ok) return { results: [], total_pages: 0, total_results: 0 };
  const data = await res.json();
  return {
    results: data.results || [],
    total_pages: data.total_pages || 0,
    total_results: data.total_results || 0
  };
}

// Slugify for TV shows
export function slugifyTV(name: string, id: number): string {
  return `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${id}`;
}

// ============================================
// TV SEASONS & EPISODES FUNCTIONS
// ============================================

// Fetch TV seasons (returns seasons array from TV details)
export async function fetchTVSeasons(id: string): Promise<any[]> {
  const res = await fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=${TMDB_API_KEY}&language=en-US`, { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.seasons || [];
}

// Fetch TV season episodes - THIS WAS THE MISSING FUNCTION!
export async function fetchTVSeasonEpisodes(seriesId: string, seasonNumber: number): Promise<any[]> {
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/tv/${seriesId}/season/${seasonNumber}?api_key=${TMDB_API_KEY}&language=en-US`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.episodes || [];
  } catch (error) {
    console.error('Error fetching season episodes:', error);
    return [];
  }
}

// TV Show interface (separate from Movie for better type safety)
export interface TVShow {
  id: number;
  name: string;
  original_name: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  vote_count: number;
  first_air_date: string;
  last_air_date: string;
  overview: string;
  genres: { id: number; name: string }[];
  number_of_seasons: number;
  number_of_episodes: number;
  status: string;
  original_language: string;
  seasons: {
    id: number;
    name: string;
    overview: string;
    poster_path: string;
    season_number: number;
    episode_count: number;
    air_date: string;
  }[];
  episode_run_time: number[];
}

// Fetch TV show details with full TVShow interface
export async function fetchTVShowDetails(id: string): Promise<TVShow | null> {
  const res = await fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=${TMDB_API_KEY}&language=en-US`, { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  return res.json();
}