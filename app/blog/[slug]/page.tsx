import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { articles } from '@/lib/articles';
import { fetchTrendingMovies, fetchTrendingTV } from '@/lib/tmdb';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, Calendar, ArrowLeft, User } from 'lucide-react';
import { CopyLinkButton } from '@/components/CopyLinkButton';
import { getMoviesByKeywordsAction } from '@/app/actions';

interface Props {
  params: Promise<{ slug: string }>;
}

// Generate dynamic metadata for each article
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await params;
  const article = articles.find((a) => a.slug === p.slug);
  
  if (!article) {
    return {
      title: 'Article Not Found',
      description: 'The requested article could not be found.',
      robots: { index: false, follow: false },
    };
  }

  const baseUrl = 'https://cineby.vip';
  const imageUrl = article.coverImage.startsWith('http') 
    ? article.coverImage 
    : `${baseUrl}${article.coverImage}`;

  return {
    title: `${article.title}`,
    description: article.excerpt,
    keywords: article.keywords.join(', '),
    authors: [{ name: article.author, url: `${baseUrl}/author/${article.author.toLowerCase().replace(/\s+/g, '-')}` }],
    creator: article.author,
    publisher: 'Cineby',
    category: 'entertainment',
    robots: {
      index: true,
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
      title: `${article.title} | Cineby Blog`,
      description: article.excerpt,
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
          alt: article.title,
          type: 'image/jpeg',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${article.title} | Cineby Blog`,
      description: article.excerpt,
      images: [imageUrl],
      creator: '@cineby',
      site: '@cineby',
    },
    alternates: {
      canonical: `${baseUrl}/blog/${article.slug}`,
    },
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    applicationName: 'Cineby',
    icons: {
      icon: '/img/favicons/favicon-32x32.png',
      apple: '/img/favicons/apple-touch-icon-180x180.png',
    },
    manifest: '/img/favicons/site.webmanifest',
  };
}

export default async function BlogPostPage({ params }: Props) {
  const p = await params;
  const article = articles.find((a) => a.slug === p.slug);

  if (!article) {
    notFound();
  }

  let content = article.content;

  // Generate dynamic content for Cineby article using TMDB API
  if (article.slug === "cineby") {
    const [trendingMovies, trendingTV] = await Promise.all([
      fetchTrendingMovies(),
      fetchTrendingTV()
    ]);

    const topMovies = trendingMovies.slice(0, 8);
    const topTV = trendingTV.slice(0, 8);

    // Generate trending movies HTML with redirect to /movie-name-id
    let moviesHTML = `<div class="grid grid-cols-2 md:grid-cols-4 gap-5 my-8">`;
    for (const movie of topMovies) {
      const posterUrl = movie.poster_path 
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : '/img/placeholder.jpg';
      const year = movie.release_date ? new Date(movie.release_date).getFullYear() : '2026';
      const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
      const slug = `${movie.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${movie.id}`;
      
      moviesHTML += `
        <a href="/${slug}" class="group cursor-pointer">
          <div class="relative rounded-xl overflow-hidden aspect-[2/3] bg-gray-900">
            <img src="${posterUrl}" alt="${movie.title.replace(/'/g, "\\'")}" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
            <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3">
              <div class="flex items-center gap-1 text-yellow-400 text-xs">
                <svg class="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
                <span>${rating}</span>
              </div>
            </div>
          </div>
          <h4 class="text-white font-medium mt-2 text-sm group-hover:text-red-500 transition-colors line-clamp-1">${movie.title}</h4>
          <p class="text-gray-500 text-xs">${year}</p>
        </a>
      `;
    }
    moviesHTML += `</div>`;

    // Generate trending TV shows HTML with redirect to /tv/tvshow-name-id
    let tvHTML = `<div class="grid grid-cols-2 md:grid-cols-4 gap-5 my-8">`;
    for (const tv of topTV) {
      const posterUrl = tv.poster_path 
        ? `https://image.tmdb.org/t/p/w500${tv.poster_path}`
        : '/img/placeholder.jpg';
      const year = tv.release_date ? new Date(tv.release_date).getFullYear() : '2026';
      const rating = tv.vote_average ? tv.vote_average.toFixed(1) : 'N/A';
      const title = tv.title;
      const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${tv.id}`;
      
      tvHTML += `
        <a href="/tv/${slug}" class="group cursor-pointer">
          <div class="relative rounded-xl overflow-hidden aspect-[2/3] bg-gray-900">
            <img src="${posterUrl}" alt="${title.replace(/'/g, "\\'")}" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
            <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3">
              <div class="flex items-center gap-1 text-yellow-400 text-xs">
                <svg class="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
                <span>${rating}</span>
              </div>
            </div>
          </div>
          <h4 class="text-white font-medium mt-2 text-sm group-hover:text-red-500 transition-colors line-clamp-1">${title}</h4>
          <p class="text-gray-500 text-xs">${year}</p>
        </a>
      `;
    }
    tvHTML += `</div>`;

    // Full Cineby article content with dynamic sections
    content = `
    <div class="prose prose-invert prose-lg max-w-none">
      
      <div class="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wider mb-8 pb-4 border-b border-gray-800">
        <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span>Streaming Platform</span>
        <svg class="w-3 h-3 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
        </svg>
        <span>Cineby</span>
        <svg class="w-3 h-3 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
        </svg>
        <span>Watch Best Movies & Series</span>
      </div>


            <h2 class="text-3xl font-black text-white mt-12 mb-6 uppercase tracking-tight border-l-4 border-red-600 pl-4">Trending Movies on Cineby</h2>
      <p class="text-gray-400 mb-4 leading-relaxed">Here are the most-watched movies on <strong class="text-white">Cineby</strong> right now. Thousands of users are streaming these titles daily:</p>
      
      ${moviesHTML}

      <!-- BUTTON 4 -->
      <div class="text-center my-6">
        <a href="/" class="inline-flex items-center gap-2 bg-transparent border border-red-600 hover:bg-red-600/20 text-white font-bold py-2 px-5 rounded-lg transition duration-300 text-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.5-4.5M15 10l-4.5-4.5M15 10v8m-8-8H3m18 0h-4"></path>
          </svg>
          <span>Watch More Movies on Cineby →</span>
        </a>
      </div>

      <h2 class="text-3xl font-black text-white mt-12 mb-6 uppercase tracking-tight border-l-4 border-red-600 pl-4">Trending TV Series on Cineby</h2>
      <p class="text-gray-400 mb-4 leading-relaxed">Binge-worthy TV shows currently trending on <strong class="text-white">Cineby</strong>. All episodes available to stream instantly:</p>
      
      ${tvHTML}


      <!-- BUTTON 1 - Top Banner -->
      <div class="bg-gradient-to-r from-red-950/40 to-gray-800/50 p-6 rounded-xl my-6 border border-red-600/30">
        <div class="flex items-center justify-between flex-wrap gap-4">
          <div class="flex items-center gap-4">
            <div class="bg-red-600/20 p-3 rounded-full">
              <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
              </svg>
            </div>
            <div>
              <p class="text-white font-bold text-lg">Cineby Homepage</p>
              <p class="text-gray-400 text-sm">Thousands of movies and TV series available instantly</p>
            </div>
          </div>
          <a href="/" class="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
            <span>Visit Cineby Homepage</span>
          </a>
        </div>
      </div>

      <p class="text-xl text-gray-300 leading-relaxed mb-8">
        <strong class="text-white font-bold">Cineby</strong> is your ultimate destination to <strong class="text-white">watch the best movies and TV series</strong> online for free. 
        Whether you're searching for <strong class="text-white">Cineby SC</strong>, accidentally typed <strong class="text-white">cinaby</strong>, or looking for 
        <strong class="text-white">Cineby.app</strong> — this platform gives you instant access to thousands of titles. 
        No registration. No subscription. Just pure entertainment.
      </p>

      <p class="text-gray-400 mb-6 leading-relaxed">
        <strong class="text-white">Cineby</strong> has rapidly grown to become one of the most visited free streaming platforms in 2026, attracting millions of users worldwide who want to watch movies and TV shows without paying expensive subscription fees. Unlike paid services like Netflix, Hulu, or Disney Plus, <strong class="text-white">Cineby</strong> offers its entire content library completely free, with no hidden costs or surprise charges. This makes <strong class="text-white">Cineby</strong> an attractive option for budget-conscious viewers who still want access to high-quality entertainment.
      </p>

      <!-- BUTTON 2 - Inline -->
      <div class="my-6">
        <a href="/" class="inline-flex items-center gap-2 text-red-500 hover:text-red-400 font-medium border border-red-500/30 hover:border-red-500 px-4 py-2 rounded-lg transition-all">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
          </svg>
          <span>Start Streaming on Cineby →</span>
        </a>
      </div>

      <h2 class="text-3xl font-black text-white mt-12 mb-6 uppercase tracking-tight border-l-4 border-red-600 pl-4">What Is Cineby and How Does It Work?</h2>
      
      <p class="text-gray-400 mb-6 leading-relaxed">
        <strong class="text-white">Cineby</strong> (sometimes misspelled as <strong class="text-white">cinaby</strong>) is a free streaming website that allows you to watch movies and TV series without paying any subscription fees. The platform gained massive popularity in 2025-2026 due to its clean interface, multiple server options, and extensive content library. Unlike many competitors, <strong class="text-white">Cineby</strong> doesn't require any registration — you can start streaming immediately without providing email addresses or personal information.
      </p>

      <p class="text-gray-400 mb-6 leading-relaxed">
        The way <strong class="text-white">Cineby</strong> works is simple. The platform aggregates video links from various third-party sources across the internet, organizing them into a user-friendly catalog. When you click on a movie or TV show on <strong class="text-white">Cineby</strong>, you're presented with multiple server options. If one server is slow or unavailable, <strong class="text-white">Cineby</strong> allows you to switch to another, ensuring you can always find a working stream. This redundancy makes <strong class="text-white">Cineby</strong> one of the most reliable free streaming platforms available today.
      </p>

      <p class="text-gray-400 mb-6 leading-relaxed">
        Another key feature of <strong class="text-white">Cineby</strong> is its organization. Content is categorized by genre, release year, popularity, IMDb ratings, and user reviews. You can easily find trending movies on <strong class="text-white">Cineby</strong>, discover hidden gems, or binge-watch complete TV series. The platform also features a powerful search function that allows you to filter results by multiple criteria, making it simple to find exactly what you want to watch on <strong class="text-white">Cineby</strong>.
      </p>

      <!-- BUTTON 3 -->
      <div class="bg-gray-900/60 p-5 rounded-lg my-6 text-center border border-gray-700">
        <p class="text-gray-300 text-sm mb-3"><strong class="text-white">Cineby</strong> offers the latest movies and trending TV shows in HD quality — completely free</p>
        <a href="/" class="inline-flex items-center gap-2 bg-red-600/80 hover:bg-red-600 text-white font-bold py-2 px-5 rounded-lg transition duration-300 text-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
          </svg>
          <span>Explore Cineby Now</span>
        </a>
      </div>

      <h2 class="text-3xl font-black text-white mt-12 mb-6 uppercase tracking-tight border-l-4 border-red-600 pl-4">Why Cineby Is the Best Free Streaming Platform in 2026</h2>

      <p class="text-gray-400 mb-6 leading-relaxed">
        There are several reasons why <strong class="text-white">Cineby</strong> has become the go-to choice for free streaming. First and foremost, <strong class="text-white">Cineby</strong> offers an extensive content library that rivals paid services. From the latest Hollywood blockbusters to classic films from the 1980s, 1990s, and 2000s, <strong class="text-white">Cineby</strong> has something for everyone. The platform also features a wide selection of international content, including Bollywood movies, K-dramas, anime, and European cinema.
      </p>

      <p class="text-gray-400 mb-6 leading-relaxed">
        Second, <strong class="text-white">Cineby</strong> updates its catalog daily. New movies and TV episodes appear on <strong class="text-white">Cineby</strong> shortly after their official release, often within hours of their theatrical debut or digital premiere. This means you can stay current with the latest entertainment trends without waiting weeks or months for content to become available on paid platforms.
      </p>

      <p class="text-gray-400 mb-6 leading-relaxed">
        Third, <strong class="text-white">Cineby</strong> offers multiple video quality options. Whether you have a fast internet connection and want to watch in HD or 4K, or you're on a slower connection and need standard definition, <strong class="text-white">Cineby</strong> adapts to your needs. The platform also supports subtitles in multiple languages, making it accessible to a global audience.
      </p>

      <!-- Safety Warning Box -->
      <div class="bg-gray-900/50 p-6 rounded-lg my-8">
        <div class="flex items-start gap-3">
          <svg class="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
          <div>
            <p class="text-white font-bold text-sm uppercase tracking-wider">STREAM SAFELY ON CINEBY</p>
            <p class="text-gray-400 text-sm mt-1">Free streaming sites like <strong class="text-white">Cineby</strong> often contain aggressive ads. Always use an ad-blocker and VPN. For safe entertainment, explore our <a href="/" class="text-red-500 hover:text-red-400 underline">homepage</a> for legal alternatives.</p>
          </div>
        </div>
      </div>

      <!-- BUTTON 5 -->
      <div class="text-center my-6">
        <a href="/" class="inline-flex items-center gap-2 bg-red-600/80 hover:bg-red-600 text-white font-bold py-2 px-5 rounded-lg transition duration-300 text-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.5-4.5M15 10l-4.5-4.5M15 10v8m-8-8H3m18 0h-4"></path>
          </svg>
          <span>Browse All Series on Cineby →</span>
        </a>
      </div>

      <h2 class="text-3xl font-black text-white mt-12 mb-6 uppercase tracking-tight border-l-4 border-red-600 pl-4">Understanding Cineby SC and Common Misspellings</h2>

      <p class="text-gray-400 mb-6 leading-relaxed">
        You may have encountered the term <strong class="text-white">Cineby SC</strong> while searching for streaming communities on Reddit, Discord, or Telegram. <strong class="text-white">Cineby SC</strong> typically refers to alternate mirror domains or dedicated streaming communities where users share working <strong class="text-white">Cineby</strong> links, updates about server status, and troubleshooting tips. The "SC" in <strong class="text-white">Cineby SC</strong> commonly stands for "Streaming Community" or "Stream Club."
      </p>

      <p class="text-gray-400 mb-6 leading-relaxed">
        Another frequent search variation is <strong class="text-white">cinaby</strong> — a common typo that occurs when users quickly type <strong class="text-white">Cineby</strong> on their keyboards. Because <strong class="text-white">cinaby</strong> receives thousands of monthly searches, several typosquatting domains have been registered to exploit this traffic. Always verify you're on the legitimate <strong class="text-white">Cineby</strong> domain before entering any information or clicking on any links. The safest way to access <strong class="text-white">Cineby</strong> is through trusted sources, including our <a href="/" class="text-red-500 hover:text-red-400 underline">homepage</a>.
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
        <div class="bg-red-950/20 border border-red-600/30 p-5 rounded-lg">
          <div class="flex items-center gap-2 mb-3">
            <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span class="text-white font-bold uppercase text-sm">Cineby Risks</span>
          </div>
          <ul class="space-y-2 text-sm text-gray-400">
            <li class="flex items-start gap-2"><span class="text-red-500">•</span> Aggressive pop-up ads and redirects</li>
            <li class="flex items-start gap-2"><span class="text-red-500">•</span> Potential malware from third-party servers</li>
            <li class="flex items-start gap-2"><span class="text-red-500">•</span> Domains frequently taken down by ISPs</li>
            <li class="flex items-start gap-2"><span class="text-red-500">•</span> Legal ambiguity depending on your country</li>
          </ul>
        </div>
        <div class="bg-green-950/20 border border-green-600/30 p-5 rounded-lg">
          <div class="flex items-center gap-2 mb-3">
            <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
            <span class="text-white font-bold uppercase text-sm">Safety Tips for Cineby</span>
          </div>
          <ul class="space-y-2 text-sm text-gray-400">
            <li class="flex items-start gap-2"><span class="text-green-500">•</span> Use a reliable VPN service</li>
            <li class="flex items-start gap-2"><span class="text-green-500">•</span> Install an ad-blocker extension</li>
            <li class="flex items-start gap-2"><span class="text-green-500">•</span> Never click on pop-up ads</li>
            <li class="flex items-start gap-2"><span class="text-green-500">•</span> Don't provide personal information</li>
          </ul>
        </div>
      </div>

      <h2 class="text-3xl font-black text-white mt-12 mb-6 uppercase tracking-tight border-l-4 border-red-600 pl-4">Cineby Not Working? Troubleshooting Guide</h2>

      <p class="text-gray-400 mb-6 leading-relaxed">
        If <strong class="text-white">Cineby</strong> isn't loading properly or videos won't play, several issues could be causing the problem. The most common reason is ISP blocking — many internet providers restrict access to free streaming sites like <strong class="text-white">Cineby</strong>. Using a VPN is the most effective solution to bypass these restrictions and regain access to <strong class="text-white">Cineby</strong>.
      </p>

      <ul class="list-disc pl-6 text-gray-400 mb-6 space-y-2">
        <li><strong class="text-white">Domain blocked by ISP</strong> — Use a VPN to access <strong class="text-white">Cineby</strong></li>
        <li><strong class="text-white">Server overload</strong> — Too many users on <strong class="text-white">Cineby</strong>, try streaming during off-peak hours</li>
        <li><strong class="text-white">Outdated mirror URL</strong> — <strong class="text-white">Cineby</strong> domains change frequently, find the latest working link</li>
        <li><strong class="text-white">Browser cache issues</strong> — Clear your cache and cookies, then reload <strong class="text-white">Cineby</strong></li>
        <li><strong class="text-white">Geographic restriction</strong> — Some countries block streaming sites like <strong class="text-white">Cineby</strong></li>
      </ul>

      <p class="text-gray-400 mb-6 leading-relaxed">
        Before giving up on <strong class="text-white">Cineby</strong>, try using a different browser, disabling your antivirus temporarily (if safe), or checking our <a href="/" class="text-red-500 hover:text-red-400 underline">homepage</a> for updated working links and alternative domains.
      </p>

      <h2 class="text-3xl font-black text-white mt-12 mb-6 uppercase tracking-tight border-l-4 border-red-600 pl-4">Best Cineby Alternatives</h2>

      <p class="text-gray-400 mb-6 leading-relaxed">
        When <strong class="text-white">Cineby</strong> servers are down or you want to compare options, these alternatives offer similar free streaming experiences:
      </p>

      <ul class="list-disc pl-6 text-gray-400 mb-6 space-y-2">
        <li><strong class="text-white">Fmovies</strong> — Large library with interface similar to <strong class="text-white">Cineby</strong></li>
        <li><strong class="text-white">Lookmovie</strong> — Higher quality streams with fewer advertisements than <strong class="text-white">Cineby</strong></li>
        <li><strong class="text-white">Soaper TV</strong> — Excellent for binge-watching TV series like <strong class="text-white">Cineby</strong></li>
        <li><strong class="text-white">Hurawatch</strong> — Fast servers and quick content updates, comparable to <strong class="text-white">Cineby</strong></li>
        <li><strong class="text-white">MovieWeb</strong> — Clean interface with minimal interruptions, great <strong class="text-white">Cineby</strong> alternative</li>
      </ul>

      <h2 class="text-3xl font-black text-white mt-12 mb-6 uppercase tracking-tight border-l-4 border-red-600 pl-4">Legal Streaming Alternatives to Cineby</h2>

      <p class="text-gray-400 mb-6 leading-relaxed">
        While <strong class="text-white">Cineby</strong> offers free content, these legal streaming services provide better quality, no intrusive advertisements, and complete safety:
      </p>

      <ul class="list-disc pl-6 text-gray-400 mb-6 space-y-2">
        <li><strong class="text-white">Tubi</strong> — Completely free with ads, 100% legal alternative to <strong class="text-white">Cineby</strong></li>
        <li><strong class="text-white">Pluto TV</strong> — Free live TV channels and on-demand content</li>
        <li><strong class="text-white">Amazon Freevee</strong> — Thousands of movies and TV shows available free</li>
        <li><strong class="text-white">Plex</strong> — Free ad-supported streaming with a clean interface</li>
        <li><strong class="text-white">YouTube</strong> — Many free movies available through official channels</li>
      </ul>

      <p class="text-gray-400 mb-6 leading-relaxed">
        For the latest <strong class="text-white">Cineby</strong> news, movie release dates, and streaming recommendations, bookmark our <a href="/" class="text-red-500 hover:text-red-400 underline">Cineby homepage</a>. We regularly update our content to help you navigate the streaming world safely.
      </p>

      <!-- BUTTON 6 - Final Big Banner -->
      <div class="bg-gradient-to-r from-red-950/50 to-red-900/30 p-8 rounded-xl my-10 border-2 border-red-600/50 text-center">
        <svg class="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <p class="text-white font-bold text-2xl mb-2">Start Watching on Cineby Today</p>
        <p class="text-gray-300 text-sm mb-6">Thousands of movies and TV shows available instantly — no registration, no subscription, no credit card required</p>
        <a href="/" class="inline-flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300 text-lg">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
          </svg>
          <span>Visit Cineby Homepage Now</span>
        </a>
      </div>

      <!-- BUTTON 7 - Footer -->
      <div class="border-t border-gray-800 mt-12 pt-8 text-center">
        <div class="flex justify-center gap-4 mb-4">
          <a href="/" class="text-gray-500 hover:text-red-500 transition-colors"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg></a>
          <a href="/" class="text-gray-500 hover:text-red-500 transition-colors"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"></path></svg></a>
          <a href="/" class="text-gray-500 hover:text-red-500 transition-colors"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg></a>
        </div>
        <p class="text-sm text-gray-500">Written by Marcus Reynolds | Senior Streaming Analyst</p>
        <p class="text-xs text-gray-600 mt-2">Keywords: Cineby, Cineby SC, cinaby, Cineby streaming, Cineby alternative, Cineby not working, Cineby 2026, free movies, free TV series, watch online</p>
        <p class="text-xs text-gray-600 mt-1">Always use a VPN and ad-blocker when visiting free streaming sites like Cineby.</p>
        <p class="text-xs text-gray-600 mt-2">
          <a href="/" class="text-red-500 hover:text-red-400 underline inline-flex items-center gap-1">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Back to Cineby Homepage
          </a>
        </p>
      </div>
    </div>    `;
  }

  const relatedMovies = await getMoviesByKeywordsAction(article.keywords);
  const relatedArticles = articles.filter(a => a.id !== article.id).slice(0, 3);

  return (
    <div className="min-h-screen bg-[#05050A] pb-20">
      
      {/* Hero Section */}
      <div className="relative w-full min-h-[70vh] flex flex-col justify-end pb-16 pt-32 mb-12 border-b border-[#1F2937]">
        <div className="absolute inset-0 z-0">
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#05050A] via-[#05050A]/80 to-[#05050A]/30" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 w-full">
          <Link 
            href="/blog"
            className="inline-flex items-center text-xs font-mono uppercase tracking-widest text-gray-300 hover:text-white transition-colors mb-8 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Blog
          </Link>

          <header>
            <div className="flex flex-wrap gap-2 mb-6">
              {article.keywords.slice(0, 4).map(keyword => (
                <span key={keyword} className="bg-[#E50914] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded shadow-md">
                  {keyword}
                </span>
              ))}
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-6 text-white leading-tight drop-shadow-lg">
              {article.title}
            </h1>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-6 border-t border-white/10">
              <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm font-mono text-gray-300 uppercase tracking-widest bg-black/40 px-4 py-2 rounded-lg backdrop-blur-md">
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

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-gray-300">
          {/* JSON-LD Structured Data */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": article.title,
                "description": article.excerpt,
                "image": article.coverImage,
                "datePublished": article.date,
                "dateModified": article.date,
                "author": {
                  "@type": "Person",
                  "name": article.author,
                },
                "publisher": {
                  "@type": "Organization",
                  "name": "Cineby",
                },
                "keywords": article.keywords.join(', '),
              }),
            }}
          />
          
          <div 
            className="article-content"
            dangerouslySetInnerHTML={{ __html: content }} 
          />
          
          <div className="mt-16 pt-8 border-t border-[#1F2937]">
            <p className="text-xs font-mono text-gray-500 uppercase tracking-widest text-center">End of Transmission</p>
          </div>
        </div>
        
        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="mt-24">
            <h3 className="text-2xl font-black uppercase text-white mb-8 tracking-tighter border-l-4 border-[#E50914] pl-4">More from the Log</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((relArticle) => (
                <Link 
                  key={relArticle.id} 
                  href={`/blog/${relArticle.slug}`}
                  className="group flex flex-col bg-[#0F0F1A] border border-[#1F2937] rounded-xl overflow-hidden hover:border-[#E50914]/50 transition-colors duration-300"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={relArticle.coverImage}
                      alt={relArticle.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F1A] to-transparent opacity-80" />
                  </div>
                  
                  <div className="p-4 flex flex-col flex-1">
                    <h4 className="text-sm font-bold text-white mb-2 tracking-tight line-clamp-2 group-hover:text-[#E50914] transition-colors">
                      {relArticle.title}
                    </h4>
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-auto">
                      {relArticle.date}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Related Movies based on keywords */}
        {article.showRelatedMovies && relatedMovies.length > 0 && (
          <div className="mt-24">
            <h3 className="text-2xl font-black uppercase text-white mb-8 tracking-tighter border-l-4 border-[#E50914] pl-4">Related Cinema</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
              {relatedMovies.slice(0, 10).map(movie => (
                <Link key={movie.id} href={`/${movie.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${movie.id}`} className="group flex flex-col">
                  <div className="w-full aspect-[2/3] relative overflow-hidden rounded-xl border border-[#1F2937] group-hover:border-[#E50914] transition-colors mb-3">
                    <Image src={`https://image.tmdb.org/t/p/w185${movie.poster_path}`} alt={movie.title} fill className="object-cover" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-bold tracking-tight text-sm mb-1 truncate group-hover:text-[#E50914] transition-colors">{movie.title}</span>
                    <span className="text-xs text-gray-500 font-mono">{movie.release_date?.split('-')[0]}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}