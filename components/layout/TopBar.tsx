"use client";

import { Facebook, Instagram, Linkedin, Youtube, Mail, PhoneCall } from "lucide-react";

export function TopBar() {
  const formatted = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="w-full bg-[#111111] text-white text-[11px] font-sans border-b border-neutral-800">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-8 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-neutral-300 font-normal">{formatted}</span>
        </div>

        <div className="flex items-center space-x-3 text-neutral-300 text-xs">
          <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-blue-500 transition-colors" aria-label="Facebook">
            <Facebook className="w-3.5 h-3.5" />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-neutral-100 transition-colors" aria-label="X (Twitter)">
            <span className="font-bold text-xs font-sans">𝕏</span>
          </a>
          <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-pink-500 transition-colors" aria-label="Instagram">
            <Instagram className="w-3.5 h-3.5" />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-blue-400 transition-colors" aria-label="LinkedIn">
            <Linkedin className="w-3.5 h-3.5" />
          </a>
          <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-red-600 transition-colors" aria-label="YouTube">
            <Youtube className="w-3.5 h-3.5" />
          </a>
          <a href="mailto:info@lawsforum.com" className="hover:text-amber-400 transition-colors" aria-label="Email">
            <Mail className="w-3.5 h-3.5" />
          </a>
          <a href="https://wa.me" target="_blank" rel="noreferrer" className="hover:text-emerald-500 transition-colors" aria-label="WhatsApp">
            <PhoneCall className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
