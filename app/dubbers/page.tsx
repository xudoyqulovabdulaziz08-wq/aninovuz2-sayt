'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Star, Flame, RotateCcw, Mic2 } from 'lucide-react';
import { useAnimeData } from '@/context/AnimeDataContext';

export default function DubbersPage() {
  const { dubbers: apiDubbers, allAnimes, isInitialLoaded } = useAnimeData();

  // Multi-dubber selection state: Dubber nomlari massivi (masalan: ['Anibla', 'Animedia'])
  const [selectedDubbers, setSelectedDubbers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 28;

  // Barcha mavjud dubberlar ro'yxati (API dan olingan yoki allAnimes dan hisoblangan)
  const availableDubbers = useMemo(() => {
    if (apiDubbers && apiDubbers.length > 0) {
      return apiDubbers;
    }

    // Zaxira: allAnimes dan hisoblash
    const countMap = new Map<string, number>();
    allAnimes.forEach((anime) => {
      let dubberList: string[] = [];
      if (Array.isArray(anime.dubbers)) {
        anime.dubbers.forEach((d: any) => {
          const name = typeof d === 'string' ? d : d?.name;
          if (name) dubberList.push(name);
        });
      } else if (typeof anime.dubbers === 'string') {
        dubberList = anime.dubbers.split(/[\s,]+/);
      }

      // Agar anime.dubbers bo'sh bo'lsa, epizodlardagi stream dub_group larni tekshiramiz
      if (dubberList.length === 0 && Array.isArray(anime.episodes)) {
        anime.episodes.forEach((ep: any) => {
          if (Array.isArray(ep.streams)) {
            ep.streams.forEach((st: any) => {
              if (st.dub_group) dubberList.push(st.dub_group);
            });
          }
        });
      }

      // Har bir anime uchun unikal dubberlarni hisoblaymiz
      const uniqueNames = Array.from(new Set(dubberList.map((n) => n.trim()).filter(Boolean)));
      uniqueNames.forEach((name) => {
        countMap.set(name, (countMap.get(name) || 0) + 1);
      });
    });

    return Array.from(countMap.entries())
      .map(([name, anime_count], index) => ({
        id: index + 1,
        name,
        anime_count,
      }))
      .sort((a, b) => b.anime_count - a.anime_count);
  }, [apiDubbers, allAnimes]);

  // Dubberni bosganda qo'shish / o'chirish (Toggle)
  const handleToggleDubber = (dubberName: string) => {
    setSelectedDubbers((prev) => {
      const exists = prev.includes(dubberName);
      if (exists) {
        return prev.filter((d) => d !== dubberName);
      } else {
        return [...prev, dubberName];
      }
    });
    setCurrentPage(1);
  };

  // Barcha filtrlarni tozalash
  const handleClearFilters = () => {
    setSelectedDubbers([]);
    setCurrentPage(1);
  };

  // Tanlangan barcha dubberlar bo'yicha filtrlash (AND mantiq: barcha tanlangan dubberlar animeda mavjud bo'lishi kerak)
  const filteredAnimes = useMemo(() => {
    if (selectedDubbers.length === 0) {
      return [];
    }

    const selectedLower = selectedDubbers.map((d) => d.toLowerCase().trim());

    return allAnimes.filter((anime) => {
      let animeDubbers: string[] = [];
      if (Array.isArray(anime.dubbers)) {
        animeDubbers = anime.dubbers
          .map((d: any) => (typeof d === 'string' ? d : d?.name || ''))
          .filter(Boolean);
      } else if (typeof anime.dubbers === 'string') {
        animeDubbers = anime.dubbers.split(/[\s,]+/);
      }

      // Agar dubbers bo'sh bo'lsa, epizodlardagi streams dub_group larni tekshiramiz
      if (animeDubbers.length === 0 && Array.isArray(anime.episodes)) {
        const epDubbers = new Set<string>();
        anime.episodes.forEach((ep: any) => {
          if (Array.isArray(ep.streams)) {
            ep.streams.forEach((st: any) => {
              if (st.dub_group) epDubbers.add(st.dub_group);
            });
          }
        });
        animeDubbers = Array.from(epDubbers);
      }

      const animeDubbersLower = animeDubbers.map((d) => d.toLowerCase().trim());

      // AND mantiq: Har bir tanlangan dubber animeda bo'lishi kerak
      return selectedLower.every((sel) => animeDubbersLower.includes(sel));
    });
  }, [allAnimes, selectedDubbers]);

  // Sahifalash (Pagination)
  const totalPages = Math.max(1, Math.ceil(filteredAnimes.length / itemsPerPage));
  const displayedAnimes = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAnimes.slice(start, start + itemsPerPage);
  }, [filteredAnimes, currentPage]);

  if (!isInitialLoaded && allAnimes.length === 0 && availableDubbers.length === 0) {
    return <div className="min-h-screen" />;
  }

  return (
    <div className="w-full space-y-6 select-none pb-12 animate-in fade-in duration-200">
      {/* 1. Header & Tavsif */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Mic2 className="w-6 h-6 text-red-500" />
            <span>Dubberlar</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Bir yoki bir nechta dublyaj guruhini tanlang va mos animelarni toping
          </p>
        </div>

        {/* Tanlangan dubberlar mavjud bo'lganda tozalash tugmasi */}
        {selectedDubbers.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-semibold px-2.5 py-1 rounded-lg bg-[#141620] border border-white/5">
              {selectedDubbers.length} ta dubber tanlandi ({filteredAnimes.length} ta anime)
            </span>
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-red-500 hover:text-white hover:bg-red-600/20 border border-red-600/30 hover:border-red-600/60 transition-all cursor-pointer active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Tozalash</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. DUBBERLAR KONTAYNERI (Janrlar bloki bilan aynan bir xil) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#08090d] border border-white/10 shadow-xl space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black tracking-widest text-gray-400 uppercase">
              DUBBERLAR
            </span>
            <span className="text-[10px] font-bold text-gray-500 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
              {availableDubbers.length} ta mavjud
            </span>
          </div>

          {selectedDubbers.length > 0 && (
            <button
              onClick={handleClearFilters}
              className="text-[11px] font-bold text-red-500 hover:text-red-400 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Filtrni tozalash
            </button>
          )}
        </div>

        {/* Dubberlar pill teglari */}
        <div className="flex flex-wrap gap-2 sm:gap-2.5 max-h-56 overflow-y-auto pr-1 no-scrollbar">
          {availableDubbers.map((dubber) => {
            const isSelected = selectedDubbers.includes(dubber.name);

            return (
              <button
                key={dubber.id || dubber.name}
                onClick={() => handleToggleDubber(dubber.name)}
                className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none active:scale-95 ${
                  isSelected
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 border border-red-500 scale-[1.02]'
                    : 'bg-[#12141c] hover:bg-[#1a1d28] text-gray-300 hover:text-white border border-white/10 hover:border-white/20'
                }`}
              >
                <span>{dubber.name}</span>
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full ${
                    isSelected
                      ? 'bg-white/25 text-white'
                      : 'bg-white/5 text-gray-500 group-hover:text-gray-400'
                  }`}
                >
                  {dubber.anime_count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. NATIJALAR QISMI */}
      {selectedDubbers.length === 0 ? (
        /* Hech qanday dubber tanlanmagan holat — Janrlar kabi chiroyli bo'sh holat */
        <div className="w-full rounded-2xl border border-dashed border-white/10 bg-[#08090d]/60 p-12 sm:p-20 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#141620] border border-white/10 flex items-center justify-center text-red-500 shadow-inner">
            <Mic2 className="w-7 h-7" />
          </div>

          <div className="space-y-1.5 max-w-sm">
            <h3 className="text-base sm:text-lg font-bold text-gray-200">
              Hech qanday dubber tanlanmagan
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              Animelarni ko&apos;rish uchun yuqoridagi dublyaj guruhlaridan birini tanlang
            </p>
          </div>
        </div>
      ) : filteredAnimes.length === 0 ? (
        /* Tanlangan dubberlar bo'yicha hech qanday anime topilmagan holat */
        <div className="w-full rounded-2xl border border-dashed border-white/10 bg-[#08090d]/60 p-12 sm:p-16 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-red-600/10 border border-red-600/20 flex items-center justify-center text-red-500">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 max-w-md">
            <h3 className="text-base sm:text-lg font-bold text-gray-200">
              Mos keluvchi animelar topilmadi
            </h3>
            <p className="text-xs sm:text-sm text-gray-400">
              Tanlangan bir vaqtda barcha dubberlar ({selectedDubbers.join(', ')}) ovoz bergan anime mavjud emas. Dubberlardan birini o&apos;chirib ko&apos;ring.
            </p>
          </div>
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
          >
            Filtrlarni tozalash
          </button>
        </div>
      ) : (
        /* Animelar kartalari gridi */
        <div className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-gray-400">
              Topilgan animelar: <span className="text-red-500 font-extrabold">{filteredAnimes.length}</span> ta
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3 sm:gap-4">
            {displayedAnimes.map((anime) => {
              const id = anime.anime_id || anime.id;
              const title = anime.title_uz || anime.title_en;
              const poster = anime.poster_r2_url || anime.poster;
              const rawRating = Number(anime.average_rating || anime.rating || 0);
              const ratingText = rawRating > 0 ? rawRating.toFixed(1) : '0';
              const isHot = (anime.views_total || 0) > 10 || rawRating >= 8.5;
              const isNew = !isHot && Number(anime.year) >= 2024;

              // Dubber nomlari
              let dubberNames: string[] = [];
              if (Array.isArray(anime.dubbers)) {
                dubberNames = anime.dubbers
                  .map((d: any) => (typeof d === 'string' ? d : d?.name || ''))
                  .filter(Boolean);
              } else if (typeof anime.dubbers === 'string') {
                dubberNames = anime.dubbers.split(/[\s,]+/);
              }

              // Janr nomlari
              const genreNames = Array.isArray(anime.genres)
                ? anime.genres.map((g: any) => (typeof g === 'string' ? g : g.name)).filter(Boolean)
                : [];

              return (
                <Link
                  key={id}
                  href={`/anime/${id}`}
                  draggable={false}
                  className="group/card relative flex flex-col select-none transition-all"
                >
                  {/* Poster Image Container */}
                  <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-[#0d0e12] border border-white/5">
                    <img
                      src={poster}
                      alt={title}
                      loading="lazy"
                      draggable={false}
                      className="w-full h-full object-cover object-center group-hover/card:scale-105 transition-transform duration-300 pointer-events-none"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&q=80';
                      }}
                    />

                    {/* Top Badges */}
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

                    {/* Bottom Badges */}
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none z-10">
                      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-sm text-amber-400 text-[10px] font-black border border-white/10">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{ratingText}</span>
                      </div>

                      <span className="px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-sm text-gray-300 text-[10px] font-medium border border-white/10">
                        {anime.episodes_count ? `${anime.episodes_count} qism` : '12 qism'}
                      </span>
                    </div>
                  </div>

                  {/* Title and Dubber/Genres under poster */}
                  <div className="pt-2 px-0.5 space-y-0.5">
                    <h3
                      className="font-bold text-xs sm:text-sm text-gray-100 truncate group-hover/card:text-red-500 transition-colors"
                      title={title}
                    >
                      {title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
                      <span className="truncate max-w-[140px] text-red-400/90 font-semibold">
                        {dubberNames.slice(0, 2).join(', ') || genreNames.slice(0, 2).join(', ') || 'Dublyaj'}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 pt-6 pb-2 text-xs font-semibold">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg bg-[#14161f] hover:bg-[#1a1d28] border border-white/10 text-gray-300 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
              >
                Oldingi
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = i + 1;
                if (totalPages > 5 && currentPage > 3) {
                  pageNum = currentPage - 2 + i;
                  if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-all cursor-pointer ${
                      currentPage === pageNum
                        ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                        : 'bg-[#14161f] hover:bg-[#1a1d28] border border-white/10 text-gray-300 hover:text-white'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  <span className="text-gray-500 px-1">...</span>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className="w-8 h-8 rounded-lg bg-[#14161f] hover:bg-[#1a1d28] border border-white/10 text-gray-300 hover:text-white flex items-center justify-center font-bold transition-all cursor-pointer"
                  >
                    {totalPages}
                  </button>
                </>
              )}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg bg-[#14161f] hover:bg-[#1a1d28] border border-white/10 text-gray-300 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
              >
                Keyingi
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

