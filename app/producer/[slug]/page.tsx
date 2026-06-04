import { Metadata } from "next";
import { fetchPersonDetails } from "@/lib/tmdb";
import { PersonDetail } from "@/components/PersonDetail";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const id = slug.split("-").pop();
  if (!id) return {};

  const person = await fetchPersonDetails(id);
  if (!person) return {};

  return {
    title: `${person.name} - Producer | Cineby`,
    description: person.biography?.substring(0, 160) || `Produced by ${person.name} – movies, TV shows, and biography.`,
  };
}

export default async function ProducerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const id = slug.split("-").pop();
  if (!id) return notFound();

  const person = await fetchPersonDetails(id);
  if (!person) return notFound();

  const department = person.known_for_department?.toLowerCase();
  if (department !== "production") return notFound();

  // Render the component without any props - it will get the ID from the URL using useParams()
  return <PersonDetail />;
}