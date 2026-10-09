'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, X, Star, Film, Loader2 } from 'lucide-react';
import { animeApi } from '@/lib/api';
import { AnimeBase } from '@/types/anime/anime.types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AnimeBase[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await animeApi.search({ q: query.trim(), limit: 12 });
        setResults(res.data || []);
      } catch (err) {
        console.error('Search error:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-[#12141c] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/10 bg-[#161922]">
          <Search className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Anime nomi yoki janr qidiring..."
            className="w-full bg-transparent text-sm sm:text-base text-gray-100 placeholder-gray-500 focus:outline-none"
          />
          {loading ? (
            <Loader2 className="w-5 h-5 text-red-500 animate-spin mr-2 shrink-0" />
          ) : query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-gray-400 hover:text-white mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs font-semibold text-gray-400 bg-white/5 hover:bg-white/10 hover:text-white rounded-lg transition-colors"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {query.trim() === '' ? (
            <div className="py-12 text-center text-gray-500 text-sm">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-40 text-gray-400" />
              Izlamoqchi bo'lgan anime nomini yozing...
            </div>
          ) : loading ? (
            <div className="py-12 text-center text-gray-400 text-sm flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 text-red-500 animate-spin" />
              Qidirilmoqda...
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">
              "{query}" bo'yicha hech qanday anime topilmadi.
            </div>
          ) : (
            results.map((anime) => (
              <Link
                key={anime.anime_id}
                href={`/anime/${anime.anime_id}`}
                onClick={onClose}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors group"
              >
                <div className="w-12 h-16 rounded-lg overflow-hidden bg-gray-800 shrink-0 relative">
                  {anime.poster_r2_url ? (
                    <img
                      src={anime.poster_r2_url}
                      alt={anime.title_uz || anime.title_en}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Film className="w-4 h-4 text-gray-600" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-200 group-hover:text-red-500 transition-colors truncate">
                    {anime.title_uz || anime.title_en}
                  </h4>
                  <p className="text-xs text-gray-400 truncate">
                    {anime.title_en}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500">
                    <span className="text-red-400 font-medium">{anime.year}</span>
                    <span>•</span>
                    <span>{anime.type || 'TV SERIES'}</span>
                    {anime.genres && anime.genres.length > 0 && (
                      <>
                        <span>•</span>
                        <span className="truncate max-w-[150px]">{anime.genres.join(', ')}</span>
                      </>
                    )}
                  </div>
                </div>

                {Number(anime.average_rating) > 0 && (
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-1 rounded-lg shrink-0">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{Number(anime.average_rating).toFixed(1)}</span>
                  </div>
                )}
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

