"use client";

import { useEffect, useState } from "react";
import { Share2, Link2, Check, Linkedin, Facebook, Twitter } from "lucide-react";

const SSR_FALLBACK_URL = "https://lawsforum.com";

export function ShareButtons({ title, url }: { title: string; url?: string }) {
  const [copied, setCopied] = useState(false);
  // Reading window.location during the initial render would make the server-
  // rendered HTML (no window, always SSR_FALLBACK_URL) disagree with the
  // client's first paint (real window.location.href) -> hydration mismatch
  // (React #418/#425) on every post page. Render the same fallback on both
  // passes, then correct to the real URL client-side after hydration.
  const [currentUrl, setCurrentUrl] = useState(url || SSR_FALLBACK_URL);
  useEffect(() => {
    if (!url) setCurrentUrl(window.location.href);
  }, [url]);

  const copyToClipboard = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="flex flex-wrap items-center gap-2 font-sans text-xs">
      <span className="font-bold text-slate-700 flex items-center gap-1 uppercase tracking-wider text-[11px] mr-1">
        <Share2 className="w-3.5 h-3.5 text-crimson-800" /> Share:
      </span>

      <a href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-800 px-3 py-1.5 rounded transition-colors" aria-label="Share on X">
        <Twitter className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Post</span>
      </a>

      <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1.5 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 px-3 py-1.5 rounded transition-colors" aria-label="Share on LinkedIn">
        <Linkedin className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">LinkedIn</span>
      </a>

      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1.5 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 px-3 py-1.5 rounded transition-colors" aria-label="Share on Facebook">
        <Facebook className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Facebook</span>
      </a>

      <button onClick={copyToClipboard} className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded transition-colors" aria-label="Copy Link">
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-emerald-600 font-semibold">Copied!</span>
          </>
        ) : (
          <>
            <Link2 className="w-3.5 h-3.5" />
            <span>Copy</span>
          </>
        )}
      </button>
    </div>
  );
}
