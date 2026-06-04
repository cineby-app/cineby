import { Metadata } from 'next';
import { Shield, Lock, EyeOff, Cookie, Server, Scale, UserCheck, Radio, FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Sanctuary | Cineby',
  description: 'The honest blueprint of how we protect your space. Zero predictive tracking models, zero data commercialization, and absolute transparency.',
  alternates: {
    canonical: 'https://cineby.app/privacy',
  },
};

export default function PrivacyPage() {
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
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-[#b50000]/5 rounded-full filter blur-[100px] pointer-events-none" />

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

        {/* ================= PRIVACY MANIFESTO FLOW ================= */}
        <div className="px-6 sm:px-12 py-16 relative z-10 space-y-24">
          
          {/* HEADER SECTION */}
          <div className="relative border-b border-zinc-900/60 pb-12">
            <div className="absolute -top-8 left-0 text-[10px] font-mono text-zinc-600 tracking-[0.2em] font-bold">DOC // PRIVACY_01</div>
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/20 bg-red-950/30 backdrop-blur-md mb-8 shadow-[0_0_15px_rgba(181,0,0,0.1)]">
              <Shield className="w-3.5 h-3.5 text-[#b50000]" />
              <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest font-bold">Data Covenant</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight uppercase mb-6 text-white leading-none">
              THE PRIVACY <br />
              <span className="bg-clip-text bg-gradient-to-r from-white via-red-500 text-[#b50000] drop-shadow-[0_2px_10px_rgba(181,0,0,0.2)]">
                SANCTUARY.
              </span>
            </h1>
            
            <p className="text-zinc-400 font-mono text-xs tracking-wider uppercase">
              Last Track update: June 2026 // No hidden changes
            </p>
          </div>

          {/* INTRO PARAGRAPH */}
          <div className="space-y-6 text-zinc-300 font-normal text-sm sm:text-base leading-relaxed tracking-wide">
            <p>
              Just as we refuse to let automated corporate algorithms dictate what movies you discover, we completely refuse to commodify your interactive presence. Cineby is a sanctuary built for film curators, which means your viewing logs, search flows, and library configurations belong entirely to you.
            </p>
            <p>
              We do not track your digital life to package your tastes for brokers. Below is our transparent, straightforward blueprint detailing how we safeguard your interface workspace.
            </p>
          </div>

          {/* CORE CLAUSES */}
          <div className="space-y-16">
            
            {/* CLAUSE 1 */}
            <div className="relative group">
              <div className="flex gap-4 items-start">
                <div className="p-2 rounded-lg bg-zinc-900/50 border border-zinc-800 text-[#b50000] shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold uppercase text-white tracking-wide mb-3 group-hover:text-red-400 transition-colors">
                    01. Vault Protocols & Captures
                  </h2>
                  <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                    When you customize your workspace on Cineby, we strictly preserve only the fundamental components required to support your account interface: your account credentials, selected library lists, ratings, and display configurations. 
                  </p>
                  <p className="text-zinc-500 text-xs italic border-l border-zinc-800 pl-3">
                    We securely process dynamic cinema datasets utilizing the TMDB API. None of your explicit personal activities or query structures are ever submitted to outside networks.
                  </p>
                </div>
              </div>
            </div>

            {/* CLAUSE 2 */}
            <div className="relative group">
              <div className="flex gap-4 items-start">
                <div className="p-2 rounded-lg bg-zinc-900/50 border border-zinc-800 text-[#b50000] shrink-0">
                  <EyeOff className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold uppercase text-white tracking-wide mb-3 group-hover:text-red-400 transition-colors">
                    02. Zero Commercial Trading
                  </h2>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    We maintain an absolute zero-monetization policy over user interactions. We never trade, rent, or distribute your account identifiers, catalog tracking, or exploration pathways to ad servers, marketing rings, or multi-platform trackers. Your cinematic preferences are your private creative architecture.
                  </p>
                </div>
              </div>
            </div>

            {/* CLAUSE 3 */}
            <div className="relative group">
              <div className="flex gap-4 items-start">
                <div className="p-2 rounded-lg bg-zinc-900/50 border border-zinc-800 text-[#b50000] shrink-0">
                  <Cookie className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold uppercase text-white tracking-wide mb-3 group-hover:text-red-400 transition-colors">
                    03. Ephemeral Telemetry & Cookies
                  </h2>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    Cineby uses local storage and fundamental, essential session elements purely to remember who you are logged in as and to keep your customized themes locked into your screen design. We run completely clear of tracking pixels, analytical profiling arrays, or cross-site tracking scripts.
                  </p>
                </div>
              </div>
            </div>

            {/* CLAUSE 4 */}
            <div className="relative group">
              <div className="flex gap-4 items-start">
                <div className="p-2 rounded-lg bg-zinc-900/50 border border-zinc-800 text-[#b50000] shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold uppercase text-white tracking-wide mb-3 group-hover:text-red-400 transition-colors">
                    04. Autonomy & Instant Purge
                  </h2>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    You maintain ultimate jurisdiction over your profile environment. At any given split-second, you have the full authority to wipe your databases, export your records, or permanently trigger a complete purge of your entire account registry from our servers. When you drop the reel, no digital trace remains behind.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* REASSURANCE BLOCK */}
          <div className="p-6 rounded-xl bg-gradient-to-br from-zinc-900/40 to-zinc-950/80 border border-zinc-900 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-red-900/40 to-transparent" />
            <FileText className="w-5 h-5 text-[#b50000] mx-auto mb-3" />
            <p className="text-xs text-zinc-400 leading-relaxed max-w-md mx-auto">
              Our code infrastructure strictly respects modern regulatory landscapes (GDPR & CCPA), but we choose to hold ourselves to an even higher standard: <span className="text-white font-medium">The standard of true cinematic enthusiasts.</span>
            </p>
          </div>

          {/* FINAL REEL FRAME REEL CUT OUTRO */}
          <div className="text-center relative pt-4">
            <div className="absolute -top-6 left-0 text-[10px] font-mono text-zinc-800 tracking-widest font-bold">EOF // PRIVACY_END</div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.25em] text-[#b50000] font-black mb-3">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>[ LOCKING THE VAULT ]</span>
            </div>
            <p className="text-2xl font-black text-white uppercase tracking-tighter drop-shadow-[0_4px_12px_rgba(255,255,255,0.05)]">
              YOUR DISCOVERY IS YOURS.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}