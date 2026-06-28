// app/[movieSlug]/layout.tsx
import { fetchMovieDetails } from "@/lib/tmdb";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ movieSlug: string }>;
};

// Generate dynamic metadata from API
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { movieSlug } = await params;
  // Extract ID from slug format: "michael-936075" -> id = "936075"
  const id = movieSlug.split("-").pop();
  
  if (!id) {
    return {
      title: "Movie Not Found | Cineby",
      description: "The requested movie could not be found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  try {
    const movie = await fetchMovieDetails(id);
    
    if (!movie) {
      return {
        title: "Movie Not Found | Cineby",
        description: "The requested movie could not be found",
        robots: {
          index: false,
          follow: false,
        },
      };
    }
    
    // Generate canonical URL with exact slug format
    const canonicalUrl = `https://cineby.vip/${movieSlug}`;
    
    // Rating for structured data
    const ratingValue = movie.vote_average || 0;
    const ratingCount = movie.vote_count || 0;
    const releaseYear = movie.release_date?.split("-")[0] || "";
    const runtimeMinutes = movie.runtime || 0;
    
    // Get director from movie (if available in credits)
    let director = "";
    if (movie.id) {
      try {
        const { fetchMovieCrew } = await import("@/lib/tmdb");
        const crew = await fetchMovieCrew(id);
        const directorObj = crew.find((c: any) => c.job === "Director");
        if (directorObj) director = directorObj.name;
      } catch (error) {
        // Silent fail - director not critical for SEO
      }
    }

    // ✅ FIXED: Generate SEO title without duplicate Cineby
    const seoTitle = releaseYear 
      ? `Watch ${movie.title} (${releaseYear}) - Full Movie Online`
      : `Watch ${movie.title} - Full Movie Online`;
    const fullTitle = `${seoTitle}`;  // ✅ Only ONE Cineby branding
    
    // ✅ Generate attractive description
    const genres = movie.genres?.map((g) => g.name).join(", ") || "";
    const description = movie.overview 
      ? `${movie.overview.slice(0, 150)}...` 
      : `Watch ${movie.title} (${releaseYear}) online free. ${genres} film with ${ratingValue.toFixed(1)}/10 rating. Stream in HD now on Cineby.`;
    
    return {
      title: fullTitle,  // ✅ Fixed: "Watch Michael (2026) | Cineby" (NO duplicate)
      description: description,
      keywords: [
        `watch ${movie.title} free online`,
        `${movie.title} full movie`,
        `${movie.title} ${releaseYear}`,
        `${movie.title} streaming`,
        ...(movie.genres?.map((g) => `${g.name.toLowerCase()} movie`) || []),
        'watch movies online free',
        'free movie streaming',
        'HD movies',
        'Cineby'
      ],
      
      // Canonical URL
      alternates: {
        canonical: canonicalUrl,
      },
      
      // Open Graph - ✅ FIXED: No duplicate Cineby
      openGraph: {
        title: fullTitle,  // ✅ Fixed: "Watch Michael (2026) | Cineby"
        description: description,
        url: canonicalUrl,
        siteName: "Cineby",
        images: movie.poster_path 
          ? [
              {
                url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
                width: 500,
                height: 750,
                alt: `${movie.title} poster`,
              },
            ]
          : [],
        locale: "en_US",
        type: "video.movie",
        ...(movie.release_date && { "movie:release_date": movie.release_date }),
        ...(runtimeMinutes && { "movie:runtime": runtimeMinutes }),
        ...(director && { "movie:director": director }),
      },
      
      // Twitter Card - ✅ FIXED: No duplicate Cineby
      twitter: {
        card: "summary_large_image",
        title: fullTitle,  // ✅ Fixed: "Watch Michael (2026) | Cineby"
        description: movie.overview?.slice(0, 160) || `Watch ${movie.title} online free in HD.`,
        images: movie.poster_path ? [`https://image.tmdb.org/t/p/w500${movie.poster_path}`] : [],
        site: "@cineby",
        creator: "@cineby",
      },
      
      // Robots Control - ✅ ARTICLES/MOVIES SHOULD BE INDEXED
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
      classification: "Movie Database",
      authors: [{ name: "Cineby", url: "https://cineby.vip" }],
      creator: "Cineby",
      publisher: "Cineby",
      
      // Apple & Mobile
      appleWebApp: {
        title: `${movie.title} - Cineby`,
        statusBarStyle: "black-translucent",
        capable: true,
      },
      
      // Additional movie metadata for rich snippets
      other: {
        "rating:value": ratingValue.toString(),
        "rating:count": ratingCount.toString(),
        "rating:best": "10",
        "rating:worst": "0",
        "release:date": movie.release_date || "",
        "content:language": movie.original_language || "en",
        ...(movie.status && { "movie:status": movie.status }),
        ...(movie.original_title && movie.original_title !== movie.title && { "original:title": movie.original_title }),
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Movie | Cineby",
      description: "Watch movies online with ratings and reviews",
      robots: {
        index: true,
        follow: true,
      },
    };
  }
}

// Layout wrapper
export default function MovieLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}