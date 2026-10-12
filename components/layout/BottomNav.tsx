'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, Tag, Mic } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Bosh sahifa', href: '/', icon: Home },
    { label: 'Animelar', href: '/animes', icon: LayoutGrid },
    { label: 'Janrlar', href: '/genres', icon: Tag },
    { label: 'Dubberlar', href: '/dubbers', icon: Mic },
  ];

  const isLinkActive = (href: string) => {
    if (href === '/') return pathname === '/';
    if (href === '/animes') return pathname === '/animes' || pathname.startsWith('/anime/');
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-[#000000] border-t border-white/10 h-16 select-none shadow-[0_-4px_20px_rgba(0,0,0,0.8)]">
      <div className="grid grid-cols-4 h-full max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isLinkActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              draggable={false}
              className={`relative flex flex-col items-center justify-center gap-1 h-full transition-all cursor-pointer ${
                active
                  ? 'bg-gradient-to-b from-red-600/15 via-[#0e1017] to-[#000000] rounded-t-xl border-t-2 border-red-600'
                  : 'text-gray-400 hover:text-gray-200 border-t-2 border-transparent'
              }`}
            >
              {/* Active subtle top glow effect */}
              {active && (
                <div className="absolute -top-[2px] left-1/4 right-1/4 h-[2px] bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.9)]" />
              )}

              <Icon
                className={`w-5 h-5 transition-transform duration-200 ${
                  active ? 'text-red-500 scale-105' : 'text-gray-400'
                }`}
              />
              <span
                className={`text-[10px] tracking-tight transition-colors ${
                  active ? 'font-bold text-red-500' : 'font-medium text-gray-400'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

