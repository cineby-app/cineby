// components/AdsterraAds.tsx
'use client';

import { AdsterraAd } from './AdsterraAd';

// Your ad keys
const ADS = {
  BANNER_300x250: '8162f7b8c34974f34a974b6e7ecfc56c',    // Rectangle
  BANNER_468x60: '745e2712b632a7e90737a12711a26228',     // Horizontal banner
  BANNER_160x300: 'f10dd5f554899b66a9d7eec5a58b49f7',    // Vertical banner
  BANNER_160x600: 'aa76f23698a22f4a9ec38a45157572c4',    // Skyscraper
  BANNER_320x50: '544daa93088c3c86f28ec10f4046a519',     // Mobile banner
};

// Responsive Top Banner (different sizes for different devices)
export function TopBannerAd() {
  return (
    <>
      {/* Mobile (320x50) */}
      <div className="block sm:hidden my-4">
        <AdsterraAd adKey={ADS.BANNER_320x50} width={320} height={50} />
      </div>
      
      {/* Tablet (468x60) */}
      <div className="hidden sm:block lg:hidden my-4">
        <AdsterraAd adKey={ADS.BANNER_468x60} width={468} height={60} />
      </div>
      
      {/* Desktop (728x90 - using 300x250 scaled or create new ad unit) */}
      <div className="hidden lg:block my-6">
        <AdsterraAd adKey={ADS.BANNER_468x60} width={728} height={90} />
      </div>
    </>
  );
}

// Sidebar Ad (300x250)
export function SidebarAd() {
  return (
    <div className="w-full mb-6 sticky top-24">
      <AdsterraAd adKey={ADS.BANNER_300x250} width={300} height={250} />
    </div>
  );
}

// Skyscraper Ad (160x600)
export function SkyscraperAd() {
  return (
    <div className="hidden lg:block w-full mb-6 sticky top-24">
      <AdsterraAd adKey={ADS.BANNER_160x600} width={160} height={600} />
    </div>
  );
}

// In-content Ad (responsive)
export function InContentAd() {
  return (
    <div className="w-full my-6 py-4 border-y border-[#1F2937]">
      <div className="flex justify-center">
        <AdsterraAd adKey={ADS.BANNER_468x60} width={468} height={60} />
      </div>
    </div>
  );
}

// Grid of 300x250 ads
export function AdGrid({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 my-6">
      {Array.from({ length: count }).map((_, i) => (
        <AdsterraAd key={i} adKey={ADS.BANNER_300x250} width={300} height={250} />
      ))}
    </div>
  );
}

// Vertical ad (160x600) for sidebar
export function VerticalSidebarAd() {
  return (
    <div className="hidden lg:block w-full mb-6">
      <AdsterraAd adKey={ADS.BANNER_160x600} width={160} height={600} />
    </div>
  );
}