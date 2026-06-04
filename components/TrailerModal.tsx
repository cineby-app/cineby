'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, X } from "lucide-react";
import { Video } from "@/lib/tmdb";

export function TrailerModal({ videos }: { videos: Video[] }) {
  const [isOpen, setIsOpen] = useState(false);

  const trailer =
    videos.find((v) => v.type === "Trailer" && v.site === "YouTube") ||
    videos.find((v) => v.site === "YouTube");

  // تجميد وقفل السكرول الخلفي للشاشة تماماً وبشكل ثابت فور الفتح
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // يمنع حدوث قفزة جانبية في بعض المتصفحات بسبب اختفاء شريط التمرير
      document.body.style.paddingRight = 'var(--removed-body-scroll-bar-size, 0px)';
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen]);

  if (!trailer) return null;

  return (
    <>
      {/* Watch Trailer Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-6 py-3 rounded-full font-bold uppercase tracking-wider text-sm transition-all shadow-xl bg-[#BE185D] text-white hover:bg-[#9D174D] border border-[#BE185D] group shrink-0"
      >
        <Play className="w-5 h-5 fill-current" />
        Watch Trailer
      </button>

      <AnimatePresence>
        {isOpen && (
          // الغطاء الخلفي الشامل والثابت فوق كل الكتل والأقسام بنسبة z-index مطلقة
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 w-screen h-screen z-[99999] flex items-center justify-center p-4 sm:p-8 bg-black/95 backdrop-blur-md overflow-hidden"
            onClick={() => setIsOpen(false)}
          >
            {/* حاوية الـ Iframe الممركزة تماماً في السنتر الهيكلي */}
            <motion.div
              initial={{ scale: 0.95, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(190,24,93,0.5),0_0_100px_rgba(0,0,0,0.8)] border border-[#BE185D]/40"
              onClick={(e) => e.stopPropagation()} // حظر الإغلاق عند النقر داخل إطار تريلر اليوتيوب
            >
              
              {/* زر الإغلاق X - ممركز ومثبت بشكل مطلق ومعزول داخلياً */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 z-[100000] w-11 h-11 bg-black/70 hover:bg-[#BE185D] text-white rounded-full flex items-center justify-center transition-all duration-300 border border-white/10 hover:border-[#BE185D] backdrop-blur-sm shadow-xl group/btn"
                aria-label="Close Trailer"
              >
                <X className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
              </button>

              {/* مشغل الفيديو الذكي */}
              <iframe
                src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0&showinfo=0&modestbranding=1`}
                title={trailer.name}
                className="w-full h-full border-none absolute inset-0 bg-black"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}