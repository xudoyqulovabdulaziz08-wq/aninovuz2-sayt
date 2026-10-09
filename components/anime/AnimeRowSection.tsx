'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { AnimeBase } from '@/types/anime/anime.types';
import { AnimeCard } from './AnimeCard';

interface AnimeRowSectionProps {
  id?: string;
  title: string;
  items: AnimeBase[];
  viewAllLink?: string;
  badgeType?: 'HOT' | 'NEW' | 'AUTO';
}

export const AnimeRowSection: React.FC<AnimeRowSectionProps> = ({
  id,
  title,
  items,
  viewAllLink,
  badgeType,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Mouse drag-to-scroll states
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollStartLeft, setScrollStartLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsMouseDown(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollStartLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.4; // Scroll speed multiplier
    scrollRef.current.scrollLeft = scrollStartLeft - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsMouseDown(false);
  };

  const handleScrollBtn = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -420 : 420;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <section id={id} className="mb-7 relative group/section select-none">
      {/* Section Header: Title with thicker 3.5px vertical red line on the left as requested */}
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="border-l-[3.5px] border-red-600 pl-3 flex items-center">
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
            {title}
          </h2>
        </div>

        {viewAllLink && (
          <Link
            href={viewAllLink}
            className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-400 transition-colors"
          >
            <span>Barchasini ko'rish</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Horizontal Scrollable Container with Mouse Drag & Section-Hover Arrow Controls */}
      <div className="relative">
        {/* Left Arrow Button (Appears ONLY when hovering over this section) */}
        <button
          onClick={() => handleScrollBtn('left')}
          className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/85 hover:bg-red-600 border border-white/10 text-white items-center justify-center -translate-x-3 opacity-0 group-hover/section:opacity-100 transition-all duration-200 shadow-xl backdrop-blur-md active:scale-90"
          aria-label="Oldingi animelar"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Scroll Container with drag-to-scroll */}
        <div
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className={`flex items-start gap-3 sm:gap-4 overflow-x-auto no-scrollbar pb-2 pt-1 scroll-smooth ${
            isMouseDown ? 'cursor-grabbing select-none' : 'cursor-grab'
          }`}
        >
          {items.map((anime) => (
            <AnimeCard key={anime.anime_id} anime={anime} badgeType={badgeType} />
          ))}
        </div>

        {/* Right Arrow Button (Appears ONLY when hovering over this section) */}
        <button
          onClick={() => handleScrollBtn('right')}
          className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/85 hover:bg-red-600 border border-white/10 text-white items-center justify-center translate-x-3 opacity-0 group-hover/section:opacity-100 transition-all duration-200 shadow-xl backdrop-blur-md active:scale-90"
          aria-label="Keyingi animelar"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
};
