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
 * Matn ichidagi qidirilayotgan harf/so'zni qizil rangda ajratib ko'rsatish (Highlight)
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
      setTimeout(() => inputRef.current?.focus(), 60);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const url = `/api/search?q=${encodeURIComponent(query.trim())}&limit=40`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const raw: AnimeBase[] = Array.isArray(json.data) ? json.data : [];

        // Faqat o'zbekcha nomida qidiruv so'zi bo'lgan animeni ko'rsat
        const q = query.trim().toLowerCase();
        const filtered = raw.filter((anime) =>
          (anime.title_uz || '').toLowerCase().includes(q)
        );
        setResults(filtered);
      } catch (err) {
        console.error('Search error:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

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
    <>
      {/* Orqa fon — qora shaffof, blur effekt, klik bilan yopish */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Qidiruv paneli — tepaga yopishgan (sticky top), header ostidan boshlanadi */}
      <div className="fixed top-16 left-0 right-0 z-50">
        {/* Qidiruv input satri — to'liq kenglik, qora fon, pastida chiziq */}
        <div className="w-full bg-[#000000] border-b border-red-600/40 shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
          <div className="max-w-[60%] mx-auto flex items-center gap-3 px-5 py-3.5">
            <Search className="w-5 h-5 text-red-500 shrink-0" />

            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Anime nomini yozing..."
              className="flex-1 bg-transparent text-sm sm:text-base text-gray-100 placeholder-gray-500 focus:outline-none"
            />

            {loading && (
              <Loader2 className="w-4 h-4 text-red-500 animate-spin shrink-0" />
            )}

            {query && !loading && (
              <button
                onClick={() => setQuery('')}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                title="Tozalash"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* X tugmasi va ESC */}
            <div className="flex items-center gap-2 shrink-0 pl-3 border-l border-white/10">
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-red-600/10 hover:bg-red-600/20 border border-white/10 hover:border-red-600/40 text-gray-400 hover:text-red-500 flex items-center justify-center transition-all"
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

        {/* Natijalar paneli — qora fon, scroll, max-h */}
        <div className="w-full bg-[#000000] border-b border-white/5 shadow-[0_8px_40px_rgba(0,0,0,0.9)] max-h-[70vh] overflow-y-auto no-scrollbar">
          <div className="max-w-[60%] mx-auto py-4 px-5 space-y-2">

            {/* Bo'sh holat — hech narsa yozilmagan */}
            {query.trim() === '' && (
              <div className="py-10 text-center text-gray-500 text-sm select-none">
                <Search className="w-8 h-8 mx-auto mb-3 opacity-20 text-gray-400" />
                <p className="text-gray-400">Hech qanday anime qidirmagansiz</p>
                <p className="text-xs text-gray-600 mt-1">Anime nomini yuqoriga yozing</p>
              </div>
            )}

            {/* Yozildi lekin kam harf */}
            {query.trim().length === 1 && (
              <div className="py-10 text-center text-sm select-none">
                <p className="text-gray-500">Qidiruv uchun kamida 2 ta harf kiriting</p>
              </div>
            )}

            {/* Yuklanmoqda */}
            {query.trim().length >= 2 && loading && results.length === 0 && (
              <div className="py-10 flex items-center justify-center gap-2 text-sm text-gray-400">
                <Loader2 className="w-5 h-5 text-red-500 animate-spin" />
                <span>Qidirilmoqda...</span>
              </div>
            )}

            {/* Hech narsa topilmadi */}
            {query.trim().length >= 2 && !loading && results.length === 0 && (
              <div className="py-10 text-center text-sm">
                <p className="text-gray-300 font-semibold mb-1">
                  &ldquo;{query}&rdquo; bo&apos;yicha anime topilmadi
                </p>
                <p className="text-xs text-gray-600">
                  Boshqa so&apos;z yoki to&apos;liq anime nomini kiriting
                </p>
              </div>
            )}

            {/* Natijalar */}
            {results.length > 0 && (
              <>
                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest px-1 pb-2 flex items-center justify-between">
                  <span>Natijalar</span>
                  <span className="text-red-500">{results.length}</span>
                </div>

                <div className="space-y-1.5">
                  {results.map((anime) => {
                    const poster = anime.poster_r2_url || (anime as any).poster;
                    const rawRating = Number((anime as any).average_rating || anime.rating || 0);

                    return (
                      <Link
                        key={anime.anime_id || anime.id}
                        href={`/anime/${anime.anime_id || anime.id}`}
                        onClick={onClose}
                        className="flex items-center gap-4 px-3 py-2.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-red-600/20 transition-all group"
                      >
                        {/* Poster */}
                        <div className="w-11 h-15 sm:w-14 sm:h-16 rounded-lg overflow-hidden bg-gray-900 shrink-0 border border-white/5" style={{ height: '4rem' }}>
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

                        {/* Ma'lumotlar */}
                        <div className="flex-1 min-w-0">
                          {/* O'zbekcha nom — qidiruv so'zi qizil */}
                          <h4 className="text-sm font-bold text-gray-100 truncate group-hover:text-white transition-colors">
                            {highlightMatch(anime.title_uz || anime.title_en, query)}
                          </h4>

                          {/* Inglizcha nom — oddiy kulrang, highlight yo'q */}
                          {anime.title_en && anime.title_en !== anime.title_uz && (
                            <p className="text-[11px] text-gray-600 truncate mt-0.5">
                              {anime.title_en}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] font-medium">
                            <span className="px-1.5 py-0.5 rounded bg-red-600/20 text-red-400 font-bold border border-red-600/30 text-[10px]">
                              {anime.year || 2024}
                            </span>
                            <span className="text-gray-500">•</span>
                            <span className="text-gray-400">{anime.type || 'TV SERIES'}</span>
                            {anime.genres && anime.genres.length > 0 && (
                              <>
                                <span className="text-gray-600">•</span>
                                <span className="text-gray-500 truncate max-w-[220px]">
                                  {anime.genres.join(', ')}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Reyting va o'q */}
                        <div className="flex items-center gap-2 shrink-0">
                          {rawRating > 0 && (
                            <div className="flex items-center gap-1 text-[11px] font-black text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-1 rounded-lg">
                              <Star className="w-3 h-3 fill-amber-400" />
                              <span>{rawRating.toFixed(1)}</span>
                            </div>
                          )}
                          <ArrowUpRight className="w-4 h-4 text-gray-600 group-hover:text-red-500 transition-colors" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </>
  );
};
