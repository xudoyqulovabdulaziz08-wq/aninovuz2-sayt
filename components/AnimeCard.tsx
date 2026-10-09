'use client';

import React from 'react';
import Link from 'next/link';
import { Star, Play, Eye, Film } from 'lucide-react';
import { AnimeBase } from '@/types/anime/anime.types';

interface AnimeCardProps {
  anime: AnimeBase;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({ anime }) => {
  const rating = Number(anime.average_rating || 0).toFixed(1);

  return (
    <Link
      href={`/anime/${anime.anime_id}`}
      className="group relative flex flex-col rounded-2xl overflow-hidden bg-[#121520] border border-gray-800/80 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1.5"
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-900">
        {anime.poster_r2_url ? (
          <img
            src={anime.poster_r2_url}
            alt={anime.title_uz || anime.title_en}
            loading="lazy"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              // fallback image if broken
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&q=80';
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 bg-gray-950">
            <Film className="w-10 h-10 mb-2 opacity-50" />
            <span className="text-xs">Rasm mavjud emas</span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#121520] via-transparent to-black/40 opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1">
          <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-black/60 backdrop-blur-md text-gray-200 border border-white/10 uppercase tracking-wider">
            {anime.type || 'ANIME'}
          </span>

          {Number(anime.average_rating) > 0 && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/90 text-black text-[11px] font-black shadow-sm backdrop-blur-md">
              <Star className="w-3 h-3 fill-black text-black" />
              <span>{rating}</span>
            </div>
          )}
        </div>

        {/* Center Hover Play Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
          <div className="w-12 h-12 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-lg shadow-indigo-600/50 backdrop-blur-sm">
            <Play className="w-5 h-5 fill-white ml-0.5" />
          </div>
        </div>

        {/* Bottom Info inside image */}
        <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[11px] text-gray-300 font-medium">
          <span>{anime.year || '2026'}</span>
          {anime.episodes_count !== undefined && anime.episodes_count > 0 && (
            <span className="bg-indigo-950/80 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/30">
              {anime.episodes_count} qism
            </span>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2">
        <div>
          <h3
            className="font-bold text-sm text-gray-100 line-clamp-1 group-hover:text-indigo-400 transition-colors"
            title={anime.title_uz}
          >
            {anime.title_uz || anime.title_en}
          </h3>
          {anime.title_en && anime.title_en !== anime.title_uz && (
            <p className="text-xs text-gray-400 line-clamp-1 mt-0.5" title={anime.title_en}>
              {anime.title_en}
            </p>
          )}
        </div>

        {/* Genres */}
        {anime.genres && anime.genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {anime.genres.slice(0, 2).map((genre, idx) => (
              <span
                key={idx}
                className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800/80 text-gray-300 border border-gray-700/50"
              >
                {genre}
              </span>
            ))}
            {anime.genres.length > 2 && (
              <span className="text-[10px] px-1 rounded bg-gray-800/50 text-gray-500">
                +{anime.genres.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Dubbers or Views */}
        <div className="pt-2 mt-auto border-t border-gray-800/60 flex items-center justify-between text-[11px] text-gray-400">
          <span className="truncate max-w-[120px] text-indigo-400 font-medium">
            {anime.dubbers && anime.dubbers.length > 0 ? anime.dubbers[0] : 'O\'zbekcha'}
          </span>
          <div className="flex items-center gap-1 text-gray-500">
            <Eye className="w-3 h-3" />
            <span>{anime.views_total || 0}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

