'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, X, ArrowUpRight, Star, Film, Loader2 } from 'lucide-react';
import { AnimeBase } from '@/types/anime/anime.types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Matn ichidagi qidirilayotgan harf/so'z/sonlarni QIZIL rangda ajratib ko'rsatish (Highlight)
 */
function highlightMatch(text: string, search: string) {
  if (!text) return '';
  const trimmed = search.trim();
  if (!trimmed) return text;

  try {
    const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="text-red-500 font-bold">
          {part}
        </span>
      ) : (
        <span key={index}>{part}</span>
      )
    );
  } catch {
    return text;
  }
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AnimeBase[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const url = `/api/search?q=${encodeURIComponent(q)}&limit=50`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const raw: AnimeBase[] = Array.isArray(json.data) ? json.data : [];

        const lowerQ = q.toLowerCase();
        const numQ = Number(q);
        const isNumeric = !isNaN(numQ) && q !== '';

        // 1. O'zbekcha nom (title_uz), anime_id yoki yil bo'yicha filter (inglizcha nom bo'yicha emas)
        const matched = raw.filter((anime) => {
          const uzTitle = (anime.title_uz || '').toLowerCase();
          const matchesUz = uzTitle.includes(lowerQ);
          const matchesId = isNumeric && (anime.anime_id === numQ || (anime as any).id === numQ);
          const matchesYear = isNumeric && anime.year === numQ;
          return matchesUz || matchesId || matchesYear;
        });

        // 2. Smart Priority Sorting (Sonlar va title_uz bilan boshlanuvchilar 1-o'rinda)
        matched.sort((a, b) => {
          const aTitle = (a.title_uz || '').toLowerCase();
          const bTitle = (b.title_uz || '').toLowerCase();

          // Sarlavha to'g'ridan-to'g'ri qidiruv so'zi/soni bilan boshlansa
          const aStarts = aTitle.startsWith(lowerQ);
          const bStarts = bTitle.startsWith(lowerQ);
          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;

          // ID aynan mos kelsa
          if (isNumeric) {
            const aIdMatch = (a.anime_id === numQ || (a as any).id === numQ);
            const bIdMatch = (b.anime_id === numQ || (b as any).id === numQ);
            if (aIdMatch && !bIdMatch) return -1;
            if (!aIdMatch && bIdMatch) return 1;
          }

          return 0;
        });

        setResults(matched);
      } catch (err) {
        console.error('Search error:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // ESC tugmasi bilan yopish
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-start">
      {/* Orqa fon — qora shaffof overlay (blur bilan), bosilganda yopiladi */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Qidiruv Asosiy Paneli — Ekranning eng tepasidan (top-0) boshlanadi, tepadan pastga silliq tushadi */}
      <div className="relative z-10 w-full bg-[#000000] border-b border-white/10 shadow-[0_10px_50px_rgba(0,0,0,0.95)] animate-in slide-in-from-top duration-300 ease-out">
        {/* Yuqori Input Satri */}
        <div className="w-full border-b border-white/10">
          <div className="max-w-4xl mx-auto flex items-center gap-3.5 px-4 sm:px-6 py-4">
            {/* Qizil Qidiruv Ikonkasi */}
            <Search className="w-5 h-5 text-red-500 shrink-0" />

            {/* Asosiy Input */}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Anime nomini yoki sonini yozing..."
              className="flex-1 bg-transparent text-base sm:text-lg text-white font-medium placeholder-gray-500 focus:outline-none"
            />

            {loading && (
              <Loader2 className="w-5 h-5 text-red-500 animate-spin shrink-0" />
            )}

            {query && !loading && (
              <button
                onClick={() => setQuery('')}
                className="p-1 text-gray-400 hover:text-white transition-colors"
                title="Tozalash"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* X va ESC tugmalari */}
            <div className="flex items-center gap-2 shrink-0 pl-3 border-l border-white/10">
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-red-600/20 border border-white/10 hover:border-red-600/40 text-gray-400 hover:text-red-500 flex items-center justify-center transition-all"
                aria-label="Yopish"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold font-mono text-red-500 bg-white/5 border border-white/10 rounded">
                ESC
              </kbd>
            </div>
          </div>
        </div>

        {/* Natijalar Paneli */}
        <div className="w-full max-h-[75vh] overflow-y-auto no-scrollbar">
          <div className="max-w-4xl mx-auto py-4 px-4 sm:px-6">

            {/* 1. Bo'sh holat — hech narsa yozilmagan */}
            {query.trim() === '' && (
              <div className="py-14 text-center select-none">
                <Search className="w-10 h-10 mx-auto mb-3 opacity-20 text-gray-400" />
                <p className="text-sm font-medium text-gray-300">Hech qanday anime qidirmagansiz</p>
                <p className="text-xs text-gray-600 mt-1">Anime nomi yoki raqamini yuqoriga yozing</p>
              </div>
            )}

            {/* 2. Yuklanmoqda */}
            {query.trim() !== '' && loading && results.length === 0 && (
              <div className="py-14 flex items-center justify-center gap-2 text-sm text-gray-400">
                <Loader2 className="w-5 h-5 text-red-500 animate-spin" />
                <span>Qidirilmoqda...</span>
              </div>
            )}

            {/* 3. Hech narsa topilmadi */}
            {query.trim() !== '' && !loading && results.length === 0 && (
              <div className="py-14 text-center">
                <p className="text-sm text-gray-200 font-semibold mb-1">
                  &ldquo;{query}&rdquo; bo&apos;yicha anime topilmadi
                </p>
                <p className="text-xs text-gray-500">
                  Boshqa so&apos;z, o&apos;zbekcha nom yoki anime raqamini kiriting
                </p>
              </div>
            )}

            {/* 4. Topilgan Natijalar Ro'yxati */}
            {results.length > 0 && (
              <div className="space-y-3">
                {/* Sarlavha: NATIJALAR va Soni */}
                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest px-1 flex items-center justify-between">
                  <span>Natijalar</span>
                  <span className="text-red-500 font-extrabold">{results.length}</span>
                </div>

                {/* Ro'yxat */}
                <div className="space-y-1.5 pb-2">
                  {results.map((anime) => {
                    const poster = anime.poster_r2_url || (anime as any).poster;
                    const rawRating = Number((anime as any).average_rating || anime.rating || 0);

                    return (
                      <Link
                        key={anime.anime_id || anime.id}
                        href={`/anime/${anime.anime_id || anime.id}`}
                        onClick={onClose}
                        className="flex items-center gap-3.5 sm:gap-4 p-2.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all group"
                      >
                        {/* Poster */}
                        <div className="w-12 h-16 sm:w-14 sm:h-18 rounded-lg overflow-hidden bg-gray-950 shrink-0 border border-white/10 shadow-sm">
                          {poster ? (
                            <img
                              src={poster}
                              alt={anime.title_uz || anime.title_en}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-700">
                              <Film className="w-4 h-4" />
                            </div>
                          )}
                        </div>

                        {/* Ma'lumotlar: Title_uz (qizil highlight), Title_en, Badgeler */}
                        <div className="flex-1 min-w-0">
                          {/* O'zbekcha nom — qidiruv so'zi/soni QIZIL rangda */}
                          <h4 className="text-sm font-bold text-gray-100 truncate group-hover:text-white transition-colors">
                            {highlightMatch(anime.title_uz || anime.title_en, query)}
                          </h4>

                          {/* Inglizcha nom — oddiy kulrang, highlight yo'q */}
                          {anime.title_en && anime.title_en !== anime.title_uz && (
                            <p className="text-[11px] text-gray-500 truncate mt-0.5">
                              {anime.title_en}
                            </p>
                          )}

                          {/* Meta Badgeler: Yili, Turi, Janrlari */}
                          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] font-medium">
                            <span className="px-1.5 py-0.5 rounded bg-red-600/20 text-red-400 font-bold border border-red-600/30 text-[10px]">
                              {anime.year || 2024}
                            </span>
                            <span className="text-gray-600">•</span>
                            <span className="text-gray-400">{anime.type || 'TV SERIES'}</span>
                            {anime.genres && anime.genres.length > 0 && (
                              <>
                                <span className="text-gray-600">•</span>
                                <span className="text-gray-400 truncate max-w-[240px]">
                                  {anime.genres.join(', ')}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Reyting va Ochish O'qi (ArrowUpRight) */}
                        <div className="flex items-center gap-2 shrink-0">
                          {rawRating > 0 && (
                            <div className="flex items-center gap-1 text-[11px] font-black text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-1 rounded-lg">
                              <Star className="w-3 h-3 fill-amber-400" />
                              <span>{rawRating.toFixed(1)}</span>
                            </div>
                          )}
                          <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-red-500 transition-colors" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
