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

// دالة لتنظيف تصنيفات الأنواع والكلمات المفتاحية والأسماء
function generalSlugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

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
  // 3. Genre routes (التصنيفات)
  // ==========================================
  try {
    const genres = await getGenres();
    const genreRoutes = genres.map((genre) => ({
      url: `${baseUrl}/genre/${generalSlugify(genre.name)}-${genre.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    })) as MetadataRoute.Sitemap;
    finalRoutes.push(...genreRoutes);
  } catch (err) {
    console.error('Failed to fetch genres for sitemap:', err);
  }

  // ==========================================
  // 4. Movie routes (الأفلام: التريند + الشعبية + القادمة والأعلى تقييماً)
  // ==========================================
  try {
    const [trending, infinite] = await Promise.all([
      fetchTrendingMovies().catch(() => []),
      fetchInfiniteMovies().catch(() => [])
    ]);

    const allMovies = [...trending, ...infinite];

    allMovies.forEach((movie) => {
      if (movie && movie.id) {
        // توليد اسم ملطف نقي من الحقول المدعومة في واجهة Movie بملفك tmdb.ts
        const safeTitle = (movie.title || movie.original_title || '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');

        // حماية ثنائية: تمنع تكرار الـ ID وتمنع تكرار الـ Name Slug نهائياً
        if (!addedMovieIds.has(movie.id) && safeTitle && !addedMovieSlugs.has(safeTitle)) {
          addedMovieIds.add(movie.id);
          addedMovieSlugs.add(safeTitle); // تسجيل الاسم لمنع تكراره بـ ID آخر

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
  // 5. TV Show routes (المسلسلات: التريند + الشعبية + الأعلى تقييماً)
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
        // توليد اسم ملطف نقي للمسلسل (باستخدام الحقول المتطابقة مع النوع Movie لضمان سلامة الـ Typescript والـ Build)
        const safeName = (tv.title || tv.original_title || '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');

        // حماية ثنائية للمسلسلات: تمنع تكرار الـ ID وتمنع تكرار الـ Name Slug نهائياً (حل مشكلتك بدقة)
        if (!addedTVIds.has(tv.id) && safeName && !addedTVSlugs.has(safeName)) {
          addedTVIds.add(tv.id);
          addedTVSlugs.add(safeName); // تسجيل اسم المسلسل لمنع تكراره بمعرف آخر في بقية النتائج

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
  // 6. Keyword routes (الكلمات المفتاحية)
  // ==========================================
  const popularKeywords = [
    { name: 'Action', id: 1 }, { name: 'Comedy', id: 2 }, { name: 'Drama', id: 3 },
    { name: 'Horror', id: 4 }, { name: 'Sci-Fi', id: 5 }, { name: 'Romance', id: 6 },
    { name: 'Thriller', id: 7 }, { name: 'Animation', id: 8 }, { name: 'Adventure', id: 9 },
    { name: 'Fantasy', id: 10 }, { name: 'Mystery', id: 11 }, { name: 'Crime', id: 12 },
    { name: 'Documentary', id: 13 }, { name: 'Family', id: 14 }, { name: 'History', id: 15 },
    { name: 'Music', id: 16 }, { name: 'War', id: 17 }, { name: 'Western', id: 18 },
  ];
  
  const keywordRoutes = popularKeywords.map((keyword) => ({
    url: `${baseUrl}/keyword/${generalSlugify(keyword.name)}-${keyword.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  })) as MetadataRoute.Sitemap;
  finalRoutes.push(...keywordRoutes);

  return finalRoutes;
}