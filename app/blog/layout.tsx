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

// Enhanced SEO Metadata optimized for Movie Reviews, TV Shows & Entertainment News
export const metadata: Metadata = {
  title: {
    default: "Movie Reviews & TV Show News",  // ✅ Changed to Cineby
    template: "%s | Cineby",  // ✅ Changed to Cineby (no duplicate)
  },
  description: "Read expert movie reviews, TV show breakdowns, and the latest entertainment news. Discover what to watch next with our in-depth film analysis and streaming guides.",
  keywords: [
    "movie reviews",
    "tv show reviews",
    "film critiques",
    "entertainment news",
    "series breakdowns",
    "what to watch",
    "streaming guides",
    "cinema analysis",
    "film recommendations",
    "best movies",
    "tv series reviews",
    "movie news",
    "hollywood updates",
    "film industry",
    "cineby blog"
  ],
  alternates: {
    canonical: "https://cineby.vip/blog",
    languages: {
    'en-US': `https://cineby.vip/blog`, // Tells Google to prioritize this for US searchers
    'x-default': `https://cineby.vip/blog`, // Fallback for everyone else
  },
  },
  openGraph: {
    title: "Movie Reviews & TV Show News",  // ✅ Changed to Cineby
    description: "Expert movie reviews, TV show breakdowns, and entertainment news. Find your next favorite film or series with our in-depth analysis.",
    url: "https://cineby.vip/blog",
    siteName: "Cineby Blog",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/img/cover.webp",
        width: 1200,
        height: 630,
        alt: "Movie Reviews and TV Show News - Cineby Blog",
        type: "image/webp",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Movie Reviews & TV Show News",  // ✅ Changed to Cineby
    description: "Expert movie reviews, TV show breakdowns, and entertainment news. Discover what to watch next with our film analysis.",
    images: ["/img/cover.webp"],
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
    google: "your-google-verification-code",
  },
  category: "entertainment",
  classification: "Movie Reviews, TV Show Reviews, Entertainment News, Film Analysis",
  authors: [{ name: "Cineby Editorial Team" }],
  creator: "Cineby",
  publisher: "Cineby",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

// Breadcrumb structured data
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
      "name": "Blog",
      "item": "https://cineby.vip/blog"
    }
  ]
};

// Blog Schema for Movie Reviews, TV Shows & Entertainment
const blogSeriesJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": "https://cineby.vip/blog",
  "name": "Cineby Blog - Movie Reviews & TV Show News",
  "url": "https://cineby.vip/blog",
  "description": "Read expert movie reviews, TV show breakdowns, and the latest entertainment news. Discover what to watch next with our in-depth film analysis and streaming guides.",
  "about": {
    "@type": "Thing",
    "name": "Movie and TV Show Reviews",
    "description": "Comprehensive movie reviews, TV show breakdowns, and entertainment news coverage"
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
      "url": "/img/cover.webp",
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
  }
};

// Website schema
const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://cineby.vip/#website",
  "url": "https://cineby.vip",
  "name": "Cineby - Movie Reviews & TV Show News",
  "description": "Expert movie reviews, TV show breakdowns, and entertainment news. Find your next favorite film or series.",
  "publisher": {
    "@type": "Organization",
    "name": "Cineby",
    "logo": {
      "@type": "ImageObject",
      "url": "/img/cover.webp"
    }
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

export default function BlogLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* JSON-LD Structured Data */}
      <Script
        id="website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        strategy="afterInteractive"
      />
      
      <Script
        id="blog-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSeriesJsonLd) }}
        strategy="afterInteractive"
      />
      
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        strategy="afterInteractive"
      />

      <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
      <link rel="alternate" type="application/rss+xml" title="Cineby Blog RSS Feed" href="/blog/feed.xml" />
      <link rel="preconnect" href="https://image.tmdb.org" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://image.tmdb.org" />
      
      <div>
        {children}
      </div>
    </>
  );
}