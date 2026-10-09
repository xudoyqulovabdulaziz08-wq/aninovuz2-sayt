'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, Star, ChevronLeft, ChevronRight, Eye, Calendar, Sparkles } from 'lucide-react';
import { AnimeBase } from '@/types/anime/anime.types';

interface HeroBannerProps {
  items: AnimeBase[];
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ items }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!items || items.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [items]);

  if (!items || items.length === 0) return null;

  const current = items[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-br from-[#131728] via-[#0f111a] to-[#000000] border border-gray-800/80 shadow-2xl min-h-[360px] md:min-h-[440px] flex items-center mb-10">
      {/* Background Poster Blur Effect */}
      {current.poster_r2_url && (
        <div
          className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-20 transform scale-110 pointer-events-none transition-all duration-1000"
          style={{ backgroundImage: `url(${current.poster_r2_url})` }}
        />
      )}

      {/* Main Container */}
      <div className="relative z-10 w-full p-6 sm:p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Info Side */}
        <div className="flex-1 flex flex-col items-start gap-4 max-w-2xl">
          {/* Badge */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-pink-500/20 to-indigo-500/20 border border-pink-500/30 text-pink-300 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              Tavsiya etiladi
            </span>
            <span className="px-2.5 py-1 rounded-full bg-gray-800 text-gray-300 text-xs font-semibold border border-gray-700">
              {current.type || 'TV SERIES'}
            </span>
            <span className="inline-flex items-center gap-1 text-gray-400 text-xs">
              <Calendar className="w-3.5 h-3.5" />
              {current.year}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            {current.title_uz || current.title_en}
          </h1>

          {current.title_en && current.title_en !== current.title_uz && (
            <p className="text-sm sm:text-base text-gray-400 font-medium -mt-2">
              {current.title_en}
            </p>
          )}

          {/* Genres & Dubber */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {current.genres?.map((genre, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-xs font-medium"
              >
                {genre}
              </span>
            ))}
            {current.dubbers && current.dubbers.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
                🎙️ {current.dubbers.join(', ')}
              </span>
            )}
          </div>

          {/* Stats & Action */}
          <div className="flex flex-wrap items-center gap-6 pt-3">
            <Link
              href={`/anime/${current.anime_id}`}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              Hoziroq tomosha qilish
            </Link>

            <div className="flex items-center gap-4 text-xs font-semibold text-gray-300">
              {Number(current.average_rating) > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{Number(current.average_rating).toFixed(1)} / 10</span>
                </div>
              )}

              <div className="flex items-center gap-1.5 text-gray-400">
                <Eye className="w-4 h-4" />
                <span>{current.views_total || 0} ko'rildi</span>
              </div>
            </div>
          </div>
        </div>

        {/* Poster Showcase Side */}
        <div className="relative group w-48 sm:w-56 md:w-64 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-2 border-indigo-500/30 shrink-0">
          <img
            src={current.poster_r2_url}
            alt={current.title_uz}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
        </div>
      </div>

      {/* Navigation Controls */}
      {items.length > 1 && (
        <div className="absolute bottom-4 right-6 z-20 flex items-center gap-2">
          <button
            onClick={handlePrev}
            aria-label="Oldingi"
            className="w-9 h-9 rounded-full bg-black/60 hover:bg-indigo-600 border border-white/10 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-90"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-bold text-gray-400 px-1">
            {currentIndex + 1} / {items.length}
          </span>
          <button
            onClick={handleNext}
            aria-label="Keyingi"
            className="w-9 h-9 rounded-full bg-black/60 hover:bg-indigo-600 border border-white/10 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-90"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

