'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Home, Compass, BookOpen, Film, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setIsSearchModalOpen(false);
    setSearchQuery('');
  }, [pathname]);

  useEffect(() => {
    if (isSearchModalOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isSearchModalOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchModalOpen) {
        setIsSearchModalOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isSearchModalOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search/${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchModalOpen(false);
      setSearchQuery('');
      setIsOpen(false);
    }
  };

  const openSearchModal = () => setIsSearchModalOpen(true);
  const closeSearchModal = () => {
    setIsSearchModalOpen(false);
    setSearchQuery('');
  };

  const navLinks = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Match', href: '/match', icon: Compass },
    { name: 'Library', href: '/library', icon: Film },
    { name: 'Blog', href: '/blog', icon: BookOpen },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 ease-in-out ${
        isScrolled 
          ? 'bg-gradient-to-br from-[#0F0F1A]/95 to-black/95 backdrop-blur-md border-b border-[#1F2937] py-3' 
          : 'bg-gradient-to-b from-black/60 via-black/20 to-transparent py-5'
      }`}>
        {/* FIX: Changed from grid-cols-3 to flex justification layout */}
        <div className="max-w-7xl mx-auto px-6 md:px-8 flex items-center justify-between h-14 w-full">
          
          {/* Logo Container */}
          <div className="flex items-center justify-start h-full">
            <Link href="/" className="z-[110] flex items-center shrink-0 group">
              <div className={`relative w-32 h-10 md:w-40 md:h-12 transition-transform duration-500 ease-in-out origin-left ${
                isScrolled ? 'scale-85 md:scale-90' : 'scale-100'
              }`}>
                <Image
                  src="/img/header-logo.png"
                  alt="Cineby Logo"
                  fill
                  className="object-contain object-left drop-shadow-[0_0_8px_rgba(181,0,0,0.5)] group-hover:drop-shadow-[0_0_15px_rgba(181,0,0,0.8)] transition-all duration-300"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Navigation Links (Desktop) */}
          <div className="hidden lg:flex items-center justify-center gap-8 text-sm font-bold tracking-widest uppercase h-full mx-auto">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 group transition-all py-2 duration-300 relative ${
                    isActive ? 'text-white' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <Icon 
                    className="w-4 h-4 transition-all duration-300" 
                    style={{
                      color: isActive ? '#b50000' : 'currentColor',
                      filter: isActive ? 'drop-shadow(0 0 6px rgba(181,0,0,0.8))' : 'none'
                    }}
                  />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Action Elements - Permanently Aligned to the Right edge */}
          <div className="flex items-center justify-end gap-2 sm:gap-4 h-full">
            <button
              onClick={openSearchModal}
              className="hidden lg:block p-2 text-gray-300 hover:text-white transition-all duration-300 group"
              aria-label="Open search"
            >
              <Search className="w-5 h-5 transition-all duration-300 group-hover:scale-105" />
            </button>
            
            {/* Mobile Search Icon (Optional addition for instant viewport actions) */}
            <button
              onClick={openSearchModal}
              className="block lg:hidden p-2 text-gray-300 hover:text-white transition-colors"
              aria-label="Open mobile search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Mobile Toggle Trigger Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden text-white z-[110] p-2 pr-0"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Search Modal */}
      <AnimatePresence>
        {isSearchModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={closeSearchModal}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <form onSubmit={handleSearch} className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search for movies, TV shows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-5 md:py-6 bg-[#0F0F1A] border-2 border-[#1F2937] rounded-2xl text-white text-lg md:text-2xl font-bold tracking-wide focus:outline-none focus:border-[#b50000] transition-all placeholder-gray-500"
                  autoComplete="off"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-[#b50000] transition-colors"
                  aria-label="Submit search"
                >
                  <Search className="w-6 h-6 md:w-7 md:h-7" />
                </button>
              </form>
              <p className="text-center text-gray-500 text-sm mt-4">
                Press Enter to search or Esc to close
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[90] bg-[#05050A] bg-gradient-to-br from-[#0F0F1A] to-black flex flex-col items-center justify-center pt-20 pb-10 overflow-y-auto"
          >
            <div className="w-full max-w-sm px-6 mb-8">
            </div>
            <div className="flex flex-col gap-6 text-center px-6 w-full max-w-sm">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center justify-center gap-4 text-xl font-black tracking-widest uppercase transition-colors p-4 rounded-xl ${isActive ? 'bg-[#b50000]/10 text-white border border-[#b50000]' : 'text-gray-400 border border-transparent hover:border-[#1F2937] hover:bg-[#0F0F1A]'}`}
                  >
                    <Icon className={`w-6 h-6 ${isActive ? 'text-[#b50000]' : 'text-gray-500'}`} />
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}