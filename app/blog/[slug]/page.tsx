import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { articles, Article } from '@/lib/articles';
import { movieLists } from '@/lib/lists';
import { 
  getGenres, 
  fetchMoviesByGenre, 
  fetchMovieSimilar, 
  fetchMovieRecommendations, 
  fetchMovieDetails,
  searchMovieByTitle, 
  fetchTrendingMovies,
  Movie 
} from '@/lib/tmdb';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, Calendar, ArrowLeft, User, Film, ArrowRight, Star } from 'lucide-react';
import { CopyLinkButton } from '@/components/CopyLinkButton';
import { AdsterraAd } from '@/components/AdsterraAd';
import ArticleContent from '@/components/ArticleContent';

const AD_KEY_300x250 = '8162f7b8c34974f34a974b6e7ecfc56c';
const BASE_URL = 'https://cineby.vip';

interface Props {
  params: Promise<{ slug: string }>;
}

// ============================================
// Smart Related Movies Fetcher
// ============================================

async function getSmartRelatedMovies(article: Article): Promise<Movie[]> {
  const relatedId = article.related;
  const resultsMap = new Map<number, Movie & { popularity: number }>();

  const addMovie = (movie: Movie) => {
    if (!movie.poster_path) return;
    const pop = (movie.vote_count || 0) * (movie.vote_average || 0);
    const existing = resultsMap.get(movie.id);
    if (existing) {
      existing.popularity = Math.max(existing.popularity, pop);
    } else {
      resultsMap.set(movie.id, { ...movie, popularity: pop });
    }
  };

  if (relatedId) {
    try {
      const mainMovie = await fetchMovieDetails(String(relatedId));
      if (mainMovie) {
        addMovie(mainMovie);

        const similar = await fetchMovieSimilar(String(relatedId));
        similar.forEach(m => addMovie(m));

        const recs = await fetchMovieRecommendations(String(relatedId));
        recs.forEach(m => addMovie(m));

        if (mainMovie.genre_ids && mainMovie.genre_ids.length > 0) {
          for (const genreId of mainMovie.genre_ids.slice(0, 3)) {
            try {
              const genreMovies = await fetchMoviesByGenre(String(genreId), 'popularity.desc', 1);
              genreMovies.forEach(m => addMovie(m));
            } catch (e) { /* silent */ }
          }
        }
      }
    } catch (e) {
      console.error(`Error fetching related movies for ID ${relatedId}:`, e);
    }
  }

  if (resultsMap.size < 5) {
    for (const keyword of article.keywords.slice(0, 5)) {
      if (resultsMap.size >= 10) break;
      try {
        const keywordMovie = await searchMovieByTitle(keyword);
        if (keywordMovie && keywordMovie.id !== relatedId) {
          addMovie(keywordMovie);
        }
      } catch (e) { /* silent */ }
    }
  }

  if (resultsMap.size < 5) {
    const titleWords = article.title.split(/\s+/).filter(w => w.length > 3);
    for (const word of titleWords.slice(0, 3)) {
      if (resultsMap.size >= 10) break;
      try {
        const found = await searchMovieByTitle(word);
        if (found && found.id !== relatedId) {
          addMovie(found);
        }
      } catch (e) { /* silent */ }
    }
  }

  if (resultsMap.size < 3) {
    try {
      const trending = await fetchTrendingMovies();
      trending.slice(0, 10).forEach(m => addMovie(m));
    } catch (e) { /* silent */ }
  }

  const sorted = Array.from(resultsMap.values())
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 12)
    .map(({ popularity, ...movie }) => movie);

  return sorted;
}

// ============================================
// COMPLETE INDEPENDENT METADATA - FIXED
// ============================================

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await params;
  const article = articles.find((a) => a.slug === p.slug);

  if (!article) {
    return {
      title: 'Article Not Found | Cineby',
      description: 'The requested article could not be found.',
      robots: {
        index: true,   // ✅ ARTICLES SHOULD BE INDEXED
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },    
    };
  }

  const baseUrl = 'https://cineby.vip';
  const imageUrl = article.coverImage.startsWith('http') 
    ? article.coverImage 
    : `${baseUrl}${article.coverImage}`;

  // Use SEO title/description or fallback to regular
  const seoTitle = article.seoTitle || article.title;
  const seoDescription = article.seoDescription || article.excerpt;

  // ✅ FIXED: Use just the SEO title (layout template adds "| Cineby")
  // This prevents duplicate "Cineby | Cineby"
  const metaTitle = seoTitle;

  return {
    title: metaTitle,  // ✅ Just the SEO title - layout adds "| Cineby"
    description: seoDescription,
    keywords: article.keywords.join(', '),
    authors: [{ name: article.author }],
    creator: article.author,
    publisher: 'Cineby',
    category: 'entertainment',
    robots: {
      index: true,  // ✅ ARTICLES SHOULD BE INDEXED (not legal pages)
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: `${seoTitle} | Cineby`,  // ✅ Full title for OG (social sharing)
      description: seoDescription,
      url: `${baseUrl}/blog/${article.slug}`,
      siteName: 'Cineby',
      locale: 'en_US',
      type: 'article',
      publishedTime: article.date,
      modifiedTime: article.date,
      authors: [article.author],
      tags: article.keywords,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: seoTitle,
          type: 'image/webp',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${seoTitle} | Cineby`,  // ✅ Full title for Twitter
      description: seoDescription,
      images: [imageUrl],
      creator: '@cineby',
      site: '@cineby',
    },
    alternates: {
      canonical: `${baseUrl}/blog/${article.slug}`,
      languages: {
      'en-US': `${baseUrl}/blog/${article.slug}`, // Tells Google to prioritize this for US searchers
      'x-default': `${baseUrl}/blog/${article.slug}`, // Fallback for everyone else
  },
    },
    applicationName: 'Cineby',
    referrer: 'origin-when-cross-origin',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
  };
}

// ============================================
// Page Component
// ============================================

export default async function BlogPostPage({ params }: Props) {
  const p = await params;
  const article = articles.find((a) => a.slug === p.slug);

  if (!article) {
    notFound();
  }

  // 1. Related Articles (by shared keywords)
  const relatedArticles = articles.filter(a => 
    a.id !== article.id && 
    a.keywords.some(k => article.keywords.some(ak => ak.toLowerCase() === k.toLowerCase()))
  ).slice(0, 4);

  // 2. Related Lists (by shared keywords)
  const relatedLists = movieLists.filter(list => 
    list.keywords?.some(keyword => 
      article.keywords.some(articleKeyword => 
        articleKeyword.toLowerCase().includes(keyword.toLowerCase()) ||
        keyword.toLowerCase().includes(articleKeyword.toLowerCase())
      )
    )
  ).slice(0, 6);

  // 3. Related Movies (smart fetcher)
  const relatedMovies = article.showRelatedMovies !== false
    ? await getSmartRelatedMovies(article)
    : [];

  const pageUrl = `${BASE_URL}/blog/${article.slug}`;
  const imageUrl = article.coverImage?.startsWith('http') ? article.coverImage : `${BASE_URL}${article.coverImage || ''}`;

  const seoTitle = article.seoTitle || article.title;
  const seoDescription = article.seoDescription || article.excerpt;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': pageUrl,
    'url': pageUrl,
    'headline': `${seoTitle} | Cineby`,
    'description': seoDescription,
    'keywords': article.keywords?.join(', ') || '',
    'author': {
      '@type': 'Person',
      'name': article.author,
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'Cineby',
      'logo': {
        '@type': 'ImageObject',
        'url': `${BASE_URL}/img/logo.png`,
      },
    },
    'image': {
      '@type': 'ImageObject',
      'url': imageUrl,
      'width': 1200,
      'height': 630,
    },
    'datePublished': article.date,
    'dateModified': article.date,
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': BASE_URL,
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Blog',
        'item': `${BASE_URL}/blog`,
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': seoTitle,
        'item': pageUrl,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#05050A]">

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="relative w-full min-h-[60vh] md:min-h-[70vh] flex flex-col justify-end pb-16 pt-32 mb-8 md:mb-12 border-b border-[#1F2937] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={article.coverImage}
            alt={seoTitle}
            fill
            className="object-cover object-center scale-105"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#05050A] via-[#05050A]/60 to-[#05050A]/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-l from-black/40 via-transparent to-transparent" />
        </div>

        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-[#E50914]/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-40 h-40 sm:w-56 sm:h-56 md:w-80 md:h-80 bg-[#E50914]/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 w-full">
          <Link 
            href="/blog"
            className="inline-flex items-center text-xs font-mono uppercase tracking-widest text-gray-300 hover:text-white transition-colors mb-6 md:mb-8 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Blog
          </Link>

          <header>
            <div className="flex flex-wrap gap-2 mb-4 md:mb-6">
              {article.keywords.slice(0, 4).map(keyword => (
                <span key={keyword} className="bg-[#E50914] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded shadow-md">
                  {keyword}
                </span>
              ))}
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter uppercase mb-4 md:mb-6 text-white leading-tight drop-shadow-lg bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
              {article.title}
            </h1>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:gap-6 pt-4 md:pt-6 border-t border-white/10">
              <div className="flex flex-wrap items-center gap-4 md:gap-6 text-xs sm:text-sm font-mono text-gray-300 uppercase tracking-widest bg-black/40 px-4 py-2 rounded-lg backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#E50914]" />
                  <span className="font-bold text-white">{article.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{article.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{article.readTime}</span>
                </div>
              </div>
              <CopyLinkButton />
            </div>
          </header>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <style dangerouslySetInnerHTML={{
          __html: `
            .article-content ul { list-style-type: disc !important; padding-left: 1.5rem !important; margin: 1rem 0 !important; }
            .article-content li { color: #d1d5db !important; margin-bottom: 0.5rem !important; list-style-type: disc !important; }
            .article-content li::marker { color: #E50914 !important; }
            .article-content ol { list-style-type: decimal !important; padding-left: 1.5rem !important; margin: 1rem 0 !important; }
            .article-content ol li::marker { color: #E50914 !important; }
          `
        }} />

        <div className="text-gray-300 prose prose-invert prose-sm sm:prose-base lg:prose-lg max-w-none [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-4 [&_li]:text-gray-300 [&_li]:mb-2 [&_li::marker]:text-[#E50914] [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-4 [&_ol_li::marker]:text-[#E50914]">
          <ArticleContent content={article.content} />
        </div>

        {/* 1. RELATED ARTICLES */}
        {relatedArticles.length > 0 && (
          <div className="mt-16 pt-8 border-t border-[#1F2937]">
            <div className="flex items-center gap-2 pb-4 border-b border-[#1F2937] mb-6">
              <div className="w-1 h-6 bg-[#E50914] rounded-full" />
              <h3 className="text-sm font-bold tracking-widest text-gray-400 uppercase">Related Articles</h3>
              <span className="text-[10px] text-gray-500">{relatedArticles.length} articles</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {relatedArticles.map((relArticle) => (
                <Link 
                  key={relArticle.id} 
                  href={`/blog/${relArticle.slug}`}
                  className="group flex flex-col bg-[#0F0F1A] border border-[#1F2937] rounded-xl overflow-hidden hover:border-[#E50914]/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={relArticle.coverImage}
                      alt={relArticle.seoTitle || relArticle.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F1A] to-transparent opacity-80" />
                  </div>

                  <div className="p-3 md:p-4 flex flex-col flex-1">
                    <h4 className="text-xs sm:text-sm font-bold text-white mb-2 tracking-tight line-clamp-2 group-hover:text-[#E50914] transition-colors">
                      {relArticle.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[8px] sm:text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-auto">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {relArticle.date}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 2. RELATED LISTS */}
        {relatedLists.length > 0 && (
          <div className="mt-16 pt-8 border-t border-[#1F2937]">
            <div className="flex items-center gap-2 pb-4 border-b border-[#1F2937] mb-6">
              <div className="w-1 h-6 bg-[#E50914] rounded-full" />
              <h3 className="text-sm font-bold tracking-widest text-gray-400 uppercase">Related Lists</h3>
              <span className="text-[10px] text-gray-500">{relatedLists.length} collections</span>
            </div>

            <div className="space-y-3">
              {relatedLists.map((list) => (
                <Link
                  key={list.id}
                  href={`/list/${list.slug}`}
                  className="group flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-[#0F0F1A] rounded-xl border border-[#1F2937] hover:border-[#E50914]/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                >
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden flex-shrink-0 bg-[#1F2937]">
                    <Image
                      src={list.coverImage}
                      alt={list.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm md:text-base font-bold text-white group-hover:text-[#E50914] transition-colors line-clamp-2">
                      {list.title}
                    </h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-gray-400">
                        {list.movies?.filter((m: any) => m.type === 'movie' || !m.type).length || 0} Films
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {list.movies?.filter((m: any) => m.type === 'tv').length || 0} TV Shows
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-[#E50914] group-hover:translate-x-1 transition-all flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        )}

      {/* 3. RELATED MOVIES */}
      {relatedMovies.length > 0 && (
        <div className="mt-16 pt-8 border-t border-[#1F2937]">
          <div className="flex items-center gap-2 pb-4 border-b border-[#1F2937] mb-6">
            <div className="w-1 h-6 bg-[#E50914] rounded-full" />
            <h3 className="text-sm font-bold tracking-widest text-gray-400 uppercase">Related Movies</h3>
            <span className="text-[10px] text-gray-500">{relatedMovies.length} movies</span>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 md:gap-4">
            {relatedMovies.slice(0, 5).map((movie, index) => {
              const hideOnMobile = index > 2;
              return (
                <Link 
                  key={movie.id} 
                  href={`/${movie.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${movie.id}`} 
                  className={`group flex flex-col ${hideOnMobile ? 'hidden sm:flex' : 'flex'}`}
                >
                  <div className="w-full aspect-[2/3] relative overflow-hidden rounded-xl border border-[#1F2937] group-hover:border-[#E50914] transition-colors mb-2 bg-[#0F0F1A]">
                    {movie.poster_path ? (
                      <Image 
                        src={`https://image.tmdb.org/t/p/w185${movie.poster_path}`} 
                        alt={movie.title} 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <Film className="w-8 h-8" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2">
                      <div className="flex items-center gap-1 text-yellow-400 text-xs">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{movie.vote_average?.toFixed(1) || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-bold tracking-tight text-xs sm:text-sm mb-0.5 truncate group-hover:text-[#E50914] transition-colors">
                      {movie.title}
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono">
                      {movie.release_date?.split('-')[0] || 'N/A'}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

        <div className="mt-16 py-12 border-t border-[#1F2937] text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-xs sm:text-sm font-mono uppercase tracking-wider hover:gap-3 transition-all"
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
            Browse All Articles
          </Link>
        </div>
      </div>
    </div>
  );
}