'use client';

import React from 'react';
import Link from 'next/link';
import { GenreItem } from '@/types/anime/anime.types';
import { Sparkles } from 'lucide-react';

interface GenreChipsProps {
  genres: GenreItem[];
}

export const GenreChips: React.FC<GenreChipsProps> = ({ genres }) => {
  if (!genres || genres.length === 0) return null;

  return (
    <div className="mb-10">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-pink-400" />
        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
          Ommabop Janrlar
        </h3>
      </div>
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {genres.slice(0, 16).map((g) => (
          <Link
            key={g.id}
            href={`/genres/${encodeURIComponent(g.name)}`}
            className="shrink-0 px-3.5 py-1.5 rounded-xl bg-[#121520] hover:bg-indigo-600 border border-gray-800 hover:border-indigo-500 text-xs font-semibold text-gray-300 hover:text-white transition-all flex items-center gap-1.5"
          >
            <span>{g.name}</span>
            <span className="text-[10px] text-gray-500 hover:text-indigo-200">
              {g.anime_count}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

