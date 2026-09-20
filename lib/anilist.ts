// lib/anilist.ts
const ANILIST_API_URL = "https://graphql.anilist.co";

// Types for Anime (matching TMDb structure)
export interface Anime {
  id: number;
  title: string;
  original_title?: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  vote_count?: number;
  release_date: string;
  genres: string[];
  episodes?: number;
  duration?: number;
  status?: string;
  season?: string;
  studios?: string[];
  trailer?: string;
  media_type: "anime";
}

export interface AnimeCharacter {
  id: number;
  name: string;
  role: string;
  image: string;
}

export interface AnimeStudio {
  id: number;
  name: string;
}

export interface AnimeRecommendation {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
}

// GraphQL Queries
const TRENDING_ANIME_QUERY = `
  query ($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        currentPage
        hasNextPage
      }
      media(type: ANIME, sort: TRENDING_DESC, isAdult: false) {
        id
        title {
          romaji
          english
          native
        }
        description
        coverImage {
          large
          extraLarge
        }
        bannerImage
        averageScore
        popularity
        genres
        episodes
        duration
        status
        season
        seasonYear
        startDate {
          year
          month
          day
        }
        trailer {
          id
          site
        }
        studios {
          nodes {
            id
            name
          }
        }
      }
    }
  }
`;

const POPULAR_ANIME_QUERY = `
  query ($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(type: ANIME, sort: POPULARITY_DESC, isAdult: false) {
        id
        title {
          romaji
          english
        }
        description
        coverImage {
          large
        }
        bannerImage
        averageScore
        genres
        episodes
        duration
        status
        season
        seasonYear
        startDate {
          year
        }
      }
    }
  }
`;

const TOP_RATED_ANIME_QUERY = `
  query ($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(type: ANIME, sort: SCORE_DESC, isAdult: false) {
        id
        title {
          romaji
          english
        }
        description
        coverImage {
          large
        }
        bannerImage
        averageScore
        genres
        episodes
        duration
        status
        seasonYear
        startDate {
          year
        }
      }
    }
  }
`;

const SEASONAL_ANIME_QUERY = `
  query ($season: MediaSeason, $year: Int, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(type: ANIME, season: $season, seasonYear: $year, sort: POPULARITY_DESC, isAdult: false) {
        id
        title {
          romaji
          english
        }
        description
        coverImage {
          large
        }
        bannerImage
        averageScore
        genres
        episodes
        status
        seasonYear
      }
    }
  }
`;

const UPCOMING_ANIME_QUERY = `
  query ($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(type: ANIME, status: NOT_YET_RELEASED, sort: POPULARITY_DESC, isAdult: false) {
        id
        title {
          romaji
          english
        }
        description
        coverImage {
          large
        }
        bannerImage
        averageScore
        genres
        episodes
        status
        startDate {
          year
          month
          day
        }
      }
    }
  }
`;

const RECENTLY_ADDED_ANIME_QUERY = `
  query ($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(type: ANIME, sort: ID_DESC, isAdult: false) {
        id
        title {
          romaji
          english
        }
        description
        coverImage {
          large
        }
        bannerImage
        averageScore
        genres
        episodes
        status
      }
    }
  }
`;

const ANIME_DETAILS_QUERY = `
  query ($id: Int) {
    Media(id: $id, type: ANIME) {
      id
      title {
        romaji
        english
        native
      }
      description
      coverImage {
        extraLarge
        large
      }
      bannerImage
      averageScore
      popularity
      genres
      episodes
      duration
      status
      season
      seasonYear
      startDate {
        year
        month
        day
      }
      endDate {
        year
        month
        day
      }
      trailer {
        id
        site
        thumbnail
      }
      studios {
        nodes {
          id
          name
        }
      }
      characters(sort: ROLE, perPage: 10) {
        nodes {
          id
          name {
            full
          }
          image {
            large
          }
        }
      }
      recommendations(sort: RATING_DESC, perPage: 10) {
        nodes {
          mediaRecommendation {
            id
            title {
              romaji
              english
            }
            coverImage {
              large
            }
            averageScore
          }
        }
      }
      relations {
        nodes {
          id
          title {
            romaji
            english
          }
          coverImage {
            large
          }
          averageScore
          relationType
        }
      }
    }
  }
`;

const SEARCH_ANIME_QUERY = `
  query ($search: String, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(type: ANIME, search: $search, isAdult: false) {
        id
        title {
          romaji
          english
        }
        description
        coverImage {
          large
        }
        bannerImage
        averageScore
        genres
        episodes
        status
        seasonYear
      }
    }
  }
`;

const ANIME_BY_GENRE_QUERY = `
  query ($genre: String, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(type: ANIME, genre: $genre, sort: POPULARITY_DESC, isAdult: false) {
        id
        title {
          romaji
          english
        }
        description
        coverImage {
          large
        }
        averageScore
        genres
        episodes
        status
        seasonYear
      }
    }
  }
`;

const ANIME_BY_SEASON_QUERY = `
  query ($season: MediaSeason, $year: Int, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(type: ANIME, season: $season, seasonYear: $year, sort: POPULARITY_DESC, isAdult: false) {
        id
        title {
          romaji
          english
        }
        description
        coverImage {
          large
        }
        averageScore
        genres
        episodes
        status
        seasonYear
      }
    }
  }
`;

// Helper function to make GraphQL requests
async function anilistFetch(query: string, variables: any = {}) {
  const response = await fetch(ANILIST_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({
      query,
      variables,
    }),
    next: { revalidate: 3600 }, // Cache for 1 hour
  });

  if (!response.ok) {
    throw new Error(`AniList API error: ${response.status}`);
  }

  const data = await response.json();
  if (data.errors) {
    throw new Error(data.errors[0].message);
  }

  return data.data;
}

// Transform AniList media to TMDb-like format
function transformAnime(media: any): Anime {
  const title = media.title?.english || media.title?.romaji || media.title?.native || "Unknown";
  
  return {
    id: media.id,
    title: title,
    original_title: media.title?.romaji || media.title?.native,
    overview: media.description?.replace(/<[^>]*>/g, "") || "No description available.",
    poster_path: media.coverImage?.large || media.coverImage?.extraLarge || "",
    backdrop_path: media.bannerImage || media.coverImage?.extraLarge || "",
    vote_average: media.averageScore ? media.averageScore / 10 : 0,
    vote_count: media.popularity || 0,
    release_date: media.startDate?.year 
      ? `${media.startDate.year}-${String(media.startDate.month || 1).padStart(2, "0")}-${String(media.startDate.day || 1).padStart(2, "0")}`
      : `${media.seasonYear || "Unknown"}`,
    genres: media.genres || [],
    episodes: media.episodes,
    duration: media.duration,
    status: media.status,
    season: media.season,
    studios: media.studios?.nodes?.map((s: any) => s.name) || [],
    trailer: media.trailer?.id ? `https://www.youtube.com/watch?v=${media.trailer.id}` : undefined,
    media_type: "anime",
  };
}

// API Functions
export async function fetchTrendingAnime(page: number = 1, perPage: number = 20): Promise<Anime[]> {
  const data = await anilistFetch(TRENDING_ANIME_QUERY, { page, perPage });
  return data.Page?.media?.map(transformAnime) || [];
}

export async function fetchPopularAnime(page: number = 1, perPage: number = 20): Promise<Anime[]> {
  const data = await anilistFetch(POPULAR_ANIME_QUERY, { page, perPage });
  return data.Page?.media?.map(transformAnime) || [];
}

export async function fetchTopRatedAnime(page: number = 1, perPage: number = 20): Promise<Anime[]> {
  const data = await anilistFetch(TOP_RATED_ANIME_QUERY, { page, perPage });
  return data.Page?.media?.map(transformAnime) || [];
}

export async function fetchSeasonalAnime(season: string, year: number, page: number = 1, perPage: number = 20): Promise<Anime[]> {
  const data = await anilistFetch(SEASONAL_ANIME_QUERY, { season, year, page, perPage });
  return data.Page?.media?.map(transformAnime) || [];
}

export async function fetchUpcomingAnime(page: number = 1, perPage: number = 20): Promise<Anime[]> {
  const data = await anilistFetch(UPCOMING_ANIME_QUERY, { page, perPage });
  return data.Page?.media?.map(transformAnime) || [];
}

export async function fetchRecentlyAddedAnime(page: number = 1, perPage: number = 20): Promise<Anime[]> {
  const data = await anilistFetch(RECENTLY_ADDED_ANIME_QUERY, { page, perPage });
  return data.Page?.media?.map(transformAnime) || [];
}

export async function fetchAnimeDetails(id: string): Promise<Anime | null> {
  const data = await anilistFetch(ANIME_DETAILS_QUERY, { id: parseInt(id) });
  if (!data.Media) return null;
  return transformAnime(data.Media);
}

export async function fetchAnimeCharacters(id: string): Promise<AnimeCharacter[]> {
  const data = await anilistFetch(ANIME_DETAILS_QUERY, { id: parseInt(id) });
  return data.Media?.characters?.nodes?.map((char: any) => ({
    id: char.id,
    name: char.name?.full || "Unknown",
    role: "Character",
    image: char.image?.large || "",
  })) || [];
}

export async function fetchAnimeRecommendations(id: string): Promise<Anime[]> {
  const data = await anilistFetch(ANIME_DETAILS_QUERY, { id: parseInt(id) });
  return data.Media?.recommendations?.nodes?.map((rec: any) => transformAnime(rec.mediaRecommendation)).filter(Boolean) || [];
}

export async function fetchRelatedAnime(id: string): Promise<Anime[]> {
  const data = await anilistFetch(ANIME_DETAILS_QUERY, { id: parseInt(id) });
  return data.Media?.relations?.nodes?.map(transformAnime).filter(Boolean) || [];
}

export async function searchAnime(query: string, page: number = 1, perPage: number = 20): Promise<Anime[]> {
  const data = await anilistFetch(SEARCH_ANIME_QUERY, { search: query, page, perPage });
  return data.Page?.media?.map(transformAnime) || [];
}

export async function fetchAnimeByGenre(genre: string, page: number = 1, perPage: number = 20): Promise<Anime[]> {
  const data = await anilistFetch(ANIME_BY_GENRE_QUERY, { genre, page, perPage });
  return data.Page?.media?.map(transformAnime) || [];
}

export async function fetchAnimeBySeason(season: string, year: number, page: number = 1, perPage: number = 20): Promise<Anime[]> {
  const data = await anilistFetch(ANIME_BY_SEASON_QUERY, { season, year, page, perPage });
  return data.Page?.media?.map(transformAnime) || [];
}

// Get current season based on date
export function getCurrentSeason(): string {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return "SPRING";
  if (month >= 5 && month <= 7) return "SUMMER";
  if (month >= 8 && month <= 10) return "FALL";
  return "WINTER";
}

// Fetch all sections at once for homepage
export async function fetchAllAnimeSections(): Promise<{
  trending: Anime[];
  popular: Anime[];
  topRated: Anime[];
  seasonal: Anime[];
  upcoming: Anime[];
  recentlyAdded: Anime[];
}> {
  const currentSeason = getCurrentSeason();
  const currentYear = new Date().getFullYear();

  const [trending, popular, topRated, seasonal, upcoming, recentlyAdded] = await Promise.all([
    fetchTrendingAnime(1, 20),
    fetchPopularAnime(1, 20),
    fetchTopRatedAnime(1, 20),
    fetchSeasonalAnime(currentSeason, currentYear, 1, 20),
    fetchUpcomingAnime(1, 20),
    fetchRecentlyAddedAnime(1, 20),
  ]);

  return {
    trending,
    popular,
    topRated,
    seasonal,
    upcoming,
    recentlyAdded,
  };
}

// Slugify for anime URLs
export function slugifyAnime(title: string, id: number): string {
  return `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${id}`;
}