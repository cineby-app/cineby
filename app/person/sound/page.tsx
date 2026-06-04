import { Metadata } from 'next';
import { fetchPersonDetails, fetchPersonMovies } from "@/lib/tmdb";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { slugify } from "@/lib/tmdb";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export async function generateMetadata({ params }: { params: Promise<{ personId: string }> }): Promise<Metadata> {
  const { personId } = await params;
  const person = await fetchPersonDetails(personId);
  if (!person) return {};

  return {
    title: `${person.name} | Cineby`,
    description: person.biography?.substring(0, 160) || `Biography and movies for ${person.name}`,
    openGraph: {
      title: `${person.name} | Cineby`,
      description: person.biography?.substring(0, 160) || `Biography and movies for ${person.name}`,
      images: person.profile_path ? [`https://image.tmdb.org/t/p/w500${person.profile_path}`] : [],
    }
  };
}

export default async function PersonPage({
  params,
}: {
  params: Promise<{ personId: string }>;
}) {
  const { personId } = await params;

  const [person, movies] = await Promise.all([
    fetchPersonDetails(personId),
    fetchPersonMovies(personId),
  ]);

  if (!person) return notFound();

  const sortedMovies = [...movies].sort((a, b) => {
    const scoreA = a.vote_average * 10 + (a.vote_count || 0) / 100;
    const scoreB = b.vote_average * 10 + (b.vote_count || 0) / 100;
    return scoreB - scoreA;
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: person.name,
    image: person.profile_path
      ? `https://image.tmdb.org/t/p/w500${person.profile_path}`
      : undefined,
    description: person.biography,
    url: `https://Cineby.vip/person/${person.id}`,
  };

  return (
    <main className="min-h-screen bg-[#05050A] text-[#F3F4F6] selection:bg-[#BE185D] selection:text-white pb-24 px-6 md:px-16 lg:px-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="max-w-7xl mx-auto mt-28 md:mt-32 mb-6">
        <Breadcrumbs items={[{ label: 'People' }, { label: person.name }]} />
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-10 lg:gap-16">
        <aside className="w-full md:w-[30%] lg:w-[25%] shrink-0 space-y-6">
          <div className="w-48 mx-auto md:mx-0 md:w-full aspect-[2/3] rounded-xl overflow-hidden bg-[#0F0F1A] border border-[#1F2937] shadow-[0_0_50px_rgba(0,0,0,0.5)] relative">
            {person.profile_path ? (
              <Image
                src={`https://image.tmdb.org/t/p/w780${person.profile_path}`}
                alt={person.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 192px, 300px"
                priority
                referrerPolicy="no-referrer"
              />
            ) : null}
          </div>

          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter mb-2 text-white">
              {person.name}
            </h1>
            <p className="text-[#BE185D] font-mono tracking-widest uppercase text-xs md:text-sm">
              {person.known_for_department}
            </p>
          </div>
        </aside>

        <div className="flex-1 space-y-12 md:space-y-16">
          {person.biography && (
            <section className="bg-[#0F0F1A] border border-[#1F2937] rounded-xl p-6 md:p-8">
              <h2 className="text-xs md:text-sm font-bold tracking-widest text-gray-500 uppercase mb-4 font-mono">
                Biography
              </h2>
              <div className="text-gray-300 leading-relaxed text-sm md:text-base max-w-4xl whitespace-pre-line">
                {person.biography}
              </div>
            </section>
          )}

          {sortedMovies.length > 0 && (
             <section>
                <h2 className="text-sm md:text-base font-bold tracking-widest text-[#BE185D] uppercase mb-6 font-mono">
                  Filmography & Known For
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  {sortedMovies.map((movie) => {
                    const slug = slugify(movie.title, movie.id);
                    return (
                      <Link
                        href={`/${slug}`}
                        key={movie.id}
                        className="relative block w-full aspect-[2/3] shrink-0 rounded-lg overflow-hidden transition-all duration-300 group hover:scale-105 hover:shadow-[0_10px_30px_rgba(220,38,38,0.2)] hover:ring-1 hover:ring-[#BE185D]/50 bg-[#0F0F1A]"
                      >
                        <Image
                          src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                          alt={movie.title}
                          fill
                          loading="lazy"
                          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover transition-all duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#05050A] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 md:p-4">
                          <h3 className="text-white font-bold text-xs md:text-sm leading-tight mb-1">
                            {movie.title}
                          </h3>
                          <span className="text-[#BE185D] font-bold text-[10px] md:text-xs tracking-wider">
                            ★ {movie.vote_average.toFixed(1)}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
             </section>
          )}
        </div>
      </div>
    </main>
  );
}
