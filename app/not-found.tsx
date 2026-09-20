import Link from 'next/link';
import { Home, Search } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 - Scene Not Found | Cineby',
  description: 'The page you are looking for has been cut from the final film.',
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#05050A] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Cinematic subtle background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1F2937]/20 via-[#05050A] to-[#05050A] pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl">
        <h1 className="text-8xl md:text-[150px] font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-600 tracking-tighter mix-blend-screen drop-shadow-2xl select-none">
          404
        </h1>
        
        <div className="mt-8 mb-4 inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-[#1F2937] bg-black/50 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-[#E50914] animate-pulse" />
          <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">Scene Missing</span>
        </div>

        <h2 className="text-2xl md:text-4xl font-bold text-white mb-6 uppercase tracking-tight">
          Lost in the Archives
        </h2>
        
        <p className="text-gray-400 mb-12 text-sm md:text-base leading-relaxed max-w-md">
          The movie or page you&apos;re searching for seems to have been left on the cutting room floor. Let&apos;s get you back on set.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link 
            href="/"
            className="flex items-center justify-center gap-2 bg-[#E50914] text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors active:scale-95"
          >
            <Home className="w-5 h-5" />
            <span>Return Home</span>
          </Link>
          
          <Link 
            href="/search"
            className="flex items-center justify-center gap-2 bg-transparent border-2 border-[#1F2937] text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest hover:border-gray-500 transition-colors active:scale-95"
          >
            <Search className="w-5 h-5" />
            <span>Search Movies</span>
          </Link>
        </div>
      </div>

      {/* Film strip decorative elements */}
      <div className="absolute left-4 top-0 bottom-0 w-8 flex flex-col justify-around opacity-10 pointer-events-none hidden md:flex">
         {[...Array(10)].map((_, i) => (
            <div key={`l-${i}`} className="w-6 h-4 bg-white rounded-sm" />
         ))}
      </div>
      <div className="absolute right-4 top-0 bottom-0 w-8 flex flex-col justify-around opacity-10 pointer-events-none hidden md:flex">
         {[...Array(10)].map((_, i) => (
            <div key={`r-${i}`} className="w-6 h-4 bg-white rounded-sm" />
         ))}
      </div>
    </div>
  );
}
