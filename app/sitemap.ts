// app/sitemap.ts
import { MetadataRoute } from 'next';
import { 
  fetchTrendingMovies, 
  fetchTrendingTV, 
  fetchInfiniteMovies, 
  fetchInfiniteTV, 
  fetchPopularTV, 
  fetchTopRatedTV, 
  getGenres 
} from '@/lib/tmdb';
import { articles } from '@/lib/articles';
import { movieLists } from '@/lib/lists';

// دالة لتنظيف تصنيفات الأنواع والكلمات المفتاحية والأسماء
function generalSlugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

// ✅ Complete list of keywords (without IDs)
const ALL_KEYWORDS = [
  // Original keywords
  'sequel',
  'based on novel or book',
  'friendship',
  'superhero',
  'space',
  'martial arts',
  'new york city',
  'murder',
  'sibling relationship',
  'rivalry',
  'investigation',
  'magic',
  'gore',
  'ninja',
  'alien',
  'space travel',
  'romance',
  'witch',
  'sports',
  'politics',
  '1970s',
  'ambition',
  '1980s',
  'hero',
  'female protagonist',
  'shark',
  'home invasion',
  'kidnapping',
  'infidelity',
  'astronaut',
  'scientist',
  'bullying',
  'espionage',
  'spy',
  
  // New keywords
  'space war',
  'space mission',
  'space battle',
  'superhero team',
  'magic show',
  'black magic',
  'evil alien',
  'alien attack',
  'alien friendship',
  'male friendship',
  'erotic',
  'erotic movie',
  'sex',
  'epic battle',
  'obsession',
  'cautionary',
  'complicated',
  'madness',
  'dance',
  'paranoia',
  'nightmare',
  'hallucination',
  'fear',
  'theater',
  'psychological horror',
  'businessman',
  'dark comedy',
  'psychological thriller',
  'family',
  'critical',
  'introspective',
  'provocative',
  'apocalypse',
  'zombie',
  'addiction',
  'horror anthology',
  'anthology',
  'black and white',
  'buddy cop',
  'bank robber',
  'bank robbery',
  'time loop',
  'courtroom',
  'courtroom drama',
  'heist',
  'bank heist',
  'time travel',
  'admiring',
  'complex',
  'winter',
  'twist',
  'shocking',
  'antagonistic',
  'teenage romance',
  'summer romance',
  'survival',
  'survival horror',
  'serial killer',
  'psycho',
  'motivational',
  'revenge',
  'revenge murderer',
  'philosophical',
  'based on true story',
  'based on novel',
  'coming of age',
  'dystopian',
  'post-apocalyptic',
  'underdog',
  'strong female lead',
  'anti-hero',
  'vigilante',
  'conspiracy',
  'government conspiracy',
  'artificial intelligence',
  'parallel universe',
  'alternate reality',
  'supernatural',
  'ghost',
  'haunted house',
  'possession',
  'exorcism'
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://cineby.vip';
  
  // المصفوفة النهائية التي سنجمع فيها كل الروابط النظيفة بدون أي تكرار
  const finalRoutes: MetadataRoute.Sitemap = [];
  
  // صناديق ذكية (Sets) لحفظ الـ IDs لمنع تكرار نفس المعرف
  const addedMovieIds = new Set<number>();
  const addedTVIds = new Set<number>();

  // صناديق ذكية جديدة لحفظ الـ Slugs الفريدة؛ لمنع تكرار نفس العنوان بـ IDs مختلفة لجوجل
  const addedMovieSlugs = new Set<string>();
  const addedTVSlugs = new Set<string>();

  // ==========================================
  // 1. Static routes (الروابط الثابتة)
  // ==========================================
  const staticRoutes = [
    { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/library`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/match`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/list`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
  ] as MetadataRoute.Sitemap;
  finalRoutes.push(...staticRoutes);

  // ==========================================
  // 2. Blog routes (المقالات)
  // ==========================================
  const blogRoutes = articles.map((article) => ({
    url: `${baseUrl}/blog/${article.slug}`,
    lastModified: new Date(article.date),
    changeFrequency: 'weekly',
    priority: 0.8,
  })) as MetadataRoute.Sitemap;
  finalRoutes.push(...blogRoutes);

  // ==========================================
  // 3. List routes (قوائم الأفلام والمسلسلات)
  // ==========================================
  try {
    const listRoutes = movieLists.map((list) => ({
      url: `${baseUrl}/list/${list.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    })) as MetadataRoute.Sitemap;
    finalRoutes.push(...listRoutes);
  } catch (err) {
    console.error('Failed to fetch lists for sitemap:', err);
  }

  // ==========================================
  // 4. Genre routes (التصنيفات) - ✅ Clean URLs without ID
  // ==========================================
  try {
    const genres = await getGenres();
    const genreRoutes = genres.map((genre) => ({
      url: `${baseUrl}/genre/${generalSlugify(genre.name)}`,  // ✅ No ID
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    })) as MetadataRoute.Sitemap;
    finalRoutes.push(...genreRoutes);
  } catch (err) {
    console.error('Failed to fetch genres for sitemap:', err);
  }

  // ==========================================
  // 5. Movie routes (الأفلام: التريند + الشعبية + القادمة والأعلى تقييماً)
  // ==========================================
  try {
    const [trending, infinite] = await Promise.all([
      fetchTrendingMovies().catch(() => []),
      fetchInfiniteMovies().catch(() => [])
    ]);

    const allMovies = [...trending, ...infinite];

    allMovies.forEach((movie) => {
      if (movie && movie.id) {
        const safeTitle = (movie.title || movie.original_title || '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');

        if (!addedMovieIds.has(movie.id) && safeTitle && !addedMovieSlugs.has(safeTitle)) {
          addedMovieIds.add(movie.id);
          addedMovieSlugs.add(safeTitle);

          finalRoutes.push({
            url: `${baseUrl}/${safeTitle}-${movie.id}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
          });
        }
      }
    });
  } catch (err) {
    console.error('Failed to fetch movies for sitemap:', err);
  }

  // ==========================================
  // 6. TV Show routes (المسلسلات: التريند + الشعبية + الأعلى تقييماً)
  // ==========================================
  try {
    const [trendingTV, infiniteTV, popularTV, topRatedTV] = await Promise.all([
      fetchTrendingTV().catch(() => []),
      fetchInfiniteTV().catch(() => []),
      fetchPopularTV().catch(() => []),
      fetchTopRatedTV().catch(() => [])
    ]);

    const allTVShows = [...trendingTV, ...infiniteTV, ...popularTV, ...topRatedTV];

    allTVShows.forEach((tv) => {
      if (tv && tv.id) {
        const safeName = (tv.title || tv.original_title || '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');

        if (!addedTVIds.has(tv.id) && safeName && !addedTVSlugs.has(safeName)) {
          addedTVIds.add(tv.id);
          addedTVSlugs.add(safeName);

          finalRoutes.push({
            url: `${baseUrl}/tv/${safeName}-${tv.id}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
          });
        }
      }
    });
  } catch (err) {
    console.error('Failed to fetch tv shows for sitemap:', err);
  }

  // ==========================================
  // 7. Keyword routes (الكلمات المفتاحية) - ✅ Clean URLs without ID
  // ==========================================
  const keywordRoutes = ALL_KEYWORDS.map((keyword) => ({
    url: `${baseUrl}/keyword/${generalSlugify(keyword)}`,  // ✅ No ID
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  })) as MetadataRoute.Sitemap;
  finalRoutes.push(...keywordRoutes);

  return finalRoutes;
}