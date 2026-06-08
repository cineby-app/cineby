// components/AdsterraAd.tsx
'use client';

import { useEffect, useRef } from 'react';

interface AdsterraAdProps {
  adKey: string;
  width: number;
  height: number;
  className?: string;
}

export function AdsterraAd({ adKey, width, height, className = '' }: AdsterraAdProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (scriptLoaded.current) return;

    const loadAd = () => {
      if (!containerRef.current) return;
      
      // Set up atOptions
      (window as any).atOptions = {
        key: adKey,
        format: 'iframe',
        height: height,
        width: width,
        params: {}
      };
      
      // Create and append script
      const script = document.createElement('script');
      script.src = `https://dessertaskingfund.com/${adKey}/invoke.js`;
      script.async = true;
      script.type = 'text/javascript';
      
      containerRef.current.appendChild(script);
      scriptLoaded.current = true;
    };

    loadAd();

    return () => {
      if (containerRef.current) {
        const scripts = containerRef.current.querySelectorAll('script');
        scripts.forEach(script => script.remove());
        scriptLoaded.current = false;
      }
    };
  }, [adKey, width, height]);

  return (
    <div 
      ref={containerRef}
      className={`adsterra-container ${className}`}
      style={{ 
        minWidth: width, 
        minHeight: height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    />
  );
}