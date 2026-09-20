'use client';

import { useEffect, useRef } from 'react';
import { AdsterraAd } from './AdsterraAd';

interface AdContainerProps {
  adKey: string;
}

export function AdContainer({ adKey }: AdContainerProps) {
  const mountedRef = useRef(false);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    // Find all ad placeholders
    const placeholders = document.querySelectorAll('.ad-placeholder');
    
    placeholders.forEach((placeholder, index) => {
      // Create the ad wrapper
      const wrapper = document.createElement('div');
      wrapper.className = 'my-8 flex flex-col items-center';
      wrapper.innerHTML = `
        <div class="bg-gradient-to-br from-[#0F0F1A] to-black rounded-xl border border-[#1F2937] p-3 max-w-[300px]">
          <div class="text-[8px] text-gray-500 uppercase tracking-widest mb-2 text-center">— Sponsored Content —</div>
          <div id="adsterra-ad-${index}"></div>
        </div>
      `;
      
      // Replace placeholder with wrapper
      placeholder.parentNode?.replaceChild(wrapper, placeholder);
    });

    // After a small delay to ensure DOM is ready, load Adsterra ads
    const timer = setTimeout(() => {
      // This assumes AdsterraAd component loads its script when rendered
      // You might need to trigger the ad loading here
      const adContainers = document.querySelectorAll('[id^="adsterra-ad-"]');
      adContainers.forEach((container) => {
        // Your Adsterra initialization code here
        // For example, if Adsterra uses a global function:
        // if (window.__adsterra__) {
        //   window.__adsterra__.init(container.id, adKey);
        // }
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [adKey]);

  // Return null - this component just handles the DOM manipulation
  return null;
}