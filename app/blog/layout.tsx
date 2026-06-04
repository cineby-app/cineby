import type { Metadata, Viewport } from "next";

// Global Layout Viewport configurations for mobile responsiveness
export const viewport: Viewport = {
  themeColor: "#05050A",
  colorScheme: "dark",
};

// Target SEO Metadata optimized for Entertainment & Film Blogs
export const metadata: Metadata = {
  title: {
    default: "Cineby Blog | Expert Movie Reviews, Deep Dives & Streaming Guides",
    template: "%s | Cineby Blog",
  },
  description: "Dive into depth with expert film reviews, series breakdowns, breaking entertainment news, and structural deep dives into modern cinema culture.",
  keywords: [
    "movie reviews",
    "film critiques",
    "series recommendations",
    "cinema updates",
    "streaming recommendations",
    "what to watch next",
    "directors deep dives",
    "behind the scenes",
    "cineby articles"
  ],
  alternates: {
    canonical: "https://cineby.vip/blog",
  },
  // openGraph: {
  //   title: "Cineby Blog | Ultimate Insights for Cinema Lovers",
  //   description: "Read expert film analysis, recommendations, and breaking news updates from our passionate entertainment editorial crew.",
  //   url: "https://cineby.vip/blog",
  //   siteName: "Cineby Blog",
  //   locale: "en_US",
  //   type: "blog",
  //   images: [
  //     {
  //       url: "/img/logo.png", // Create a specific image file for your blog section index card share visual
  //       width: 1200,
  //       height: 630,
  //       alt: "Cineby Blog - Entertainment Deep Dives",
  //     },
  //   ],
  // },
  twitter: {
    card: "summary_large_image",
    title: "Cineby Blog | Ultimate Insights for Cinema Lovers",
    description: "Read expert film analysis, recommendations, and breaking news updates from our passionate entertainment editorial crew.",
    images: ["/img/logo.png"],
  },
};

export default function BlogLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  // JSON-LD structured schema parsing specifically for a Blog index layout profile
  const blogSeriesJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": "https://cineby.vip/blog",
    "name": "Cineby Blog",
    "url": "https://cineby.vip/blog",
    "description": "Expert film reviews, television series breakdowns, breaking entertainment news, and structural deep dives into modern cinema culture.",
    "publisher": {
      "@type": "Organization",
      "name": "Cineby",
      "logo": {
        "@type": "ImageObject",
        "url": "https://cineby.vip/img/logo.png"
      }
    },
    "inLanguage": "en-US"
  };

  return (
    <>
      {/* Dynamic script injection providing Google Bot structured entity clarity */}
      <script
        type="viplication/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSeriesJsonLd) }}
      />
      
      {/* Section Content Rendering Target Layer wrviper */}
      <div>
        {children}
      </div>
    </>
  );
}