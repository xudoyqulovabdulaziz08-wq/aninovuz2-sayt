'use client';

import React from 'react';
import Link from 'next/link';
import { Star, Flame } from 'lucide-react';
import { AnimeBase } from '@/types/anime/anime.types';

interface AnimeCardProps {
  anime: AnimeBase;
  badgeType?: 'HOT' | 'NEW' | 'AUTO';
}

export const AnimeCard: React.FC<AnimeCardProps> = ({ anime, badgeType = 'AUTO' }) => {
  const rawRating = Number(anime.average_rating || 0);
  const rating = rawRating > 0 ? rawRating.toFixed(1) : '0';
  const isHot = badgeType === 'HOT' || (badgeType === 'AUTO' && (anime.views_total > 10 || rawRating >= 8.5));
  const isNew = badgeType === 'NEW' || (badgeType === 'AUTO' && !isHot && anime.year >= 2024);

  return (
    <Link
      href={`/anime/${anime.anime_id}`}
      draggable={false}
      className="group/card relative flex flex-col shrink-0 w-36 sm:w-44 md:w-48 select-none"
    >
      {/* 1. Poster Image Container (Only this card scales when hovered) */}
      <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-[#0d0e12] border border-white/5">
        <img
          src={anime.poster_r2_url}
          alt={anime.title_uz || anime.title_en}
          loading="lazy"
          draggable={false}
          className="w-full h-full object-cover object-center group-hover/card:scale-105 transition-transform duration-300 pointer-events-none"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&q=80';
          }}
        />

        {/* 2. Top Badges (HOT/NEW on Left, Year on Right) */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none z-10">
          {isHot ? (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-red-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
              <Flame className="w-2.5 h-2.5 fill-white" />
              HOT
            </span>
          ) : isNew ? (
            <span className="px-1.5 py-0.5 rounded bg-red-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
              NEW
            </span>
          ) : (
            <span />
          )}

          <span className="px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-sm text-gray-200 text-[10px] font-bold border border-white/10">
            {anime.year || 2024}
          </span>
        </div>

        {/* 3. Bottom Badges ON TOP of image (Rating on Left, Episodes on Right) - No global blur */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none z-10">
          {/* Rating */}
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-sm text-amber-400 text-[10px] font-black border border-white/10">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{rating}</span>
          </div>

          {/* Episode Count */}
          <span className="px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-sm text-gray-300 text-[10px] font-medium border border-white/10">
            {anime.episodes_count ? `${anime.episodes_count} qism` : '12 qism'}
          </span>
        </div>
      </div>

      {/* 4. Title UNDER the image (Turns red ONLY when this card is hovered) */}
      <div className="pt-2 px-0.5">
        <h3
          className="font-bold text-xs sm:text-sm text-gray-100 truncate group-hover/card:text-red-500 transition-colors"
          title={anime.title_uz || anime.title_en}
        >
          {anime.title_uz || anime.title_en}
        </h3>
      </div>
    </Link>
  );
};