'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Tv,
  Tags,
  Mic2,
  Flame,
  Trophy,
  Shuffle,
  Sparkles,
  Heart,
  History,
  Settings,
  Bot ,
  ChevronLeft,
  MessageCircle,
  Bell,
  Star
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const pathname = usePathname();

  const mainLinks = [
    { label: 'Bosh sahifa', href: '/', icon: Home },
    { label: 'Animelar', href: '/anime', icon: Tv },
    { label: 'Janrlar', href: '/genres', icon: Tags  },
    { label: 'Dubberlar', href: '/dubbers', icon: Mic2 },
  ];

  const collectionLinks = [
    { label: 'Trenddagi animelar', href: '/#popular', icon: Flame },
    { label: 'Eng yaxshi animelar', href: '/#top-rated', icon: Trophy },
    { label: 'Tasodifiy animelar', href: '/#random', icon: Shuffle },
    { label: 'Yangi animelar', href: '/#latest', icon: Sparkles },
  ];

  const userLinks = [
    { label: 'Sevimliklarim', href: '/user/favorites', icon: Heart },
    {label: 'Obunalarim', href: '/user/subscriptions', icon: Bell  },
    {label: 'Sharhlarim', href: '/user/comments', icon: MessageCircle  },
    { label: 'Baholarim', href: '/user/ratings', icon: Star  },
    { label: 'Tarix', href: '/user/history', icon: History },
    { label: 'Sozlamalar', href: '/user/settings', icon: Settings },
  ];

  const isLinkActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const navContent = (
    <div className="flex flex-col h-full justify-between gap-4 p-3.5 bg-[#000000]">
      <div className="space-y-4">
        {/* Top Header: "NAVIGATSIYA" + Red Box Toggle Button (as in user screenshot) */}
        <div className="flex items-center justify-between px-1 pb-1">
          <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">
            NAVIGATSIYA
          </span>
          <button
            onClick={onToggle}
            className="w-7 h-7 rounded-lg bg-red-600/15 hover:bg-red-600 border border-red-600/40 text-red-500 hover:text-white flex items-center justify-center transition-all shadow-sm active:scale-95"
            title="Sidebarni yopish (Klaviaturada: [)"
            aria-label="Sidebarni yopish"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Main Menu Section + Horizontal Divider as in screenshot */}
        <div className="space-y-1 pb-4 border-b border-white/10">
          {mainLinks.map((item) => {
            const Icon = item.icon;
            const active = isLinkActive(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  active
                    ? 'bg-red-600/15 text-red-500 border border-red-600/30 shadow-sm'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-red-500' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* 2. Collections Section + Horizontal Divider as in screenshot */}
        <div className="pb-4 border-b border-white/10">
          <h4 className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
            KOLLEKSIYALAR
          </h4>
          <div className="space-y-1">
            {collectionLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium text-gray-400 hover:text-gray-200 hover:bg-white/5 transition-all"
                >
                  <Icon className="w-4 h-4 text-gray-400" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* 3. User Section */}
        <div className="pb-2">
          <h4 className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
            FOYDALANUVCHI
          </h4>
          <div className="space-y-1">
            {userLinks.map((item) => {
              const Icon = item.icon;
              const active = isLinkActive(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    active
                      ? 'bg-red-600/15 text-red-500 border border-red-600/30'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4 text-gray-400" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Telegram Bot Promo Card */}
      <div className="rounded-2xl bg-gradient-to-br from-[#12141c] to-[#0a0a0e] border border-white/10 p-3.5 relative overflow-hidden shadow-lg mt-auto">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-xs font-black text-white">
            An<span className="text-red-600">I</span>novuz
          </span>
          <span className="text-[10px] font-medium text-gray-400">Telegram Bot</span>
        </div>
        <p className="text-[10px] text-gray-400 leading-relaxed mb-2.5">
          Yangi animelar va qiziqarli funksiyalar botda!
        </p>
        <a
          href="https://t.me/aninov_uz_bot"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600 border border-red-600/30 text-red-400 hover:text-white text-xs font-bold transition-all shadow-sm group"
        >
          <Bot  className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          <span>Botga o'tish</span>
        </a>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Collapsible Sidebar */}
      <aside
        className={`hidden lg:block shrink-0 sticky top-16 h-[calc(100vh-4rem)] border-r border-white/5 overflow-y-auto no-scrollbar bg-[#000000] transition-all duration-300 ease-in-out ${
          isOpen ? 'w-56 opacity-100' : 'w-0 opacity-0 overflow-hidden border-none pointer-events-none'
        }`}
      >
        <div className="w-56 h-full">
          {navContent}
        </div>
      </aside>

      {/* Mobile Drawer Sidebar */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden bg-black/80 backdrop-blur-sm animate-in fade-in"
          onClick={onToggle}
        >
          <div
            className="w-60 h-full bg-[#000000] border-r border-white/10 overflow-y-auto p-1"
            onClick={(e) => e.stopPropagation()}
          >
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};