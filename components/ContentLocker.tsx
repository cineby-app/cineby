"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Play, Loader2, Lock, ShieldCheck, CheckCircle2 } from "lucide-react";
import Image from "next/image";

interface Offer {
  id: string;
  url: string;
  anchor: string;
  payout: number | string; // Assuming maybe something like this, but we'll sort based on what they give
  conversion?: string;
  name?: string;
  description?: string;
  amount?: string;
}

function fetchJSONP(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
    const script = document.createElement('script');
    const separator = url.indexOf('?') !== -1 ? '&' : '?';
    script.src = `${url}${separator}callback=${callbackName}`;
    
    (window as any)[callbackName] = (data: any) => {
      resolve(data);
      delete (window as any)[callbackName];
      document.body.removeChild(script);
    };
    
    script.onerror = () => {
      reject(new Error('JSONP fetch failed'));
      delete (window as any)[callbackName];
      document.body.removeChild(script);
    };
    
    document.body.appendChild(script);
  });
}

export function ContentLocker({ movieId, movieTitle, backdrop }: { movieId: number | string, movieTitle: string, backdrop?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoadingOffers, setIsLoadingOffers] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(900); // 15 minutes verification window
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const checkRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      
      const fetchOffers = async () => {
        try {
          const data = await fetchJSONP(
            "https://de6jvomfbm0af.cloudfront.net/public/offers/feed.php?user_id=431718&api_key=debf7e507c020456e1966116d44d1967&s1=&s2="
          );
          if (isMounted && data && Array.isArray(data)) {
            setOffers(data.slice(0, 2));
          }
        } catch (e) {
          console.error("Failed to load offers", e);
        } finally {
          if (isMounted) setIsLoadingOffers(false);
        }
      };

      if (offers.length === 0) {
        // Fetch runs in background
        fetchOffers();
      } else {
        // Simulate async state change
        setTimeout(() => { if(isMounted) setIsLoadingOffers(false) }, 0);
      }
      
      // Countdown timer
      setTimeout(() => { if(isMounted) setCountdown(900) }, 0); // reset countdown
      timerRef.current = setInterval(() => {
        setCountdown((c) => (c > 0 ? c - 1 : 0));
      }, 1000);
    } else {
      document.body.style.overflow = 'unset';
      if (timerRef.current) clearInterval(timerRef.current);
      if (checkRef.current) clearInterval(checkRef.current);
    }
    
    return () => {
      isMounted = false;
      document.body.style.overflow = 'unset';
      if (timerRef.current) clearInterval(timerRef.current);
      if (checkRef.current) clearInterval(checkRef.current);
    };
  }, [isOpen, offers.length]);

  const checkLeads = async () => {
    try {
      const leads = await fetchJSONP(
        "https://de6jvomfbm0af.cloudfront.net/public/external/check2.php?testing=0"
      );
      if (leads && leads.length > 0) {
        // Lead completed!
        if (checkRef.current) clearInterval(checkRef.current);
        window.location.assign(`https://cineby.sc/${movieId}`);
      }
    } catch (e) {
      console.error("Failed to check leads", e);
    }
  };

  const startVerification = (url: string) => {
    setIsVerifying(true);
    window.open(url, '_blank');
    
    // Start checking for leads every 15 seconds
    if (!checkRef.current) {
      checkRef.current = setInterval(checkLeads, 15000);
    }
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <button
        onClick={() => {
          setIsOpen(true);
          if (offers.length === 0) setIsLoadingOffers(true);
        }}
        className="flex items-center gap-3 px-8 py-4 rounded-full font-black uppercase tracking-widest text-sm transition-all shadow-xl bg-[#b50000] text-white hover:bg-red-600 hover:scale-105 active:scale-95"
      >
        <Play className="w-5 h-5 fill-current" />
        Watch Now
      </button>

      {mounted && isOpen && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 shadow-2xl">
          <div className="absolute inset-0 backdrop-blur-md" />
          
          <div className="relative w-full max-w-2xl max-h-[95vh] flex flex-col bg-[#05050A] border border-[#1F2937] rounded-3xl overflow-hidden shadow-2xl animate-fade-in-up">
            
            {/* Header / Backdrop */}
            <div className="relative h-44 sm:h-56 w-full bg-[#1F2937] shrink-0">
              {backdrop ? (
                <Image
                  src={`https://image.tmdb.org/t/p/w780${backdrop}`}
                  alt="Movie backdrop"
                  fill
                  className="object-cover opacity-40"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-[#05050A] to-transparent" />
              
              <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-mono font-bold text-red-500 animate-pulse uppercase tracking-wider">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                Valid for {formatTime(countdown)}
              </div>
              
              <div className="absolute bottom-6 left-6 pr-6">
                <div className="inline-flex items-center gap-2 bg-[#E50914] text-white text-xs font-bold px-2 py-1 rounded mb-2 uppercase tracking-widest">
                  <Lock className="w-3 h-3" />
                  Restricted Content
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight uppercase tracking-tight">
                  Verify you are not a bot & Watch in 4K
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  Complete ONE of the offers below to unlock full access to <span className="text-white font-bold">{movieTitle}</span>.
                </p>
              </div>
            </div>

            {/* Offers Body */}
            <div className="p-5 sm:p-8 overflow-y-auto flex-1">
              {isLoadingOffers ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="w-12 h-12 border-4 border-white/10 border-t-[#E50914] rounded-full animate-spin" />
                  <p className="text-sm font-mono text-gray-400 uppercase tracking-widest">Loading Offers...</p>
                </div>
              ) : offers.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-xs text-gray-500 font-mono tracking-widest uppercase text-center mb-6">
                    Select an Offer securely via Sponsor
                  </p>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {offers.map((offer, idx) => (
                      <button
                        key={offer.id || idx}
                        onClick={() => startVerification(offer.url)}
                        className="flex items-center justify-between p-4 rounded-xl border-2 border-[#1F2937] hover:border-[#E50914] bg-[#0F0F1A] hover:bg-[#1A1A24] transition-all group w-full text-left"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-[#1F2937] group-hover:bg-[#E50914]/20 flex items-center justify-center shrink-0">
                            <ShieldCheck className="w-5 h-5 text-gray-400 group-hover:text-[#E50914] transition-colors" />
                          </div>
                          <div>
                            <p className="text-base font-bold text-gray-200 group-hover:text-white transition-colors">
                              {offer.anchor || "Complete This Offer"}
                            </p>
                            {offer.conversion && (
                              <p className="text-xs text-gray-500 font-medium">
                                {offer.conversion}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-xs font-bold uppercase tracking-widest text-[#E50914] group-hover:bg-[#E50914] group-hover:text-white px-3 py-1.5 rounded-full border border-[#E50914] transition-colors hidden sm:block shrink-0">
                          Start
                        </div>
                      </button>
                    ))}
                  </div>

                  {isVerifying ? (
                    <div className="mt-8 bg-[#1F2937]/30 border border-[#1F2937] rounded-xl p-4 flex items-center gap-4">
                      <Loader2 className="w-6 h-6 text-[#E50914] animate-spin shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-white">Waiting for completion...</p>
                        <p className="text-xs text-gray-400">This page will automatically redirect once the offer is completed.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-green-500/50" />
                      Verification usually takes less than 2 minutes.
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-400 mb-4">No offers available in your region.</p>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:text-[#E50914]"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-[#0A0A12] border-t border-[#1F2937] p-4 flex items-center justify-between">
              <p className="text-[10px] text-gray-600 font-mono tracking-widest uppercase">
                Secure 256-bit Connection
              </p>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-xs text-gray-400 hover:text-white uppercase font-bold tracking-widest"
              >
                Cancel
              </button>
            </div>
            
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
