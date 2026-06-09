"use client";

import { useEffect, useState } from "react";
import { AdsterraAd } from "@/components/AdsterraAd";

const ADS = {
  BANNER_300x250: "8162f7b8c34974f34a974b6e7ecfc56c",
  BANNER_468x60: "745e2712b632a7e90737a12711a26228",
  BANNER_320x50: "544daa93088c3c86f28ec10f4046a519",
  BANNER_728x90: "60584ead4a4b3bc902dd117145425ef6",
};

export function BannerAd() {
  const [size, setSize] = useState<"mobile" | "tablet" | "desktop" | null>(null);

  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;

      if (width < 640) setSize("mobile");
      else if (width < 1024) setSize("tablet");
      else setSize("desktop");
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    return () => window.removeEventListener("resize", updateSize);
  }, []);

  if (!size) return null;

  const ad =
    size === "mobile"
      ? { key: ADS.BANNER_320x50, width: 320, height: 50 }
      : size === "tablet"
      ? { key: ADS.BANNER_468x60, width: 468, height: 60 }
      : { key: ADS.BANNER_728x90, width: 728, height: 90 };

  return (
    <div className="w-full my-6 py-4 overflow-hidden">
      <div className="flex justify-center px-2">
        <div className="max-w-full overflow-hidden rounded-xl border border-[#1F2937] bg-gradient-to-r from-[#0F0F1A] to-black p-2">
          <AdsterraAd
            key={`${ad.key}-${ad.width}-${ad.height}`}
            adKey={ad.key}
            width={ad.width}
            height={ad.height}
          />
        </div>
      </div>
    </div>
  );
}

export function RectangleAd() {
  return (
    <div className="w-full my-6 py-4 overflow-hidden">
      <div className="flex justify-center px-4">
        <div className="max-w-full overflow-hidden rounded-xl border border-[#1F2937] bg-gradient-to-r from-[#0F0F1A] to-black p-3">
          <AdsterraAd
            adKey={ADS.BANNER_300x250}
            width={300}
            height={250}
          />
        </div>
      </div>
    </div>
  );
}