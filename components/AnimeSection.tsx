'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { AnimeBase } from '@/types/anime/anime.types';
import { AnimeCard } from './AnimeCard';

interface AnimeSectionProps {
  title: string;
  icon?: React.ReactNode;
  items: AnimeBase[];
  viewAllLink?: string;
  badgeText?: string;
}

export const AnimeSection: React.FC<AnimeSectionProps> = ({
  title,
  icon,
  items,
  viewAllLink,
  badgeText,
}) => {
  if (!items || items.length === 0) return null;

  return (
    <section className="my-10">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-2.5">
          {icon && <div className="text-indigo-400">{icon}</div>}
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {title}
          </h2>
          {badgeText && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {badgeText}
            </span>
          )}
        </div>

        {viewAllLink && (
          <Link
            href={viewAllLink}
            className="group flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-indigo-400 transition-colors"
          >
            <span>Barchasi</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
        {items.map((anime) => (
          <AnimeCard key={anime.anime_id} anime={anime} />
        ))}
      </div>
    </section>
  );
};

