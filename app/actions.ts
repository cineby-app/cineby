'use server';

import { TMDB_API_KEY, Movie } from '@/lib/tmdb';

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
    const searchParams = new URLSearchParams();
    searchParams.append('api_key', TMDB_API_KEY);
    searchParams.append('sort_by', params.sortBy);
    searchParams.append('vote_count.gte', '500');
    searchParams.append('page', '1');

    if (params.withGenres.length > 0) {
      searchParams.append('with_genres', params.withGenres.join('|'));
    }
    if (params.voteAverageMin > 0) {
      searchParams.append('vote_average.gte', params.voteAverageMin.toString());
    }
    if (params.yearMin && params.yearMax) {
      searchParams.append('primary_release_date.gte', `${params.yearMin}-01-01`);
      searchParams.append('primary_release_date.lte', `${params.yearMax}-12-31`);
    }
    
    if (params.runtimeMin !== null) searchParams.append('with_runtime.gte', String(params.runtimeMin));
    if (params.runtimeMax !== null) searchParams.append('with_runtime.lte', String(params.runtimeMax));

    let res = await fetch(`https://api.themoviedb.org/3/discover/movie?${searchParams.toString()}`);
    let data = await res.json();
    let results: Movie[] = data.results || [];

    if (results.length === 0) {
      res = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&page=1`);
      data = await res.json();
      results = data.results || [];
    }

    const skippedSet = new Set(params.skippedMovieIds);
    results = results.filter(m => !skippedSet.has(m.id) && m.poster_path);

    const scoredMovies = results.map(movie => {
      let score = 40;
      
      if (params.withGenres.length > 0 && movie.genre_ids) {
        const matches = movie.genre_ids.filter(id => params.withGenres.includes(id.toString())).length;
        score += (matches / params.withGenres.length) * 25;
      }

      if (movie.vote_average) {
          if (movie.vote_average >= 8.0) score += 20;
          else if (movie.vote_average >= 7.5) score += 18;
          else if (movie.vote_average >= 7.0) score += 15;
          else if (movie.vote_average >= 6.0) score += 10;
          else score += 5;
      } else {
          score += 5;
      }

      if (movie.popularity !== undefined) {
        if (movie.popularity > 200) score += 10;
        else if (movie.popularity > 100) score += 8;
        else if (movie.popularity > 50) score += 5;
        else if (movie.popularity > 20) score += 3;
      }

      if (movie.vote_count !== undefined) {
        if (movie.vote_count > 10000) score += 5;
        else if (movie.vote_count > 5000) score += 3;
        else if (movie.vote_count > 1000) score += 2;
      }

      if (movie.release_date) {
          const year = parseInt(movie.release_date.split('-')[0], 10);
          if (params.yearMin && params.yearMax && year >= params.yearMin && year <= params.yearMax) {
              score += 10;
          }
      }

      score += (Math.random() * 10 - 5);

      return { movie, score: Math.max(0, Math.min(100, score)) };
    });

    scoredMovies.sort((a, b) => b.score - a.score);
    
    return scoredMovies.slice(0, 20).map(item => item.movie);
  } catch (error) {
    console.error("Action error:", error);
    return [];
  }
}

export async function getMoviesByKeywordsAction(keywords: string[]): Promise<Movie[]> {
  try {
    for (let i = 0; i < keywords.length; i++) {
        const searchParams = new URLSearchParams();
        searchParams.append('api_key', TMDB_API_KEY);
        // Exclude generic genres from search to get better text matches
        const query = keywords[i];
        if (['Sci-Fi', 'Movies', 'Top 10', 'Indie', 'Cinema', 'A24', 'Filmmaking', 'Hollywood', 'Thrillers', 'Directing'].includes(query)) {
            continue;
        }

        searchParams.append('query', query);
        
        const res = await fetch(`https://api.themoviedb.org/3/search/movie?${searchParams.toString()}`);
        const data = await res.json();
        const results: Movie[] = data.results || [];
        
        const validMovies = results.filter(m => m.poster_path);
        if (validMovies.length > 2) {
            return validMovies.slice(0, 5);
        }
    }

    // fallback if no keyword matches, fetch popular
    const res = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&page=1`);
    const data = await res.json();
    const results: Movie[] = data.results || [];
    return results.filter(m => m.poster_path).slice(0, 5);
  } catch (error) {
    console.error("Action error:", error);
    return [];
  }
}
