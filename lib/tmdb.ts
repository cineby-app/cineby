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
