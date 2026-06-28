import { Metadata } from 'next';
import { fetchKeywordDetails } from '@/lib/tmdb';

interface KeywordPageProps {
  params: Promise<{ slug: string }>;
}

// ✅ Get keyword name from slug
function getKeywordNameFromSlug(slug: string): string {
  if (!slug) return "Keyword";
  return slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// ✅ Get SEO title for keyword
function getKeywordSeoTitle(slug: string, name: string): string {
  return `Watch Best ${name} Movies - Online Free - Cineby`;
}

// ✅ Get SEO description for keyword
function getKeywordSeoDescription(name: string): string {
  const currentYear = new Date().getFullYear();
  return `Watch the best ${name} movies and TV shows online in HD. Stream top ${name} films for free. ${currentYear} collection. No sign-up required.`;
}

// ✅ Get keywords for SEO
function getKeywordKeywords(name: string): string[] {
  return [
    `watch ${name.toLowerCase()} movies free`,
    `${name.toLowerCase()} films online`,
    `best ${name.toLowerCase()} movies ${new Date().getFullYear()}`,
    `top ${name.toLowerCase()} films`,
    `free ${name.toLowerCase()} streaming`,
    `${name.toLowerCase()} movie collection`,
    'movie database',
    'film discovery',
    'movies by keyword'
  ];
}

export async function generateMetadata({ params }: KeywordPageProps): Promise<Metadata> {
  const { slug } = await params;
  
  // Get keyword name from slug
  const keywordName = getKeywordNameFromSlug(slug);
  
  // ✅ Generate SEO-optimized metadata
  const title = getKeywordSeoTitle(slug, keywordName);
  const description = getKeywordSeoDescription(keywordName);
  const keywords = getKeywordKeywords(keywordName);
  
  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      url: `https://cineby.vip/keyword/${slug}`,
      siteName: 'Cineby',
      locale: 'en_US',
      type: 'website',
      images: [
        {
          url: '/img/cover.webp',
          width: 1200,
          height: 630,
          alt: `${keywordName} Movies - Watch Online HD`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/img/cover.webp'],
      creator: '@cineby',
      site: '@cineby',
    },
    alternates: {
      canonical: `https://cineby.vip/keyword/${slug}`,
    },
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
  };
}

export default async function KeywordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}