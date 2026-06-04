import { Metadata } from 'next';
import { fetchKeywordDetails } from '@/lib/tmdb';

interface KeywordPageProps {
  params: Promise<{ keywordId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function getIdFromSlug(slug: string): number | null {
  if (!slug) return null;
  const parts = slug.split("-");
  const id = parts.pop();
  return id ? parseInt(id, 10) : null;
}

function getNameFromSlug(slug: string): string {
  if (!slug) return "Keyword";
  const parts = slug.split("-");
  parts.pop();
  const name = parts.join(" ");
  return name.charAt(0).toUpperCase() + name.slice(1);
}

// Generate dynamic metadata for each keyword page
export async function generateMetadata({ params, searchParams }: KeywordPageProps): Promise<Metadata> {
  const { keywordId } = await params;
  const resolvedSearchParams = await searchParams;
  
  // Extract ID from slug (e.g., "action-123" → 123)
  const id = getIdFromSlug(keywordId);
  
  let keywordName = '';
  
  // Try to get keyword name from URL query param first
  const nameParam = resolvedSearchParams?.name as string | undefined;
  if (nameParam) {
    keywordName = nameParam;
  } else if (id) {
    // Fetch keyword details from API
    try {
      const keyword = await fetchKeywordDetails(id.toString());
      keywordName = keyword?.name || getNameFromSlug(keywordId);
    } catch (error) {
      keywordName = getNameFromSlug(keywordId);
    }
  } else {
    keywordName = getNameFromSlug(keywordId);
  }
  
  const title = `${keywordName} Movies | Cineby`;
  const description = `Discover all movies tagged with "${keywordName}". Explore the best ${keywordName} films, including top-rated, popular, and latest releases. Find your next favorite ${keywordName.toLowerCase()} movie.`;
  
  return {
    title,
    description,
    keywords: [`${keywordName} movies`, `${keywordName} films`, `best ${keywordName} movies`, `top ${keywordName} films`, `${keywordName} tag`, 'movie database', 'film discovery', 'movies by keyword'],
    openGraph: {
      title,
      description,
      url: `https://cineby.vip/keyword/${keywordId}`,
      siteName: 'Cineby',
      locale: 'en_US',
      type: 'website',
      images: [
        {
          url: '/img/logo.png',
          width: 1200,
          height: 630,
          alt: `${keywordName} Movies`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/img/logo.png'],
      creator: '@cineby',
      site: '@cineby',
    },
    alternates: {
      canonical: `https://cineby.vip/keyword/${keywordId}`,
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