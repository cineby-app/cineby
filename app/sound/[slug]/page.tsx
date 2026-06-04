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
    title: `${person.name} - Sound & Music | Cineby`,
    description: person.biography?.substring(0, 160) || `Sound and music composed by ${person.name}`,
  };
}

export default async function SoundPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const id = slug.split("-").pop();
  if (!id) return notFound();

  const person = await fetchPersonDetails(id);
  if (!person) return notFound();

  const department = person.known_for_department?.toLowerCase();
  if (department !== "sound") return notFound();

  return <PersonDetail personId={id} />;
}