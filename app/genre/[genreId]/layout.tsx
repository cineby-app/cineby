import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getGenres } from '@/lib/tmdb';

interface GenrePageProps {
  params: Promise<{ genreId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Generate dynamic metadata for each genre page
export async function generateMetadata({ params, searchParams }: GenrePageProps): Promise<Metadata> {
  const { genreId } = await params;
  const resolvedSearchParams = await searchParams;
  const name = resolvedSearchParams?.name as string | undefined;
  
  // Get genre name from URL param or fetch from API
  let genreName = name;
  
  if (!genreName) {
    const genres = await getGenres();
    const genre = genres.find(g => g.id.toString() === genreId);
    genreName = genre?.name || 'Movies';
  }
  
  const title = `${genreName} Movies | Cineby`;
  const description = `Explore the best ${genreName} movies. Discover top-rated, popular, and latest ${genreName} films. Find your next favorite ${genreName.toLowerCase()} movie to watch tonight.`;
  
  return {
    title,
    description,
    keywords: [`${genreName} movies`, `${genreName} films`, `best ${genreName} movies`, `top ${genreName} films`, `${genreName} genre`, 'movie database', 'film discovery'],
    openGraph: {
      title,
      description,
      url: `https://cineby.vip/genre/${genreId}`,
      siteName: 'Cineby',
      locale: 'en_US',
      type: 'website',
      images: [
        {
          url: '/img/logo.png',
          width: 1200,
          height: 630,
          alt: `${genreName} Movies`,
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
      canonical: `https://cineby.vip/genre/${genreId}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function GenreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}