// app/tv/[tvSlug]/layout.tsx
import { fetchTVShowDetails, fetchTVCrew } from "@/lib/tmdb";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ tvSlug: string }>;
};

// Generate dynamic metadata from API
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tvSlug } = await params;
  // Extract ID from slug format: "breaking-bad-1396" -> id = "1396"
  const id = tvSlug.split("-").pop();
  
  if (!id) {
    return {
      title: "TV Show Not Found | Cineby",
      description: "The requested TV show could not be found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  try {
    const tvShow = await fetchTVShowDetails(id);
    
    if (!tvShow) {
      return {
        title: "TV Show Not Found | Cineby",
        description: "The requested TV show could not be found",
        robots: {
          index: false,
          follow: false,
        },
      };
    }
    
    // Generate canonical URL with exact slug format
    const canonicalUrl = `https://cineby.vip/tv/${tvSlug}`;
    
    // Rating for structured data
    const ratingValue = tvShow.vote_average || 0;
    const ratingCount = tvShow.vote_count || 0;
    const releaseYear = tvShow.first_air_date?.split("-")[0] || "";
    const lastAirYear = tvShow.last_air_date?.split("-")[0] || "";
    const numberOfSeasons = tvShow.number_of_seasons || 0;
    const numberOfEpisodes = tvShow.number_of_episodes || 0;
    
    // Get creator/director from TV show
    let creator = "";
    if (tvShow.id) {
      try {
        const { fetchTVCrew } = await import("@/lib/tmdb");
        const crew = await fetchTVCrew(id);
        const creatorObj = crew.find((c: any) => c.job === "Creator" || c.job === "Director");
        if (creatorObj) creator = creatorObj.name;
      } catch (error) {
        // Silent fail - creator not critical for SEO
      }
    }
    
    return {
      title: `Watch ${tvShow.name} (${releaseYear || "Unknown"}) | Cineby`,
      description: tvShow.overview?.slice(0, 160) || `Watch ${tvShow.name} - ratings, reviews, episodes, seasons, and more.`,
      keywords: tvShow.genres 
        ? `${tvShow.name}, ${tvShow.genres.map((g) => g.name).join(", ")}, TV series, TV show, watch online, episodes, seasons`
        : tvShow.name,
      
      // Canonical URL
      alternates: {
        canonical: canonicalUrl,
      },
      
      // Open Graph
      openGraph: {
        title: `Watch ${tvShow.name} (${releaseYear}) - TV Series Ratings & Reviews | Cineby`,
        description: tvShow.overview?.slice(0, 160) || `Watch ${tvShow.name} trailer, check ratings, and read reviews.`,
        url: canonicalUrl,
        siteName: "Cineby",
        images: tvShow.poster_path 
          ? [
              {
                url: `https://image.tmdb.org/t/p/w500${tvShow.poster_path}`,
                width: 500,
                height: 750,
                alt: `${tvShow.name} poster`,
              },
              {
                url: `https://image.tmdb.org/t/p/original${tvShow.backdrop_path}`,
                width: 1200,
                height: 630,
                alt: `${tvShow.name} backdrop`,
              },
            ]
          : [],
        locale: "en_US",
        type: "video.tv_show",
        ...(tvShow.first_air_date && { "tv:release_date": tvShow.first_air_date }),
        ...(lastAirYear && { "tv:last_air_date": tvShow.last_air_date }),
        ...(numberOfSeasons && { "tv:number_of_seasons": numberOfSeasons.toString() }),
        ...(numberOfEpisodes && { "tv:number_of_episodes": numberOfEpisodes.toString() }),
        ...(creator && { "tv:creator": creator }),
      },
      
      // Twitter Card
      twitter: {
        card: "summary_large_image",
        title: `${tvShow.name} (${releaseYear}) - Cineby`,
        description: tvShow.overview?.slice(0, 160),
        images: tvShow.poster_path ? [`https://image.tmdb.org/t/p/w500${tvShow.poster_path}`] : [],
        site: "@cineby",
        creator: "@cineby",
      },
      
      // Robots Control
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
      
      // Verification
      verification: {
        google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || "",
      },
      
      // Other meta
      category: "entertainment",
      classification: "TV Series Database",
      authors: [{ name: "Cineby", url: "https://cineby.vip" }],
      creator: "Cineby",
      publisher: "Cineby",
      
      // Apple & Mobile
      appleWebApp: {
        title: `${tvShow.name} - Cineby`,
        statusBarStyle: "black-translucent",
        capable: true,
      },
      
      // Additional TV metadata for rich snippets
      other: {
        "rating:value": ratingValue.toString(),
        "rating:count": ratingCount.toString(),
        "rating:best": "10",
        "rating:worst": "0",
        "first_air_date": tvShow.first_air_date || "",
        "last_air_date": tvShow.last_air_date || "",
        "number_of_seasons": numberOfSeasons.toString(),
        "number_of_episodes": numberOfEpisodes.toString(),
        "content:language": tvShow.original_language || "en",
        ...(tvShow.status && { "tv:status": tvShow.status }),
        ...(tvShow.original_name && tvShow.original_name !== tvShow.name && { "original:name": tvShow.original_name }),
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "TV Series | Cineby",
      description: "Watch TV series online with ratings and reviews",
      robots: {
        index: false,
        follow: true,
      },
    };
  }
}

// Layout wrapper
export default function TVLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}