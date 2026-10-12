'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Play, Star, ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import { AnimeBase } from '@/types/anime/anime.types';

interface HeroSliderProps {
  items: AnimeBase[];
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ items }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const sideListRef = useRef<HTMLDivElement>(null);

  const handleNext = useCallback(() => {
    if (!items || items.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items]);

  const handlePrev = useCallback(() => {
    if (!items || items.length === 0) return;
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  }, [items]);

  // Auto slide interval (7 seconds)
  useEffect(() => {
    if (!items || items.length <= 1) return;
    const interval = setInterval(handleNext, 7000);
    return () => clearInterval(interval);
  }, [items, handleNext]);

  // Auto scroll side list to active item in desktop
  useEffect(() => {
    const container = sideListRef.current;
    if (!container) return;

    const activeBtn = container.children[currentIndex] as HTMLElement;
    if (!activeBtn) return;

    const containerRect = container.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();

    if (btnRect.top < containerRect.top) {
      container.scrollBy({
        top: btnRect.top - containerRect.top,
        behavior: 'smooth',
      });
    } else if (btnRect.bottom > containerRect.bottom) {
      container.scrollBy({
        top: btnRect.bottom - containerRect.bottom,
        behavior: 'smooth',
      });
    }
  }, [currentIndex]);

  // Keyboard navigation: ArrowLeft and ArrowRight
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext]);

  if (!items || items.length === 0) return null;

  const current = items[currentIndex];

  const rawRating = Number(current.average_rating || 0);
  const ratingText = rawRating > 0 ? rawRating.toFixed(1) : '0';
  const typeAnime = current.type || 'TV SERIES';

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-[#0a0a0c] border border-white/5 shadow-2xl mb-8 select-none">
      
      {/* ========================================================================= */}
      {/* 1. MOBILE & TABLET BANNER (hidden on lg and up) */}
      {/* Poster occupies full background, text/details overlaid on top, compact rating on top-right */}
      {/* ========================================================================= */}
      <div className="relative lg:hidden w-full min-h-[440px] sm:min-h-[480px] flex flex-col justify-end p-4 sm:p-6 overflow-hidden">
        {/* Full-bleed Background Poster */}
        {current.poster_r2_url && (
          <img
            src={current.poster_r2_url}
            alt={current.title_uz || current.title_en}
            className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none transition-all duration-700"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80';
            }}
          />
        )}

        {/* Dark Gradient Overlay over image */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/85 to-black/35 pointer-events-none" />

        {/* Compact Rating in Top-Right Corner (Does not block long titles) */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-black/75 backdrop-blur-md border border-white/10 shadow-lg text-amber-400 font-bold text-xs">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{ratingText}</span>
          <span className="text-[10px] text-gray-400 font-normal ml-0.5">
            ({rawRating > 0 ? (rawRating - 0.2 > 0 ? (rawRating - 0.2).toFixed(1) : '8.8') : '0'})
          </span>
        </div>

        {/* Content Overlaid on top of image */}
        <div className="relative z-10 space-y-2.5">
          {/* HOT Badge */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-600 text-white text-[10px] font-black uppercase tracking-wide shadow-sm">
              <Flame className="w-2.5 h-2.5 fill-white" />
              HOT
            </span>
          </div>

          {/* Anime Title */}
          <h1
            className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-tight line-clamp-2"
            title={current.title_uz || current.title_en}
          >
            {current.title_uz || current.title_en}
          </h1>

          {/* Meta Info Row */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-300 font-medium">
            <span className="px-1.5 py-0.5 rounded bg-red-600/20 text-red-400 font-bold border border-red-600/30 text-[10px]">
              {current.year || 2026}
            </span>
            <span>•</span>
            <span className="text-gray-300 truncate max-w-[200px]">
              {current.genres && current.genres.length > 0 ? current.genres.join(', ') : 'Anime, Fantaziya'}
            </span>
            <span>•</span>
            <span>{current.episodes_count ? `${current.episodes_count} qism` : '12 qism'}</span>
            <span>•</span>
            <span>24m</span>
            <span>•</span>
            <span className="text-amber-400 font-semibold">{typeAnime}</span>
          </div>

          {/* Description */}
          <p className="text-xs text-gray-300/90 leading-relaxed line-clamp-2 sm:line-clamp-3">
            {current.description ||
              `Anime markazida "Baloq'at yoshi sindromi" deb nomlanuvchi sirli g'ayritabiiy hodisa turadi. Ushbu sindrom o'smirlarning ruhiy siqilishlari sababli g'alati holatlar yuz berishiga olib keladi.`}
          </p>

          {/* Tomosha Qilish Button */}
          <div className="pt-1">
            <Link
              href={`/anime/${current.anime_id}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-red-600/30 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              Tomosha qilish
            </Link>
          </div>

          {/* Bottom Dots & Arrow Controls for Mobile */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            {/* Dots */}
            <div className="flex items-center gap-1.5">
              {items.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    currentIndex === idx ? 'w-5 bg-red-600' : 'w-1.5 bg-gray-600 hover:bg-gray-400'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Arrows */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrev}
                className="w-7 h-7 rounded-full bg-black/80 hover:bg-red-600 border border-white/10 text-gray-300 hover:text-white flex items-center justify-center transition-all active:scale-90"
                aria-label="Oldingi"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleNext}
                className="w-7 h-7 rounded-full bg-black/80 hover:bg-red-600 border border-white/10 text-gray-300 hover:text-white flex items-center justify-center transition-all active:scale-90"
                aria-label="Keyingi"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DESKTOP BANNER (3-Column layout on lg and up) */}
      {/* ========================================================================= */}
      <div className="hidden lg:flex relative z-10 w-full flex-row items-stretch gap-6 min-h-[360px] p-5">
        {/* Deep Dark Ambient Glow */}
        {current.poster_r2_url && (
          <div
            className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-10 scale-110 pointer-events-none transition-all duration-1000"
            style={{ backgroundImage: `url(${current.poster_r2_url})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-[#0a0a0c] pointer-events-none" />

        {/* 1. LEFT COLUMN: Main Poster */}
        <div className="relative w-52 md:w-56 aspect-[3/4] rounded-xl overflow-hidden shadow-2xl shrink-0 border border-white/10 group z-10">
          <img
            src={current.poster_r2_url}
            alt={current.title_uz || current.title_en}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 pointer-events-none"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-40" />
        </div>

        {/* 2. CENTER COLUMN: Details, Description, Tomosha Qilish & Dots */}
        <div className="flex-1 flex flex-col justify-between min-w-0 py-1 z-10">
          <div className="space-y-3">
            {/* Top row: HOT badge + Rating box on top right */}
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2 min-w-0 flex-1">
                {/* HOT Badge */}
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-red-600 text-white text-[11px] font-black tracking-wide shadow-sm uppercase">
                  <Flame className="w-3 h-3 fill-white" />
                  HOT
                </span>

                {/* Anime Name */}
                <h1
                  className="text-2xl md:text-3xl font-extrabold text-white tracking-tight truncate max-w-lg"
                  title={current.title_uz || current.title_en}
                >
                  {current.title_uz || current.title_en}
                </h1>
              </div>

              {/* Compact REYTING Box in Top Right */}
              <div className="shrink-0 flex flex-col items-center justify-center px-3 py-1.5 rounded-xl bg-[#12141c]/90 border border-white/10 shadow-lg">
                <div className="flex items-center gap-1 text-amber-400 font-black text-base">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{ratingText}</span>
                </div>
                <div className="text-[10px] font-bold text-gray-400 mt-0.5">
                  <span className="text-amber-400">IMDb</span> {rawRating > 0 ? (rawRating - 0.2 > 0 ? (rawRating - 0.2).toFixed(1) : '8.8') : '0'}
                </div>
              </div>
            </div>

            {/* Meta Row */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-300 font-medium">
              <span className="px-2 py-0.5 rounded bg-red-600/20 text-red-400 font-bold border border-red-600/30">
                {current.year || 2026}
              </span>
              <span>•</span>
              <span className="text-gray-300 truncate max-w-[240px]">
                {current.genres && current.genres.length > 0 ? current.genres.join(', ') : 'Anime, Fantaziya'}
              </span>
              <span>•</span>
              <span>{current.episodes_count ? `${current.episodes_count} qism` : '12 qism'}</span>
              <span>•</span>
              <span>24m</span>
              <span>•</span>
              <span className="text-amber-400 font-semibold">{typeAnime}</span>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed line-clamp-3 max-w-xl">
              {current.description ||
                `Anime markazida "Baloq'at yoshi sindromi" deb nomlanuvchi sirli g'ayritabiiy hodisa turadi. Ushbu sindrom o'smirlarning ruhiy siqilishlari sababli g'alati holatlar yuz berishiga olib keladi.`}
            </p>
          </div>

          {/* Bottom Action: Tomosha qilish + Dots */}
          <div className="space-y-4 pt-2">
            <div>
              <Link
                href={`/anime/${current.anime_id}`}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-red-600/30 active:scale-95 transition-all"
              >
                <Play className="w-4 h-4 fill-white" />
                Tomosha qilish
              </Link>
            </div>

            {/* Dots */}
            <div className="flex items-center gap-1.5 pt-1">
              {items.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    currentIndex === idx ? 'w-5 bg-red-600' : 'w-1.5 bg-gray-700 hover:bg-gray-400'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 3. RIGHT COLUMN: Side Anime List (1 to 10 Scrollable) + Navigation Arrows (Desktop only) */}
        <div className="w-60 xl:w-64 shrink-0 flex flex-col justify-between border-l border-white/5 pl-4 z-10">
          {/* Scrollable vertical list */}
          <div
            ref={sideListRef}
            className="flex-1 max-h-[290px] overflow-y-auto no-scrollbar space-y-2 pr-1"
          >
            {items.map((item, idx) => {
              const isActive = currentIndex === idx;
              return (
                <button
                  key={item.anime_id || idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all duration-200 flex items-center justify-between gap-2 group ${
                    isActive
                      ? 'bg-red-600/15 border-red-600/60 shadow-sm text-white'
                      : 'bg-[#12141c]/80 hover:bg-[#181a24] border-white/5 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <h4
                      className={`text-xs font-bold truncate transition-colors ${
                        isActive ? 'text-white' : 'group-hover:text-red-400'
                      }`}
                      title={item.title_uz || item.title_en}
                    >
                      {item.title_uz || item.title_en}
                    </h4>
                    <span className="text-[10px] text-gray-500 font-medium">
                      {item.year || '2026'} • {item.episodes_count ? `${item.episodes_count} qism` : 'Anime'}
                    </span>
                  </div>

                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-red-600 shrink-0 shadow-sm" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom Prev / Next Navigation Arrows */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5 mt-2">
            <button
              onClick={handlePrev}
              className="w-8 h-8 rounded-full bg-[#12141c] hover:bg-red-600 border border-white/10 text-gray-300 hover:text-white flex items-center justify-center transition-all active:scale-90 shadow-sm"
              aria-label="Oldingi anime"
              title="Oldingi (Klaviaturada: ←)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="w-8 h-8 rounded-full bg-[#12141c] hover:bg-red-600 border border-white/10 text-gray-300 hover:text-white flex items-center justify-center transition-all active:scale-90 shadow-sm"
              aria-label="Keyingi anime"
              title="Keyingi (Klaviaturada: →)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
