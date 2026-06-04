import Link from 'next/link';
import Image from 'next/image';
import { Heart } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#05050A] border-t border-[#1F2937]/60 pt-15 pb-12 px-6 md:px-16 lg:px-24 mt-auto relative z-20">
      <div className="max-w-7xl mx-auto flex flex-col space-y-10">
        
        {/* Top Segment: Brand & Centralised Minimal Navigation */}
        <div className="flex flex-col lg:flex-row items-center lg:justify-between gap-8 pb-10 border-b border-[#1F2937]/30">
          
          {/* Brand Identity */}
          <div className="flex flex-col items-center lg:items-start space-y-3">
            <Link href="/" className="block shrink-0 group">
              <div className="relative w-36 h-10">
                <Image
                  src="/img/header-logo.png"
                  alt="Cineby Logo"
                  fill
                  className="object-contain object-center lg:object-left drop-shadow-[0_0_8px_rgba(181,0,0,0.4)] group-hover:drop-shadow-[0_0_15px_rgba(181,0,0,0.7)] transition-all duration-300"
                />
              </div>
            </Link>
            <p className="text-gray-400 text-xs text-center lg:text-left tracking-wide font-medium max-w-xs">
              Your premium destination for discovering amazing movies, curated collections, and cinematic insights.
            </p>
          </div>

          {/* Minimal Inline Navigation Menu */}
          <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs uppercase font-bold tracking-widest">
            {[
              { name: 'Home', href: '/' },
              { name: 'Movie Finder', href: '/finder' },
              { name: 'Library', href: '/library' },
              { name: 'Blog', href: '/blog' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-400 hover:text-white transition-all duration-300 relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#b50000] hover:after:w-full after:transition-all after:duration-300"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Premium Minimalist Social Handles */}
          <div className="flex items-center gap-2">
            {[
              { label: 'IG', href: '#', aria: 'Instagram' },
              { label: 'TW', href: '#', aria: 'Twitter' },
              { label: 'GH', href: '#', aria: 'GitHub' },
            ].map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.aria}
                className="w-8 h-8 rounded-md bg-[#0F0F1A] border border-[#1F2937] flex items-center justify-center text-[10px] font-mono font-bold text-gray-400 hover:text-white hover:border-[#b50000] hover:shadow-[0_0_10px_rgba(181,0,0,0.2)] transition-all duration-300"
              >
                {social.label}
              </a>
            ))}
          </div>

        </div>

        {/* Bottom Segment: Compliance, Copyright & Contact */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] font-medium tracking-wide text-gray-500">
          
          {/* Left: Copyright */}
          <div className="flex items-center gap-2 order-2 md:order-1">
            <span>© {currentYear} Cineby. All rights reserved.</span>
            <span className="hidden sm:inline text-gray-700">|</span>
            <span className="hidden sm:flex items-center gap-1 text-[10px] text-gray-600 uppercase tracking-wider">
              Made with <Heart className="w-2.5 h-2.5 text-[#b50000] fill-[#b50000]/20" /> for cinema lovers
            </span>
          </div>

          {/* Right: Legal Links & Support */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 order-1 md:order-2">
            <a href="mailto:support@cineby.app" className="hover:text-white transition-colors">Support</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>

        </div>

      </div>
    </footer>
  );
}