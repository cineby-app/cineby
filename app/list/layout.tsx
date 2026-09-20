import type { Metadata, Viewport } from "next";
import Script from 'next/script';

// Global Layout Viewport configurations for mobile responsiveness
export const viewport: Viewport = {
  themeColor: "#05050A",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// Enhanced SEO Metadata optimized for Movie & TV Show Lists
export const metadata: Metadata = {
  title: {
    default: "Cineby Lists | Curated Movie & TV Show Collections",
    template: "%s | Cineby Lists",
  },
  description: "Explore expertly curated movie and TV show lists on Cineby. From mind-bending thrillers to heartwarming dramas, discover your next favorite film or series collection.",
  keywords: [
    "movie lists",
    "TV show lists",
    "curated collections",
    "Cineby lists",
    "best films",
    "movie recommendations",
    "TV series collections",
    "movie collections",
    "curated movie lists",
    "must-watch movies",
    "film collections",
    "streaming guides",
    "movie categories",
    "TV show recommendations",
    "cinematic collections"
  ],
  alternates: {
    canonical: "https://cineby.vip/list",
  },
  openGraph: {
    title: "Cineby Lists | Curated Movie & TV Show Collections",
    description: "Explore expertly curated movie and TV show collections. Find your next favorite film or series with our handpicked lists.",
    url: "https://cineby.vip/list",
    siteName: "Cineby Lists",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/img/lists-og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Cineby Lists - Curated Movie & TV Show Collections",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cineby Lists | Curated Movie & TV Show Collections",
    description: "Explore expertly curated movie and TV show collections. Find your next favorite film or series.",
    images: ["/img/lists-og-image.jpg"],
    creator: "@cineby",
    site: "@cineby",
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
  verification: {
    google: "your-google-verification-code", // Add your Google Search Console verification code
  },
  category: "entertainment",
  classification: "Movie Lists, TV Show Collections, Curated Entertainment",
  authors: [{ name: "Cineby Editorial Team" }],
  creator: "Cineby",
  publisher: "Cineby",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

// Breadcrumb structured data for the lists index
const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://cineby.vip/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Lists",
      "item": "https://cineby.vip/list"
    }
  ]
};

// Lists Schema with detailed organization and site navigation
const listsSeriesJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": "https://cineby.vip/list",
  "name": "Cineby Lists",
  "url": "https://cineby.vip/list",
  "description": "Expertly curated movie and TV show collections. Discover handpicked lists of the best films, series, and cinematic experiences.",
  "about": {
    "@type": "Thing",
    "name": "Movie and TV Show Collections",
    "description": "Curated collections of the best movies and TV shows across all genres and eras"
  },
  "mainEntity": {
    "@type": "ItemList",
    "itemListElement": []
  },
  "publisher": {
    "@type": "Organization",
    "name": "Cineby",
    "url": "https://cineby.vip",
    "logo": {
      "@type": "ImageObject",
      "url": "https://cineby.vip/img/logo.png",
      "width": 200,
      "height": 60
    },
    "sameAs": [
      "https://twitter.com/cineby",
      "https://facebook.com/cineby",
      "https://instagram.com/cineby"
    ]
  },
  "inLanguage": "en-US",
  "isAccessibleForFree": true,
  "copyrightHolder": {
    "@type": "Organization",
    "name": "Cineby"
  },
  "copyrightYear": new Date().getFullYear(),
  "lastReviewed": new Date().toISOString().split('T')[0],
  "reviewedBy": {
    "@type": "Organization",
    "name": "Cineby Editorial Team"
  },
  "significantLink": "https://cineby.vip/list",
  "significantLinks": [
    "https://cineby.vip",
    "https://cineby.vip/blog",
    "https://cineby.vip/library"
  ]
};

// Website schema for better indexing
const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://cineby.vip/#website",
  "url": "https://cineby.vip",
  "name": "Cineby",
  "description": "Watch free movies and popular TV shows in Full HD. Expert reviews, curated lists, and streaming guides.",
  "publisher": {
    "@type": "Organization",
    "name": "Cineby"
  },
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://cineby.vip/search/{search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
};

// List Item Schema - Will be populated dynamically
const listItemJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Cineby Movie and TV Show Lists",
  "description": "Curated collections of the best entertainment content",
  "itemListElement": []
};

export default function ListLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* JSON-LD Structured Data - All scripts combined for better performance */}
      <Script
        id="website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        strategy="afterInteractive"
      />
      
      <Script
        id="lists-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listsSeriesJsonLd) }}
        strategy="afterInteractive"
      />
      
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        strategy="afterInteractive"
      />

      <Script
        id="list-item-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listItemJsonLd) }}
        strategy="afterInteractive"
      />

      {/* Sitemap hint for search engines */}
      <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
      
      {/* Preconnect to external resources for faster loading */}
      <link rel="preconnect" href="https://image.tmdb.org" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://image.tmdb.org" />
      
      {/* Section Content Rendering Target Layer */}
      <div className="min-h-screen bg-[#05050A]">
        {children}
      </div>
    </>
  );
}