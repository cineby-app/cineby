// components/AdsterraAd.tsx
"use client";

import { useEffect, useRef } from "react";

interface AdsterraAdProps {
  adKey: string;
  width: number;
  height: number;
  className?: string;
}

export function AdsterraAd({
  adKey,
  width,
  height,
  className = "",
}: AdsterraAdProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !adKey) return;

    container.innerHTML = "";

    const atOptionsScript = document.createElement("script");
    atOptionsScript.type = "text/javascript";
    atOptionsScript.innerHTML = `
      atOptions = {
        key: '${adKey}',
        format: 'iframe',
        height: ${height},
        width: ${width},
        params: {}
      };
    `;

    const invokeScript = document.createElement("script");
    invokeScript.type = "text/javascript";
    invokeScript.async = true;
    invokeScript.src = `https://dessertaskingfund.com/${adKey}/invoke.js`;

    container.appendChild(atOptionsScript);
    container.appendChild(invokeScript);

    return () => {
      container.innerHTML = "";
    };
  }, [adKey, width, height]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width,
        height,
        maxWidth: "100%",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    />
  );
}