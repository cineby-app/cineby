import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Library | Watchlist, Favorites & History',
  description: 'Manage your personal watchlist, favorite titles, and recently watched tracking history all in one secure destination.',
  keywords: ['watchlist', 'favorites', 'recently watched', 'movie library', 'personal collection', 'saved movies'],
  openGraph: {
    title: 'My Library | Cineby',
    description: 'Manage your watchlist, favorites, and recently watched movies. Your personal movie collection all in one place.',
    url: 'https://cineby.vip/library',
    siteName: 'Cineby',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'My Library | Cineby',
    description: 'Manage your watchlist, favorites, and recently watched movies.',
    creator: '@cineby',
    site: '@cineby',
  },
  alternates: {
    canonical: 'https://cineby.vip/library',
  },
  // Private indexing rule configuration for personal client dashboards
  robots: {
    index: false,
    follow: false,
  },
};

export default function LibraryLayout({ children }: { children: React.ReactNode }) {
  return children;
}