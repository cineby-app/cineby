// app/sitemap.ts
import { MetadataRoute } from 'next';
import { fetchTrendingMovies, getGenres } from '@/lib/tmdb';
import { articles } from '@/lib/articles';

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://cineby.vip';
  
  // Static routes
  const staticRoutes = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/library`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/match`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ] as MetadataRoute.Sitemap;

  // Blog routes
  const blogRoutes = articles.map((article) => ({
    url: `${baseUrl}/blog/${article.slug}`,
    lastModified: new Date(article.date),
    changeFrequency: 'weekly',
    priority: 0.8,
  })) as MetadataRoute.Sitemap;

  // Genre routes
  let genreRoutes: MetadataRoute.Sitemap = [];
  try {
    const genres = await getGenres();
    genreRoutes = genres.map((genre) => ({
      url: `${baseUrl}/genre/${slugify(genre.name)}-${genre.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    })) as MetadataRoute.Sitemap;
  } catch (err) {
    console.error('Failed to fetch genres for sitemap:', err);
  }

  // Movie routes (from trending movies - you can expand this)
  let movieRoutes: MetadataRoute.Sitemap = [];
  try {
    const trending = await fetchTrendingMovies();
    movieRoutes = trending.map((movie) => ({
      url: `${baseUrl}/${slugify(movie.title)}-${movie.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    })) as MetadataRoute.Sitemap;
  } catch (err) {
    console.error('Failed to fetch trending movies for sitemap:', err);
  }

  // Keyword routes (popular keywords - you can expand this list)
  const popularKeywords = [
    { name: 'Action', id: 1 },
    { name: 'Comedy', id: 2 },
    { name: 'Drama', id: 3 },
    { name: 'Horror', id: 4 },
    { name: 'Sci-Fi', id: 5 },
    { name: 'Romance', id: 6 },
    { name: 'Thriller', id: 7 },
    { name: 'Animation', id: 8 },
    { name: 'Adventure', id: 9 },
    { name: 'Fantasy', id: 10 },
    { name: 'Mystery', id: 11 },
    { name: 'Crime', id: 12 },
    { name: 'Documentary', id: 13 },
    { name: 'Family', id: 14 },
    { name: 'History', id: 15 },
    { name: 'Music', id: 16 },
    { name: 'War', id: 17 },
    { name: 'Western', id: 18 },
  ];
  
  const keywordRoutes = popularKeywords.map((keyword) => ({
    url: `${baseUrl}/keyword/${slugify(keyword.name)}-${keyword.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  })) as MetadataRoute.Sitemap;

  return [...staticRoutes, ...blogRoutes, ...genreRoutes, ...movieRoutes, ...keywordRoutes];
}