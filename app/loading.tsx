"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { RefreshCw, Home } from "lucide-react";

export default function Loading() {
  const [isLazy, setIsLazy] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 🚨 6-Second Performance Session Recovery
    const safetyTimer = setTimeout(() => {
      setIsLazy(true);
      
      if (typeof window !== "undefined" && window.history.length > 1) {
        router.back(); // Smooth bounce-back to their active page history
      } else {
        router.push("/"); // Clean root layout recovery fallback
      }
    }, 6000);

    return () => clearTimeout(safetyTimer);
  }, [router]);

  return (
    <div className="fixed inset-0 z-[99999] bg-[#020204] w-screen h-screen flex flex-col items-center justify-center m-0 p-0 overflow-hidden select-none left-0 top-0">
      
      {/* 🎬 High-Fidelity Streaming Engine Overrides */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes netflixExpand {
          0% { transform: scaleX(0); opacity: 0.2; }
          40% { transform: scaleX(0.6); opacity: 1; }
          100% { transform: scaleX(1); opacity: 0.1; }
        }
        @keyframes subtleLogoPulse {
          0%, 100% { transform: scale(0.97); opacity: 0.9; }
          50% { transform: scale(1.03); opacity: 1; filter: drop-shadow(0 0 25px rgba(229,9,20,0.25)); }
        }
        @keyframes flareGlow {
          0%, 100% { opacity: 0.15; transform: scale(1) translate(-50%, -50%); }
          50% { opacity: 0.35; transform: scale(1.05) translate(-50%, -50%); }
        }
        .animate-netflix-line {
          animation: netflixExpand 1.8s cubic-bezier(0.5, 0, 0.1, 1) infinite;
        }
        .animate-brand-pulse {
          animation: subtleLogoPulse 2s ease-in-out infinite;
        }
        .animate-ambient-flare {
          animation: flareGlow 4s ease-in-out infinite;
        }
      `}} />

      {/* Atmospheric Theater Spotlight Backlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(229,9,20,0.14),rgba(229,9,20,0.01)_55%,transparent_75%)] pointer-events-none filter blur-[55px] animate-ambient-flare" />

      {/* Main Core Layout Wrapper */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center w-full max-w-xs px-4">
        
        {!isLazy ? (
          <div className="flex flex-col items-center w-full">
            
            {/* ================= EXTRA LARGE BRAND LAYER ================= */}
            <div className="relative w-32 h-32 flex items-center justify-center mb-5 overflow-visible">
              <div className="relative w-24 h-24 z-10 animate-brand-pulse">
                <Image
                  src="/img/load.png"
                  alt="Cineby"
                  fill
                  className="object-contain"
                  priority
                  sizes="(max-width: 120px) 100vw, 96px"
                />
              </div>
            </div>

            {/* ================= NETFLIX-STYLE EXPANDING TRACK LINE ================= */}
            <div className="w-36 h-[3px] bg-zinc-900/80 rounded-full relative overflow-hidden mb-5 border border-zinc-950">
              <div className="absolute top-0 bottom-0 left-0 right-0 bg-gradient-to-r from-transparent via-[#E50914] to-transparent rounded-full shadow-[0_0_10px_#e50914] origin-center animate-netflix-line" />
            </div>

            {/* Typography Engine Label */}
            <span className="text-[11px] font-mono font-bold tracking-[0.35em] text-zinc-400 uppercase mr-[-0.35em] animate-pulse">
              Loading Data.
            </span>

          </div>
        ) : (
          /* ================= RECOVERY TIMER PANEL ================= */
          <div className="flex flex-col items-center animate-fade-in duration-300">
            <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center mb-4 text-zinc-400 shadow-md">
              <RefreshCw className="w-4 h-4 animate-spin text-[#E50914]" />
            </div>
            
            <h4 className="text-xs font-bold font-mono text-white uppercase tracking-wider mb-1">
              Stream Intercept
            </h4>
            <p className="text-[11px] text-zinc-500 leading-relaxed mb-5">
              The layout data thread is taking too long to load. Restoring view session...
            </p>

            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-[10px] font-mono font-semibold text-zinc-400 hover:text-white border border-zinc-800 bg-zinc-900/40 px-3.5 py-1.5 rounded-lg transition-all hover:border-zinc-700 active:scale-95"
            >
              <Home className="w-3 h-3 text-[#E50914]" /> Return Home
            </Link>
          </div>
        )}
      </div>

      {/* Frame Aesthetic Overlays */}
      <div className="absolute bottom-6 left-8 font-mono text-[8px] text-zinc-800 tracking-[0.2em] hidden sm:block">DATA_FEED_ACTIVE</div>
      <div className="absolute bottom-6 right-8 font-mono text-[8px] text-zinc-800 tracking-[0.2em] hidden sm:block">CINEBY_CORE</div>
    </div>
  );
}