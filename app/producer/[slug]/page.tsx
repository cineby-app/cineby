import { Metadata } from "next";
import { fetchPersonDetails, fetchPersonCredits } from "@/lib/tmdb";
import PersonDetail from "@/components/PersonDetail";
import { notFound } from "next/navigation";

// ========== GENERATE METADATA WITH FULL SEO ==========
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const id = slug.split("-").pop();
  if (!id) return {};

  const person = await fetchPersonDetails(id);
  if (!person) return {};

  const name = person.name || "Producer";
  const role = "Producer";
  
  // ✅ FIX: Fetch credits for SEO instead of using non-existent properties
  let knownFor = "";
  let recentCredits = "";
  
  try {
    const credits = await fetchPersonCredits(id);
    if (credits && credits.cast) {
      const cast = credits.cast || [];
      // Get top 3 most popular/known works
      const sortedCast = [...cast].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
      const topCredits = sortedCast.slice(0, 3);
      knownFor = topCredits.map((item: any) => item.title || item.name).join(", ");
      
      // Get 5 most recent credits
      const recentCast = sortedCast.slice(0, 5);
      recentCredits = recentCast.map((item: any) => item.title || item.name).join(", ");
    }
  } catch (error) {
    console.error("Error fetching credits for SEO:", error);
  }
  
  // Generate description
  const description = person.biography 
    ? person.biography.substring(0, 160) 
    : `Watch all movies and TV shows produced by ${name}. Discover the complete filmography, biography, and latest projects of producer ${name} on Cineby.`;
  
  // Generate keywords
  const keywords = [
    name,
    `${name} movies`,
    `${name} TV shows`,
    `${name} producer`,
    `${name} filmography`,
    `${name} biography`,
    ...(knownFor ? knownFor.split(", ") : []),
    ...(recentCredits ? recentCredits.split(", ") : []),
    "producer",
    "movies",
    "TV shows",
    "filmography",
    "streaming",
    "Cineby"
  ].join(", ");

  // Generate image URL for social sharing
  const image = person.profile_path 
    ? `https://image.tmdb.org/t/p/original${person.profile_path}`
    : "https://cineby.vip/img/og-image.jpg";

  return {
    title: `${name} - Producer | Movies & TV Shows | Cineby`,
    description: description,
    keywords: keywords,
    authors: [{ name: "Cineby" }],
    creator: "Cineby",
    publisher: "Cineby",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: `https://cineby.vip/producer/${slug}`,
    },
    openGraph: {
      title: `${name} - Producer | Movies & TV Shows | Cineby`,
      description: description,
      url: `https://cineby.vip/producer/${slug}`,
      siteName: "Cineby",
      type: "profile",
      images: [
        {
          url: image,
          width: 780,
          height: 780,
          alt: `${name} - Producer profile photo`,
        },
      ],
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} - Producer | Movies & TV Shows | Cineby`,
      description: description,
      images: [image],
      site: "@cineby",
      creator: "@cineby",
    },
    other: {
      "person:name": name,
      "person:role": role,
      "person:known_for": knownFor,
    },
  };
}

// ========== MAIN PRODUCER PAGE ==========
export default async function ProducerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const id = slug.split("-").pop();
  if (!id) return notFound();

  const person = await fetchPersonDetails(id);
  if (!person) return notFound();

  // ❌ REMOVED: Department validation that caused 404s for multi-role people
  // const department = person.known_for_department?.toLowerCase();
  // if (department !== "production") return notFound();

  return <PersonDetail />;
}