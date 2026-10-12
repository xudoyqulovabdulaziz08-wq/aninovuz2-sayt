'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, Send, User, Crown, LogOut, ChevronDown } from 'lucide-react';
import { SearchModal } from '@/components/search/SearchModal';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  isAuthPage?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isAuthPage = false }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
useEffect(() => {
    setIsMounted(true);
  }, []);
  // Close user menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      <header className="sticky top-0 z-40 h-16 w-full bg-[#000000] border-b border-white/5 px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-3 select-none">
        {/* Left: Real Logo Image from /logos.png */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 group">
            <img
              src="/logos.png"
              alt="AniNovuz"
              className="h-7 sm:h-8 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>
        </div>

        {/* Center: Desktop Input Bar vs Mobile/Tablet Icon-only Button */}
        <div className="flex items-center justify-end md:justify-center flex-1 max-w-sm mx-1 sm:mx-2">
          {/* Desktop Search Bar (Hidden on mobile/tablet) */}
          <button
            onClick={() => setIsSearchOpen(true)}
            type="button"
            className="hidden md:flex w-full items-center justify-between px-3 py-1.5 rounded-xl bg-[#12141a] hover:bg-[#181a24] border border-white/10 text-gray-400 hover:text-gray-200 transition-all text-xs shadow-inner group"
            title="Qidiruv (Ctrl + K)"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors shrink-0" />
              <span className="text-xs text-gray-500 group-hover:text-gray-400">Qidirish...</span>
            </div>
            <kbd className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold text-gray-300 bg-black/60 border border-white/10 rounded-md">
              Ctrl + K
            </kbd>
          </button>

          {/* Mobile/Tablet Single Search Icon Button (Hidden on desktop) */}
          <button
            onClick={() => setIsSearchOpen(true)}
            type="button"
            className="md:hidden w-9 h-9 rounded-xl bg-[#12141a] hover:bg-[#181a24] border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-all shadow-sm active:scale-95"
            title="Qidiruv"
            aria-label="Qidirish"
          >
            <Search className="w-4 h-4 text-red-500" />
          </button>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Telegram Channel Button */}
          <a
            href="https://t.me/Aninovuz"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#12141a] hover:bg-[#1a1d28] border border-white/10 text-xs font-semibold text-gray-300 hover:text-white transition-all shadow-sm"
          >
            <Send className="w-3.5 h-3.5 text-sky-400" />
            <span>Telegram</span>
          </a>

          {/* User Profile or Login Button */}
          {/* User Profile yoki Login tugmasi */}
        {isMounted && (
          user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#12141a] hover:bg-[#1a1d28] border border-white/10 text-gray-200 transition-all text-xs font-semibold cursor-pointer active:scale-95 shadow-sm"
              >
                <div className="w-6 h-6 rounded-lg bg-red-600/20 border border-red-600/30 flex items-center justify-center text-red-500 font-bold text-xs">
                  {user.username ? user.username.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
                </div>
                <span className="max-w-[100px] truncate text-xs">
                  {user.username ? `@${user.username.replace(/^@/, '')}` : `ID: ${user.userId}`}
                </span>
                {user.isVip && (
                  <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-black uppercase flex items-center gap-0.5">
                    <Crown className="w-2.5 h-2.5" />
                    VIP
                  </span>
                )}
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-[#0c0d12] border border-white/10 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 space-y-1">
                  <div className="px-3 py-2 border-b border-white/5 space-y-0.5">
                    <p className="text-xs font-bold text-gray-200 truncate">
                      {user.username ? `@${user.username.replace(/^@/, '')}` : `Foydalanuvchi #${user.userId}`}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      ID: {user.userId} • {user.points} ball
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-white hover:bg-red-600/20 transition-all cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Chiqish</span>
                  </button>
                </div>
              )}
            </div>
          ) : !isAuthPage ? (
            <Link
              href="/auth/login"
              className="px-3.5 sm:px-4 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs sm:text-sm font-bold shadow-lg shadow-red-600/20 active:scale-95 transition-all"
            >
              Kirish
            </Link>
          ) : null
        )}
        </div>
      </header>

      {/* Global Live Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
