export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] bg-[#05050A] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Subtle cinematic background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1F2937]/30 via-[#05050A] to-[#05050A] pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="relative w-24 h-24 flex items-center justify-center mb-8">
          {/* Outer rotating ring */}
          <div className="absolute inset-0 border-[3px] border-[#1F2937] rounded-full"></div>
          {/* Inner fast spinning arc */}
          <div className="absolute inset-0 border-[3px] border-transparent border-t-[#E50914] rounded-full animate-spin"></div>
        </div>
        
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#E50914] animate-pulse" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-[#E50914] animate-pulse" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-[#E50914] animate-pulse" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-xs font-mono text-gray-400 uppercase tracking-[0.3em]">Preparing Scene</span>
        </div>
      </div>
    </div>
  );
}
