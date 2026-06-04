'use client';

import { useState, useEffect } from 'react';
import { Link as LinkIcon, Check } from 'lucide-react';

export function CopyLinkButton() {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState('');

  useEffect(() => {
    let mounted = true;
    setTimeout(() => {
        if (mounted) setUrl(window.location.href);
    }, 0);
    return () => { mounted = false; };
  }, []);

  const handleCopy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <button 
      onClick={handleCopy}
      className="flex items-center gap-2 border border-[#1F2937] bg-[#0F0F1A]/50 backdrop-blur-sm px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white hover:border-[#E50914] transition-colors"
    >
      {copied ? <Check className="w-4 h-4 text-green-500" /> : <LinkIcon className="w-4 h-4" />}
      <span>{copied ? 'Copied' : 'Copy Link'}</span>
    </button>
  );
}
