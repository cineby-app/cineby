export default function Loading() {
  return (
    <div className="fixed inset-0 z-[99999] bg-[#030307] w-screen h-screen flex items-center justify-center m-0 p-0 overflow-hidden select-none left-0 top-0">
      
      {/* High-fidelity keyframe overrides injected right away for retro-lens flickering and smooth spin cycles */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes lensFlare {
          0%, 100% { opacity: 0.25; transform: scale(1); }
          50% { opacity: 0.55; transform: scale(1.08); }
        }
        @keyframes shutterSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes countFlicker {
          0%, 100% { opacity: 0.4; }
          45% { opacity: 0.9; }
          50% { opacity: 0.2; }
          55% { opacity: 0.85; }
        }
        .animate-lens-beam {
          animation: lensFlare 3s ease-in-out infinite;
        }
        .animate-shutter-reel {
          animation: shutterSpin 2.5s linear infinite;
        }
        .animate-frame-flicker {
          animation: countFlicker 0.18s linear infinite;
        }
      `}} />

      {/* Atmospheric Anamorphic Theater Projector Radiance */}
      <div className="absolute w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,rgba(181,0,0,0.18),rgba(181,0,0,0.03)_45%,transparent_70%)] pointer-events-none animate-lens-beam" />
      <div className="absolute w-72 h-72 bg-[#b50000]/5 rounded-full filter blur-[100px] pointer-events-none" />

      {/* LOADING STRUCTURE CONTAINER - LOCKED CENTERING VIA EXPANDED FLEX FRAME */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        
        {/* ================= PROJECTOR SHUTTER WHEEL ================= */}
        <div className="relative w-20 h-20 flex items-center justify-center mb-6">
          
          {/* External Celluloid Frame Housing */}
          <div className="absolute inset-0 border border-zinc-800/60 rounded-full bg-zinc-950/20 backdrop-blur-xs shadow-inner" />
          
          {/* Rotating Shutter Blade Component (8-Blade Mechanical Shutter Wheel SVG) */}
          <svg 
            className="w-14 h-14 text-[#b50000] drop-shadow-[0_0_12px_rgba(181,0,0,0.5)] animate-shutter-reel" 
            viewBox="0 0 24 24" 
            fill="currentColor"
          >
            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A2,2 0 0,1 14,6C14,6.74 13.6,7.39 13,7.75V11h3.25C16.61,10.4 17.26,10 18,10A2,2 0 0,1 20,12A2,2 0 0,1 18,14C17.26,14 16.61,13.6 16.25,13H13V16.25C13.6,16.61 14,17.26 14,18A2,2 0 0,1 12,20A2,2 0 0,1 10,18C10,17.26 10.4,16.61 11,16.25V13H7.75C7.39,13.6 6.74,14 6,14A2,2 0 0,1 4,12A2,2 0 0,1 6,10C6.74,10 7.39,10.4 7.75,11H11V7.75C10.4,7.39 10,6.74 10,6A2,2 0 0,1 12,4Z" />
          </svg>

          {/* Core Focal Center Lens Bead */}
          <div className="absolute w-2 h-2 rounded-full bg-white shadow-[0_0_10px_#fff]" />
        </div>

        {/* ================= FRAME METRICS READOUT ================= */}
        <div className="flex flex-col items-center justify-center gap-1.5">
          
          {/* Micro Frame Count Indicator */}
          <div className="font-mono text-[9px] text-zinc-600 tracking-[0.25em] uppercase flex items-center justify-center gap-1.5 animate-frame-flicker">
            {/* <span>[ RUN_PAYLOAD // 002 ]</span> */}
          </div>

          {/* Clean Cinematic Label */}
          <span className="text-xs font-mono text-zinc-300 uppercase tracking-[0.35em] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            Loading...
          </span>
        </div>
      </div>
      
      {/* Absolute Bottom Border Reel Track Simulation Line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-zinc-900/60 to-transparent border-t border-dashed border-zinc-800/40 pointer-events-none" />
    </div>
  );
}