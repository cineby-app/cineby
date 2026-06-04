import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { articles } from '@/lib/articles';
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

  // Get the full URL for the cover image
  const baseUrl = 'https://cineby.vip';
  const imageUrl = article.coverImage.startsWith('http') 
    ? article.coverImage 
    : `${baseUrl}${article.coverImage}`;

  return {
    // Basic SEO
    title: `${article.title}`,
    description: article.excerpt,
    keywords: article.keywords.join(', '),
    authors: [{ name: article.author, url: `${baseUrl}/author/${article.author.toLowerCase().replace(/\s+/g, '-')}` }],
    creator: article.author,
    publisher: 'Cineby',
    category: 'entertainment',
    
    // Robots
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
    
    // Open Graph for social media (Facebook, LinkedIn, etc.)
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
    
    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: `${article.title} | Cineby Blog`,
      description: article.excerpt,
      images: [imageUrl],
      creator: '@cineby',
      site: '@cineby',
    },
    
    // Canonical URL
    alternates: {
      canonical: `${baseUrl}/blog/${article.slug}`,
    },
    
    // Other SEO meta
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    
    // Application name
    applicationName: 'Cineby',
    
    // Icons (uses your existing favicons)
    icons: {
      icon: '/img/favicons/favicon-32x32.png',
      apple: '/img/favicons/apple-touch-icon-180x180.png',
    },
    
    // Manifest
    manifest: '/img/favicons/site.webmanifest',
  };
}

export default async function BlogPostPage({ params }: Props) {
  const p = await params;
  const article = articles.find((a) => a.slug === p.slug);

  if (!article) {
    notFound();
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
              {article.keywords.map(keyword => (
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
          {/* JSON-LD Structured Data for SEO */}
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
                  "url": `https://cineby.com/author/${article.author.toLowerCase().replace(/\s+/g, '-')}`,
                },
                "publisher": {
                  "@type": "Organization",
                  "name": "Cineby",
                  "logo": {
                    "@type": "ImageObject",
                    "url": "https://cineby.com/img/header-logo.png",
                  },
                },
                "mainEntityOfPage": {
                  "@type": "WebPage",
                  "@id": `https://cineby.com/blog/${article.slug}`,
                },
                "keywords": article.keywords.join(', '),
              }),
            }}
          />
          
          <div 
            className="article-content"
            dangerouslySetInnerHTML={{ __html: article.content }} 
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
              {relatedMovies.map(movie => (
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