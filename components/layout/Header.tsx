'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Send, Moon, Sun } from 'lucide-react';
import { SearchModal } from '@/components/search/SearchModal';

export const Header: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);

  // Sync theme with html class
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.remove('light');
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  }, [isDark]);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* Navbar never changes color - strictly deep black #000000 */}
      <header className="sticky top-0 z-40 h-16 w-full bg-[#000000] border-b border-white/5 px-4 sm:px-6 flex items-center justify-between gap-3 select-none">
        {/* Left: Real Logo Image from /logos.png (No toggle button here as requested) */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <img
              src="/logos.png"
              alt="AniNovuz"
              className="h-7 sm:h-8 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>
        </div>

        {/* Center: Search Button (only Search Icon + Shortcut Key as requested) */}
        <div className="flex-1 max-w-xs sm:max-w-sm mx-2">
          <button
            onClick={() => setIsSearchOpen(true)}
            type="button"
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#12141a] hover:bg-[#181a24] border border-white/10 text-gray-400 hover:text-gray-200 transition-all text-xs shadow-inner group"
            title="Qidiruv (Ctrl + K)"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors shrink-0" />
              <span className="hidden sm:inline text-xs text-gray-500 group-hover:text-gray-400">Qidirish...</span>
            </div>
            <kbd className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold text-gray-300 bg-black/60 border border-white/10 rounded-md">
              Ctrl + K
            </kbd>
          </button>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Telegram Channel Button */}
          <a
            href="https://t.me/aninov_uz"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#12141a] hover:bg-[#1a1d28] border border-white/10 text-xs font-semibold text-gray-300 hover:text-white transition-all shadow-sm"
          >
            <Send className="w-3.5 h-3.5 text-sky-400" />
            <span>Telegram</span>
          </a>

          {/* Dark / Light Toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            className="w-9 h-9 rounded-xl bg-[#12141a] hover:bg-[#1a1d28] border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all"
            aria-label="Mavzuni almashtirish"
            title={isDark ? "Kunduzgi rejim" : "Tungi rejim"}
          >
            {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Red Login Button */}
          <Link
            href="/auth/login"
            className="px-3.5 sm:px-4 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs sm:text-sm font-bold shadow-lg shadow-red-600/20 active:scale-95 transition-all"
          >
            Kirish
          </Link>
        </div>
      </header>

      {/* Global Live Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
