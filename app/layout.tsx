import type { Metadata, Viewport } from "next";
import { Inter, Montserrat, DM_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
// 1. Import Next.js optimized Script component
import Script from "next/script"; 

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

// Global Viewport Settings Configuration
export const viewport: Viewport = {
  themeColor: "#b50000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  colorScheme: "dark",
};

// Advanced SEO Metadata Object Export
export const metadata: Metadata = {
  metadataBase: new URL("https://cineby.vip"),
  title: {
    default: "Cineby | Cinema, Series, Music & Entertainment",
    template: "%s | Cineby",
  },
  description: "Discover the best movies, TV series, music, and entertainment content on Cineby. Your ultimate destination for cinematic discovery and cultural exploration.",
  keywords: [
    "cineby",
    "movies",
    "cinema",
    "series",
    "music",
    "entertainment",
    "film reviews",
    "movie recommendations",
    "what to watch",
    "streaming guide",
    "cinematic discovery",
    "film culture",
    "TV shows",
    "music reviews",
    "entertainment news"
  ],
  alternates: {
    canonical: "./",
    languages: {
      "en-US": "https://cineby.vip",
    },
  },
  authors: [{ name: "Cineby Team" }],
  creator: "Cineby",
  publisher: "Cineby",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Cineby | Cinema, Series, Music & Entertainment",
    description: "Discover the best movies, TV series, music, and entertainment content. Your ultimate destination for cinematic discovery.",
    url: "https://cineby.vip",
    siteName: "Cineby",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/img/logo.png",
        width: 1200,
        height: 630,
        alt: "Cineby - Your Entertainment Destination",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cineby | Cinema, Series, Music & Entertainment",
    description: "Discover the best movies, TV series, music, and entertainment content.",
    images: ["/img/logo.png"],
    creator: "@cineby",
    site: "@cineby",
  },
  icons: {
    icon: [
      { url: "/img/favicons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/img/favicons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/img/favicons/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/img/favicons/favicon-64x64.png", sizes: "64x64", type: "image/png" },
      { url: "/img/favicons/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/img/favicons/favicon-128x128.png", sizes: "128x128", type: "image/png" },
      { url: "/img/favicons/favicon-256x256.png", sizes: "256x256", type: "image/png" },
      { url: "/img/favicons/android-chrome-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/img/favicons/android-chrome-72x72.png", sizes: "72x72", type: "image/png" },
      { url: "/img/favicons/android-chrome-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/img/favicons/android-chrome-144x144.png", sizes: "144x144", type: "image/png" },
      { url: "/img/favicons/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/img/favicons/android-chrome-256x256.png", sizes: "256x256", type: "image/png" },
      { url: "/img/favicons/android-chrome-384x384.png", sizes: "384x384", type: "image/png" },
      { url: "/img/favicons/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/img/favicons/apple-touch-icon-57x57.png", sizes: "57x57", type: "image/png" },
      { url: "/img/favicons/apple-touch-icon-72x72.png", sizes: "72x72", type: "image/png" },
      { url: "/img/favicons/apple-touch-icon-114x114.png", sizes: "114x114", type: "image/png" },
      { url: "/img/favicons/apple-touch-icon-120x120.png", sizes: "120x120", type: "image/png" },
      { url: "/img/favicons/apple-touch-icon-144x144.png", sizes: "144x144", type: "image/png" },
      { url: "/img/favicons/apple-touch-icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/img/favicons/apple-touch-icon-180x180.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "mask-icon", url: "/img/favicons/safari-pinned-tab.svg" },
      { rel: "shortcut icon", url: "/img/favicons/favicon.ico" },
    ],
  },
  manifest: "/img/favicons/site.webmanifest",
  verification: {
    google: "your-google-verification-code",
  },
  category: "entertainment",
  appleWebApp: {
    title: "Cineby",
    statusBarStyle: "black-translucent",
    capable: true,
  },
  applicationName: "Cineby",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentYear = new Date().getFullYear();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Cineby",
    url: "https://cineby.vip",
    description: "Your ultimate destination for movies, series, music, and entertainment discovery.",
    potentialAction: {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://cineby.vip/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    sameAs: [
      "https://twitter.com/cineby",
      "https://instagram.com/cineby",
      "https://facebook.com/cineby",
      "https://tiktok.com/@cineby",
      "https://youtube.com/cineby"
    ],
    inLanguage: "en-US",
    copyrightYear: currentYear,
    copyrightHolder: {
      "@type": "Organization",
      name: "Cineby",
      url: "https://cineby.vip"
    }
  };

  const organizationLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Cineby",
    url: "https://cineby.vip",
    logo: "https://cineby.vip/img/logo.png",
    sameAs: [
      "https://twitter.com/cineby",
      "https://instagram.com/cineby",
      "https://facebook.com/cineby"
    ],
    contactPoint: {
      "@type": "ContactPoint",
      email: "contact@cineby.vip",
      contactType: "customer service",
      availableLanguage: ["English"]
    }
  };

  return (
    <html lang="en" className={`${inter.variable} ${montserrat.variable} ${dmSans.variable}`}>
      <head>
        {/* Network Prefetch Optimization triggers */}
        <link rel="preconnect" href="https://image.tmdb.org" />
        <link rel="preconnect" href="https://api.themoviedb.org" />
        <link rel="dns-prefetch" href="https://image.tmdb.org" />
        <link rel="dns-prefetch" href="https://api.themoviedb.org" />
        
        {/* Discovery Feeds */}
        <link rel="alternate" type="application/rss+xml" title="Cineby RSS Feed" href="/feed.xml" />
        
        {/* Preload High-Priority Layout Assets */}
        <link rel="preload" as="image" href="/img/logo.png" />
        
        {/* Legacy MS App Definitions */}
        <meta name="msapplication-TileColor" content="#b50000" />
        <meta name="msapplication-TileImage" content="/img/favicons/mstile-144x144.png" />
        <meta name="msapplication-config" content="/img/favicons/browserconfig.xml" />
      </head>
      <body className="font-sans antialiased bg-[#05050A] text-white">
        
        {/* 2. OPTIMIZED GOOGLE ANALYTICS INTEGRATION USING next/script */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-T9664BYK5Y"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-T9664BYK5Y');
          `}
        </Script>

        {/* Google Structured Schemas injection blocks */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
        />
        
        {/* Screen Reader Accessibility Skip Link anchor */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[250] focus:px-4 focus:py-2 focus:bg-[#b50000] focus:text-white focus:rounded-lg focus:font-bold"
        >
          Skip to content
        </a>
        
        <Navbar />
        
        <main id="main-content" className="min-h-screen">
          {children}
        </main>
        
        <Footer />
      </body>
    </html>
  );
}