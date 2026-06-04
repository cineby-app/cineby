import { Metadata } from 'next';
import { Scale, ShieldCheck, HelpCircle, Terminal, AlertCircle, Ban, Radio, FileCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of the Pact | Cineby',
  description: 'The creative operating rules of our cinematic sanctuary. Respect the art, respect the platform, and protect the community core.',
  alternates: {
    canonical: 'https://cineby.app/terms',
  },
};

export default function TermsPage() {
  // Generates enough frames to guarantee a perfectly fluid, seamless continuous looping track
  const sprocketHoles = Array.from({ length: 40 });

  return (
    <div className="min-h-screen bg-[#030307] pt-32 pb-24 px-4 relative overflow-hidden selection:bg-[#b50000] selection:text-white">
      
      {/* High-fidelity CSS Keyframes inject for infinite opposing celluloid reel tracks */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scrollDown {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes scrollUp {
          0% { transform: translateY(-50%); }
          100% { transform: translateY(0); }
        }
        .animate-film-down {
          animation: scrollDown 18s linear infinite;
        }
        .animate-film-up {
          animation: scrollUp 18s linear infinite;
        }
      `}} />

      {/* Atmospheric Anamorphic Projector Backlight Beam */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-[radial-gradient(circle_at_50%_0%,rgba(181,0,0,0.12),rgba(181,0,0,0.01)_45%,transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-[#b50000]/4 rounded-full filter blur-[100px] pointer-events-none" />

      {/* ================= PREMIUM REEL CELLULOID ENCLOSURE ================= */}
      <div className="max-w-2xl mx-auto relative border-x border-zinc-800/40 bg-gradient-to-b from-zinc-950/40 to-black/60 backdrop-blur-md shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-xl">
        
        {/* LEFT FILM TRACK: Moving Top to Down Infinitely */}
        <div className="hidden sm:block absolute -left-[30px] top-4 bottom-4 w-3 overflow-hidden pointer-events-none opacity-40 [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]">
          <div className="flex flex-col gap-5 py-2 animate-film-down h-[200%]">
            {sprocketHoles.map((_, i) => (
              <div key={`left-1-${i}`} className="w-2.5 h-4 border border-zinc-700/60 rounded-[3px] bg-gradient-to-b from-zinc-900 to-zinc-950 shadow-inner shrink-0 relative">
                <div className="absolute inset-0.5 bg-black/40 rounded-[1px]" />
              </div>
            ))}
            {sprocketHoles.map((_, i) => (
              <div key={`left-2-${i}`} className="w-2.5 h-4 border border-zinc-700/60 rounded-[3px] bg-gradient-to-b from-zinc-900 to-zinc-950 shadow-inner shrink-0 relative">
                <div className="absolute inset-0.5 bg-black/40 rounded-[1px]" />
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT FILM TRACK: Moving Down to Top Infinitely */}
        <div className="hidden sm:block absolute -right-[30px] top-4 bottom-4 w-3 overflow-hidden pointer-events-none opacity-40 [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]">
          <div className="flex flex-col gap-5 py-2 animate-film-up h-[200%]">
            {sprocketHoles.map((_, i) => (
              <div key={`right-1-${i}`} className="w-2.5 h-4 border border-zinc-700/60 rounded-[3px] bg-gradient-to-b from-zinc-900 to-zinc-950 shadow-inner shrink-0 relative">
                <div className="absolute inset-0.5 bg-black/40 rounded-[1px]" />
              </div>
            ))}
            {sprocketHoles.map((_, i) => (
              <div key={`right-2-${i}`} className="w-2.5 h-4 border border-zinc-700/60 rounded-[3px] bg-gradient-to-b from-zinc-900 to-zinc-950 shadow-inner shrink-0 relative">
                <div className="absolute inset-0.5 bg-black/40 rounded-[1px]" />
              </div>
            ))}
          </div>
        </div>

        {/* ================= TERMS MANIFESTO FLOW ================= */}
        <div className="px-6 sm:px-12 py-16 relative z-10 space-y-24">
          
          {/* HEADER SECTION */}
          <div className="relative border-b border-zinc-900/60 pb-12">
            <div className="absolute -top-8 left-0 text-[10px] font-mono text-zinc-600 tracking-[0.2em] font-bold">DOC // TERMS_01</div>
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/20 bg-red-950/30 backdrop-blur-md mb-8 shadow-[0_0_15px_rgba(181,0,0,0.1)]">
              <Scale className="w-3.5 h-3.5 text-[#b50000]" />
              <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest font-bold">The Framework Pact</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight uppercase mb-6 text-white leading-none">
              TERMS OF THE <br />
              <span className="bg-clip-text bg-gradient-to-r from-white via-red-500 text-[#b50000] drop-shadow-[0_2px_10px_rgba(181,0,0,0.2)]">
                ALLIANCE.
              </span>
            </h1>
            
            <p className="text-zinc-400 font-mono text-xs tracking-wider uppercase">
              Operational Code Cycle: June 2026 // Active Framework
            </p>
          </div>

          {/* INTRO PARAGRAPH */}
          <div className="space-y-6 text-zinc-300 font-normal text-sm sm:text-base leading-relaxed tracking-wide">
            <p>
              By accessing <span className="text-white font-medium">Cineby</span>, you enter a mutual alliance to respect the pure, unfiltered spirit of art and exploration. This isn&apos;t a corporate trap designed to strip your user rights—it is a functional operating manual to ensure our interface remains stable, clean, and uncorrupted.
            </p>
            <p>
              Stepping inside this environment means you explicitly acknowledge and agree to respect the following foundational protocols.
            </p>
          </div>

          {/* CORE CLAUSES */}
          <div className="space-y-16">
            
            {/* CLAUSE 1 */}
            <div className="relative group">
              <div className="flex gap-4 items-start">
                <div className="p-2 rounded-lg bg-zinc-900/50 border border-zinc-800 text-[#b50000] shrink-0">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold uppercase text-white tracking-wide mb-3 group-hover:text-red-400 transition-colors">
                    01. Creative Workspace License
                  </h2>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    Cineby grants you a non-exclusive, immediate personal access pathway to curate lists, explore film meta-structures, and organize your media pools. You agree not to map, harvest, or extract data arrays from our site architecture via malicious automated bots, scraper frameworks, or heavy stress vectors.
                  </p>
                </div>
              </div>
            </div>

            {/* CLAUSE 2 */}
            <div className="relative group">
              <div className="flex gap-4 items-start">
                <div className="p-2 rounded-lg bg-zinc-900/50 border border-zinc-800 text-[#b50000] shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold uppercase text-white tracking-wide mb-3 group-hover:text-red-400 transition-colors">
                    02. Sanctuary Integrity & Conduct
                  </h2>
                  <p className="text-zinc-400 text-sm leading-relaxed mb-3">
                    As a curator, you are entirely responsible for protecting your credentials and the reviews, ratings, and logs you anchor to your profile. 
                  </p>
                  <p className="text-zinc-500 text-xs italic border-l border-zinc-800 pl-3">
                    Any user attempting to inject destructive code arrays, exploit search input queries, distribute spam loops, or mock up abusive material within community modules will face an immediate, permanent terminal ban.
                  </p>
                </div>
              </div>
            </div>

            {/* CLAUSE 3 */}
            <div className="relative group">
              <div className="flex gap-4 items-start">
                <div className="p-2 rounded-lg bg-zinc-900/50 border border-zinc-800 text-[#b50000] shrink-0">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold uppercase text-white tracking-wide mb-3 group-hover:text-red-400 transition-colors">
                    03. External Data Credits (TMDB)
                  </h2>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    Cineby functions as a high-fidelity rendering pipeline. Our catalogs are generated seamlessly via metadata sets provided directly by The Movie Database (TMDB). We do not officially claim ownership of copyrighted promotional banners, film logs, or cast poster graphics rendered through their open API streams.
                  </p>
                </div>
              </div>
            </div>

            {/* CLAUSE 4 */}
            <div className="relative group">
              <div className="flex gap-4 items-start">
                <div className="p-2 rounded-lg bg-zinc-900/50 border border-zinc-800 text-[#b50000] shrink-0">
                  <Ban className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold uppercase text-white tracking-wide mb-3 group-hover:text-red-400 transition-colors">
                    04. Refusal of Warranties
                  </h2>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    This platform is maintained and served "as is" and "as available," completely clear of commercial performance tracking or guaranteed continuous operating uptimes. We hold no liability for structural modifications, database adjustments, or accidental disruptions to your synchronized libraries.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* AGREEMENT BLOCK */}
          <div className="p-6 rounded-xl bg-gradient-to-br from-zinc-900/40 to-zinc-950/80 border border-zinc-900 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-red-900/40 to-transparent" />
            <FileCheck className="w-5 h-5 text-[#b50000] mx-auto mb-3" />
            <p className="text-xs text-zinc-400 leading-relaxed max-w-md mx-auto">
              We reserve the right to upgrade these core protocols to maintain alignment with updated security standards. Continued utilization of <span className="text-white font-medium">cineby.app</span> establishes full consent to this pact.
            </p>
          </div>

          {/* FINAL REEL FRAME REEL CUT OUTRO */}
          <div className="text-center relative pt-4">
            <div className="absolute -top-6 left-0 text-[10px] font-mono text-zinc-800 tracking-widest font-bold">EOF // TERMS_END</div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.25em] text-[#b50000] font-black mb-3">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>[ SYSTEMS ONLINE ]</span>
            </div>
            <p className="text-2xl font-black text-white uppercase tracking-tighter drop-shadow-[0_4px_12px_rgba(255,255,255,0.05)]">
              HONOR THE CINEMA.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}