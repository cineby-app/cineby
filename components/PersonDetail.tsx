"use client";

import { useState, useEffect } from "react";
import { fetchPersonDetails, fetchPersonMovies, slugify } from "@/lib/tmdb";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { useParams } from "next/navigation";

// Helpers
function formatDate(dateString: string | null): string {
  if (!dateString) return "Unknown";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function calculateAge(birthday: string, deathday: string | null): number | null {
  if (!birthday) return null;
  const birth = new Date(birthday);
  const end = deathday ? new Date(deathday) : new Date();
  let age = end.getFullYear() - birth.getFullYear();
  const monthDiff = end.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < birth.getDate())) age--;
  return age;
}

function GenderIcon({ gender }: { gender: number }) {
  if (gender === 1) return <span className="text-pink-500">♀ Female</span>;
  if (gender === 2) return <span className="text-red-500">♂ Male</span>;
  return <span className="text-gray-500">⚲ Non-binary</span>;
}

// SVG Icons
const IconCalendar = () => (
  <svg className="w-5 h-5 text-[#BE185D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const IconMapPin = () => (
  <svg className="w-5 h-5 text-[#BE185D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const IconSkull = () => (
  <svg className="w-5 h-5 text-[#BE185D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17h8v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7z" />
    <circle cx="9" cy="10" r="1.5" fill="currentColor" />
    <circle cx="15" cy="10" r="1.5" fill="currentColor" />
    <path strokeLinecap="round" strokeWidth={2} d="M9 15h6" />
  </svg>
);

const IconGender = () => (
  <svg className="w-5 h-5 text-[#BE185D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 3h5m0 0v5m0-5l-6 6M5 3H3v2m5 10H3v2h2m10 0h5v-2h-2M9 3H3v2M3 3l6 6" />
  </svg>
);

const IconTrendingUp = () => (
  <svg className="w-5 h-5 text-[#BE185D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const IconStar = () => (
  <svg className="w-5 h-5 text-[#BE185D]" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const IconLink = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m1.858-2.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.102" />
  </svg>
);

const IconImdb = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3.5 7.5h2v9h-2zM8 7.5h2v9H8zM12.5 7.5h2v9h-2zM18.5 7.5h-3v9h3a1.5 1.5 0 001.5-1.5V9a1.5 1.5 0 00-1.5-1.5z" />
  </svg>
);

export function PersonDetail() {
  const params = useParams();
  const slug = params.slug as string;
  const [loading, setLoading] = useState(true);
  const [person, setPerson] = useState<any>(null);
  const [movies, setMovies] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"bio" | "films">("bio");
  const [isBioExpanded, setIsBioExpanded] = useState(false);

    useEffect(() => {
    if (!slug) return;
    const id = slug.split("-").pop();
    if (!id) return;

    async function loadData() {
      setLoading(true);
      const [personData, moviesData] = await Promise.all([
        fetchPersonDetails(id as string),
        fetchPersonMovies(id as string),
      ]);
      setPerson(personData);
      setMovies(moviesData);
      setLoading(false);
    }
    loadData();
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#1F2937] border-t-[#E50914] rounded-full animate-spin" />
      </main>
    );
  }

  if (!person) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">Person not found</p>
      </main>
    );
  }

  const sortedMovies = [...movies].sort((a, b) => {
    const scoreA = a.vote_average * 10 + (a.vote_count || 0) / 100;
    const scoreB = b.vote_average * 10 + (b.vote_count || 0) / 100;
    return scoreB - scoreA;
  });

  const bioPreviewLength = 400;
  const shouldTruncate = person.biography?.length > bioPreviewLength;
  const displayBio =
    isBioExpanded || !shouldTruncate
      ? person.biography
      : person.biography.slice(0, bioPreviewLength) + "...";

  const age = calculateAge(person.birthday, person.deathday);

  return (
    <main className="min-h-screen bg-[#05050A] text-[#F3F4F6] selection:bg-[#BE185D] selection:text-white pb-24 px-6 md:px-16 lg:px-24">
      <div className="max-w-7xl mx-auto mt-28 md:mt-32 mb-6">
        <Breadcrumbs items={[{ label: "People" }, { label: person.name }]} />
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-10 lg:gap-16">
        {/* LEFT COLUMN */}
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
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1F2937] to-[#0F0F1A]">
                <svg className="w-20 h-20 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </div>

          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter mb-2 text-white">
              {person.name}
            </h1>
            <span className="text-[#BE185D] font-mono tracking-widest uppercase text-xs md:text-sm">
              {person.known_for_department}
            </span>
          </div>

          {/* External Links */}
          {(person.homepage || person.imdb_id) && (
            <div className="bg-gradient-to-br from-[#0F0F1A] to-black rounded-2xl border border-[#1F2937] p-4 space-y-2">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <IconLink /> External Links
              </h3>
              <div className="flex flex-col gap-2">
                {person.homepage && (
                  <a
                    href={person.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-300 hover:text-[#BE185D] transition flex items-center gap-2"
                  >
                    <IconLink /> Official Website
                  </a>
                )}
                {person.imdb_id && (
                  <a
                    href={`https://www.imdb.com/name/${person.imdb_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-300 hover:text-[#BE185D] transition flex items-center gap-2"
                  >
                    <IconImdb /> IMDb
                  </a>
                )}
              </div>
            </div>
          )}

          <div className="bg-gradient-to-br from-[#0F0F1A] to-black rounded-2xl border border-[#1F2937] p-5 text-center">
            <div className="text-3xl font-black text-[#BE185D]">{sortedMovies.length}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">
              Movies in filmography
            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN */}
        <div className="flex-1 space-y-8">
          <div className="flex gap-2 border-b border-[#1F2937] pb-2">
            <button
              onClick={() => setActiveTab("bio")}
              className={`px-6 py-2 rounded-t-lg font-bold text-sm uppercase tracking-wider transition-all ${
                activeTab === "bio"
                  ? "bg-[#BE185D] text-white shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              Biography
            </button>
            <button
              onClick={() => setActiveTab("films")}
              className={`px-6 py-2 rounded-t-lg font-bold text-sm uppercase tracking-wider transition-all ${
                activeTab === "films"
                  ? "bg-[#BE185D] text-white shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              Filmography ({sortedMovies.length})
            </button>
          </div>

          <div className="min-h-[400px]">
            {activeTab === "bio" && (
              <div className="bg-gradient-to-br from-[#0F0F1A] to-black rounded-2xl border border-[#1F2937] p-6 md:p-8 space-y-6">
                {/* Personal Info - Modern Responsive Grid */}
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-4">
                    <IconStar /> Personal Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Birthday + Age */}
                    {person.birthday && (
                      <div className="bg-white/5 rounded-xl p-3 flex items-start gap-3 transition-all hover:bg-white/10">
                        <IconCalendar />
                        <div>
                          <div className="text-xs text-gray-400 uppercase tracking-wider">Born</div>
                          <div className="text-white font-medium">{formatDate(person.birthday)}</div>
                          {age && (
                            <div className="text-[#BE185D] text-xs mt-1 font-mono">
                              {person.deathday ? `Died at ${age} years` : `${age} years old`}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Place of Birth */}
                    {person.place_of_birth && (
                      <div className="bg-white/5 rounded-xl p-3 flex items-start gap-3 transition-all hover:bg-white/10">
                        <IconMapPin />
                        <div>
                          <div className="text-xs text-gray-400 uppercase tracking-wider">Place of Birth</div>
                          <div className="text-white font-medium">{person.place_of_birth}</div>
                        </div>
                      </div>
                    )}

                    {/* Deathday */}
                    {person.deathday && (
                      <div className="bg-white/5 rounded-xl p-3 flex items-start gap-3 transition-all hover:bg-white/10">
                        <IconSkull />
                        <div>
                          <div className="text-xs text-gray-400 uppercase tracking-wider">Died</div>
                          <div className="text-white font-medium">{formatDate(person.deathday)}</div>
                        </div>
                      </div>
                    )}

                    {/* Gender */}
                    <div className="bg-white/5 rounded-xl p-3 flex items-start gap-3 transition-all hover:bg-white/10">
                      <IconGender />
                      <div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider">Gender</div>
                        <div className="text-white font-medium">
                          <GenderIcon gender={person.gender} />
                        </div>
                      </div>
                    </div>

                    {/* Popularity with progress bar */}
                    {person.popularity && (
                      <div className="bg-white/5 rounded-xl p-3 flex items-start gap-3 transition-all hover:bg-white/10 sm:col-span-2 lg:col-span-1">
                        <IconTrendingUp />
                        <div className="flex-1">
                          <div className="text-xs text-gray-400 uppercase tracking-wider">Popularity</div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-[#E50914] to-[#BE185D] rounded-full"
                                style={{ width: `${Math.min(100, person.popularity)}%` }}
                              />
                            </div>
                            <span className="text-xs text-white font-mono">{Math.round(person.popularity)}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Also Known As */}
                    {person.also_known_as && person.also_known_as.length > 0 && (
                      <div className="bg-white/5 rounded-xl p-3 col-span-1 sm:col-span-2 lg:col-span-3">
                        <div className="flex items-start gap-3">
                          <IconStar />
                          <div className="flex-1">
                            <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Also Known As</div>
                            <div className="flex flex-wrap gap-1.5">
                              {person.also_known_as.slice(0, 8).map((name: string, idx: number) => (
                                <span key={idx} className="text-xs text-gray-300 bg-black/30 px-2 py-1 rounded-full">
                                  {name}
                                </span>
                              ))}
                              {person.also_known_as.length > 8 && (
                                <span className="text-xs text-gray-500">+{person.also_known_as.length - 8}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Biography */}
                {person.biography ? (
                  <div className="border-t border-[#1F2937] pt-6">
                    <div className="text-gray-300 leading-relaxed text-sm md:text-base whitespace-pre-line">
                      {displayBio}
                    </div>
                    {shouldTruncate && (
                      <button
                        onClick={() => setIsBioExpanded(!isBioExpanded)}
                        className="mt-4 text-[#BE185D] text-sm font-semibold hover:text-white transition-colors inline-flex items-center gap-1 group"
                      >
                        {isBioExpanded ? (
                          <>
                            <span>Show Less</span>
                            <svg className="w-4 h-4 group-hover:-translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </>
                        ) : (
                          <>
                            <span>Read More</span>
                            <svg className="w-4 h-4 group-hover:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No biography available.</p>
                )}
              </div>
            )}

            {activeTab === "films" && (
              <div>
                {sortedMovies.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {sortedMovies.map((movie) => {
                      const movieSlug = slugify(movie.title, movie.id);
                      return (
                        <Link
                          href={`/${movieSlug}`}
                          key={movie.id}
                          className="relative block w-full aspect-[2/3] rounded-lg overflow-hidden transition-all duration-300 group hover:scale-105 hover:shadow-[0_10px_30px_rgba(220,38,38,0.2)] hover:ring-1 hover:ring-[#BE185D]/50 bg-[#0F0F1A]"
                        >
                          {movie.poster_path ? (
                            <Image
                              src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                              alt={movie.title}
                              fill
                              loading="lazy"
                              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                              className="object-cover transition-all duration-500"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1F2937] to-[#0F0F1A]">
                              <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                              </svg>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                            <h3 className="text-white font-bold text-xs line-clamp-2">{movie.title}</h3>
                            <div className="flex items-center gap-1 mt-1">
                              <svg className="w-3 h-3 text-[#E50914]" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                              </svg>
                              <span className="text-[#E50914] text-xs font-bold">{movie.vote_average.toFixed(1)}</span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">No movies found for this person.</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}