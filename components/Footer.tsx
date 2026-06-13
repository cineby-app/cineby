'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [showToast, setShowToast] = useState(false);

  const handleShare = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title || 'Cineby - Movie Database');
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
        break;
      case 'instagram':
        navigator.clipboard.writeText(window.location.href);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
        return;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${url}&text=${title}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${title}%20${url}`;
        break;
      case 'reddit':
        shareUrl = `https://reddit.com/submit?url=${url}&title=${title}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      default:
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
    }
  };

  return (
    <footer className="w-full bg-[#05050A] border-t border-[#1F2937]/60 pt-12 pb-12 px-6 md:px-16 lg:px-24 mt-auto relative z-20">
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
              Stream your favorite movies and trending TV shows in stunning Ultra HD quality. No sign-up required
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

          {/* Social Share Buttons with SVG Icons */}
          <div className="flex flex-col items-center lg:items-end gap-3">
            <div className="flex items-center gap-2">
              {/* Facebook */}
              <button
                onClick={() => handleShare('facebook')}
                className="group w-9 h-9 rounded-lg bg-[#0F0F1A] border border-[#1F2937] flex items-center justify-center transition-all duration-300 hover:border-[#1877F2] hover:shadow-lg hover:shadow-[#1877F2]/20"
                aria-label="Share on Facebook"
              >
                <svg className="w-4 h-4 text-gray-400 group-hover:text-[#1877F2] transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12z"/>
                </svg>
              </button>
              
              {/* Twitter */}
              <button
                onClick={() => handleShare('twitter')}
                className="group w-9 h-9 rounded-lg bg-[#0F0F1A] border border-[#1F2937] flex items-center justify-center transition-all duration-300 hover:border-[#1DA1F2] hover:shadow-lg hover:shadow-[#1DA1F2]/20"
                aria-label="Share on Twitter"
              >
                <svg className="w-4 h-4 text-gray-400 group-hover:text-[#1DA1F2] transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0021.674-11.79c0-.214-.005-.428-.015-.642a9.936 9.936 0 002.44-2.524z"/>
                </svg>
              </button>
              
              {/* Instagram */}
              <button
                onClick={() => handleShare('instagram')}
                className="group w-9 h-9 rounded-lg bg-[#0F0F1A] border border-[#1F2937] flex items-center justify-center transition-all duration-300 hover:border-[#E4405F] hover:shadow-lg hover:shadow-[#E4405F]/20"
                aria-label="Share on Instagram"
              >
                <svg className="w-4 h-4 text-gray-400 group-hover:text-[#E4405F] transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.265.058-1.645.069-4.85.069-3.204 0-3.584-.012-4.85-.069-3.252-.149-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85 0-3.204.012-3.584.069-4.849.149-3.225 1.664-4.771 4.919-4.919 1.265-.058 1.645-.069 4.85-.069zM12 0C8.74 0 8.332.015 7.052.072 2.687.276.276 2.687.072 7.052.015 8.332 0 8.74 0 12c0 3.26.015 3.668.072 4.948.204 4.365 2.615 6.776 6.98 6.98 1.28.057 1.688.072 4.948.072 3.26 0 3.668-.015 4.948-.072 4.365-.204 6.776-2.615 6.98-6.98.057-1.28.072-1.688.072-4.948 0-3.26-.015-3.668-.072-4.948-.204-4.365-2.615-6.776-6.98-6.98C15.668.015 15.26 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </button>
              
              {/* Telegram */}
              <button
                onClick={() => handleShare('telegram')}
                className="group w-9 h-9 rounded-lg bg-[#0F0F1A] border border-[#1F2937] flex items-center justify-center transition-all duration-300 hover:border-[#26A5E4] hover:shadow-lg hover:shadow-[#26A5E4]/20"
                aria-label="Share on Telegram"
              >
                <svg className="w-4 h-4 text-gray-400 group-hover:text-[#26A5E4] transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.06-.2-.07-.06-.18-.04-.26-.02-.12.03-1.96 1.24-5.53 3.66-.52.36-.99.53-1.41.52-.46-.01-1.36-.26-2.02-.48-.82-.27-1.47-.42-1.42-.88.03-.25.37-.5.98-.77 3.86-1.68 6.44-2.79 7.75-3.32 3.69-1.5 4.45-1.76 4.95-1.77.11 0 .36.03.52.2.14.14.18.32.2.53-.01.1-.01.2-.02.31z"/>
                </svg>
              </button>
              
              {/* WhatsApp */}
              <button
                onClick={() => handleShare('whatsapp')}
                className="group w-9 h-9 rounded-lg bg-[#0F0F1A] border border-[#1F2937] flex items-center justify-center transition-all duration-300 hover:border-[#25D366] hover:shadow-lg hover:shadow-[#25D366]/20"
                aria-label="Share on WhatsApp"
              >
                <svg className="w-4 h-4 text-gray-400 group-hover:text-[#25D366] transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.032 2.008c-5.522.004-10 4.48-10 10 0 1.79.474 3.47 1.303 4.924L2 21.99l5.21-1.176c1.38.738 2.97 1.158 4.658 1.164h.004c5.52 0 10-4.476 10-10s-4.476-10-10-10zm0 18.405c-1.506-.004-2.986-.403-4.294-1.154l-.308-.183-3.102.7.767-2.933-.175-.31c-.851-1.358-1.314-2.938-1.314-4.618 0-4.607 3.752-8.358 8.36-8.358 4.605 0 8.357 3.752 8.357 8.358s-3.75 8.358-8.358 8.358z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Segment: Compliance, Copyright & Contact */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] font-medium tracking-wide text-gray-500">
          
          {/* Left: Copyright */}
          <div className="flex items-center gap-2 order-2 md:order-1">
            <span>© {currentYear} Cineby. All rights reserved.</span>
            <span className="hidden sm:inline text-gray-700">|</span>
            <span className="hidden sm:flex items-center gap-1 text-[10px] text-gray-600 uppercase tracking-wider">
              Made with 
              <svg className="w-2.5 h-2.5 text-[#b50000] fill-[#b50000]/20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              for cinema lovers
            </span>
          </div>

          {/* Right: Legal Links & Support */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 order-1 md:order-2">
            <a href="/about" className="hover:text-white transition-colors">About Us</a>
            <a href="/contact" className="hover:text-white transition-colors">Contact</a>
            <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-white transition-colors">Terms</a>
            <a href="/cookies" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>

      {/* Toast Notification for Instagram Share */}
      {showToast && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 animate-fadeInUp">
          <div className="bg-[#0F0F1A] border border-[#E50914] rounded-lg px-4 py-2 shadow-lg shadow-[#E50914]/20">
            <p className="text-white text-xs flex items-center gap-2">
              <svg className="w-4 h-4 text-[#E50914]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Link copied to clipboard! Share it on Instagram.
            </p>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translate(-50%, 20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.3s ease-out;
        }
      `}</style>
    </footer>
  );
}