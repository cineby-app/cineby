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
    title: `${person.name} - Actor | WhatToWatch`,
    description: person.biography?.substring(0, 160) || `Filmography and biography of actor ${person.name}`,
  };
}

export default async function ActorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const id = slug.split("-").pop();
  if (!id) return notFound();

  const person = await fetchPersonDetails(id);
  if (!person) return notFound();

  // Validate: only actors (department "Acting")
  const department = person.known_for_department?.toLowerCase();
  if (department !== "acting") return notFound();

  return <PersonDetail personId={id} />;
}