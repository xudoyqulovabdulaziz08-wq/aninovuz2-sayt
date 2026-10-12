'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Star, RotateCcw } from 'lucide-react';
import { useAnimeData } from '@/context/AnimeDataContext';

export default function AnimesPage() {
  const { allAnimes, isInitialLoaded } = useAnimeData();

  // Filters State
  const [selectedGenre, setSelectedGenre] = useState<string>('Barchasi');
  const [selectedYear, setSelectedYear] = useState<string>('Barchasi');
  const [selectedRating, setSelectedRating] = useState<string>('Barchasi');
  const [selectedStatus, setSelectedStatus] = useState<string>('Barchasi');
  const [sortBy, setSortBy] = useState<string>('Mashhurligi');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 28;

  // Barcha unikal janrlarni yig'ish
  const allGenres = useMemo(() => {
    const set = new Set<string>();
    allAnimes.forEach((item) => {
      if (Array.isArray(item.genres)) {
        item.genres.forEach((g: any) => {
          const name = typeof g === 'string' ? g : g.name;
          if (name) set.add(name);
        });
      }
    });
    return Array.from(set).sort();
  }, [allAnimes]);

  // Filtrlash va saralash
  const filteredAnimes = useMemo(() => {
    let list = [...allAnimes];

    // 1. Janr bo'yicha filter
    if (selectedGenre !== 'Barchasi') {
      list = list.filter((item) => {
        if (!Array.isArray(item.genres)) return false;
        return item.genres.some((g: any) => {
          const name = typeof g === 'string' ? g : g.name;
          return name?.toLowerCase() === selectedGenre.toLowerCase();
        });
      });
    }

    // 2. Yil bo'yicha filter
    if (selectedYear !== 'Barchasi') {
      if (selectedYear === '2020+') {
        list = list.filter((item) => Number(item.year) >= 2020);
      } else if (selectedYear === '2010+') {
        list = list.filter((item) => Number(item.year) >= 2010 && Number(item.year) < 2020);
      } else if (selectedYear === 'Eski') {
        list = list.filter((item) => Number(item.year) < 2010);
      } else {
        list = list.filter((item) => String(item.year) === selectedYear);
      }
    }

    // 3. Reyting bo'yicha filter
    if (selectedRating !== 'Barchasi') {
      const minRate = Number(selectedRating.replace('+', ''));
      list = list.filter((item) => Number(item.average_rating || item.rating || 0) >= minRate);
    }

    // 4. Holati bo'yicha filter
    if (selectedStatus !== 'Barchasi') {
      if (selectedStatus === 'Efirda') {
        list = list.filter((item) => Number(item.year) >= 2025);
      } else if (selectedStatus === 'Tugallangan') {
        list = list.filter((item) => Number(item.year) < 2025);
      }
    }

    // 5. Saralash (Sorting)
    if (sortBy === 'Mashhurligi') {
      list.sort((a, b) => Number(b.views_total || 0) - Number(a.views_total || 0));
    } else if (sortBy === 'Alfavit') {
      list.sort((a, b) => (a.title_uz || '').localeCompare(b.title_uz || ''));
    } else if (sortBy === 'Yangilik') {
      list.sort((a, b) => {
        const yDiff = Number(b.year || 0) - Number(a.year || 0);
        return yDiff !== 0 ? yDiff : Number(b.anime_id || b.id || 0) - Number(a.anime_id || a.id || 0);
      });
    } else if (sortBy === 'Reyting') {
      list.sort((a, b) => Number(b.average_rating || 0) - Number(a.average_rating || 0));
    }

    return list;
  }, [allAnimes, selectedGenre, selectedYear, selectedRating, selectedStatus, sortBy]);

  // Sahifalash (Pagination)
  const totalPages = Math.max(1, Math.ceil(filteredAnimes.length / itemsPerPage));
  const displayedAnimes = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAnimes.slice(start, start + itemsPerPage);
  }, [filteredAnimes, currentPage]);

  const handleResetFilters = () => {
    setSelectedGenre('Barchasi');
    setSelectedYear('Barchasi');
    setSelectedRating('Barchasi');
    setSelectedStatus('Barchasi');
    setSortBy('Mashhurligi');
    setCurrentPage(1);
  };

  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string>>, val: string) => {
    setter(val);
    setCurrentPage(1);
  };

  if (!isInitialLoaded && allAnimes.length === 0) {
    return <div className="min-h-screen" />;
  }

  return (
    <div className="w-full space-y-6 select-none pb-10 animate-in fade-in duration-200">
      {/* 1. Header: Sarlavha va jami anime soni nishoni */}
      <div className="flex items-center gap-3">
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Barcha Animelar
        </h1>
        <span className="px-2.5 py-1 rounded-md bg-[#161822] text-xs text-gray-400 font-semibold border border-white/5 shadow-inner">
          Jami {filteredAnimes.length} ta anime
        </span>
      </div>

      {/* 2. Filter Bar: Janrlar, Yil, Reyting, Holati, Saralash va Tozalash */}
      <div className="p-3 sm:p-4 rounded-xl bg-[#0c0d12] border border-white/5 shadow-lg space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 items-center">
          
          {/* Janrlar Select */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Janrlar</label>
            <select
              value={selectedGenre}
              onChange={(e) => handleFilterChange(setSelectedGenre, e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#14161f] border border-white/10 text-xs text-gray-200 focus:outline-none focus:border-red-600 cursor-pointer"
            >
              <option value="Barchasi">Barcha Janrlar</option>
              {allGenres.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Yil Select */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Yil</label>
            <select
              value={selectedYear}
              onChange={(e) => handleFilterChange(setSelectedYear, e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#14161f] border border-white/10 text-xs text-gray-200 focus:outline-none focus:border-red-600 cursor-pointer"
            >
              <option value="Barchasi">Barchasi</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2020+">2020+</option>
              <option value="2010+">2010+</option>
              <option value="Eski">Eski</option>
            </select>
          </div>

          {/* Reyting Select */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Reyting</label>
            <select
              value={selectedRating}
              onChange={(e) => handleFilterChange(setSelectedRating, e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#14161f] border border-white/10 text-xs text-gray-200 focus:outline-none focus:border-red-600 cursor-pointer"
            >
              <option value="Barchasi">Barchasi</option>
              <option value="9+">9+ A'lo</option>
              <option value="8+">8+ Yaxshi</option>
              <option value="7+">7+ O'rtacha</option>
              <option value="5+">5+ Qoniqarli</option>
            </select>
          </div>

          {/* Holati Select */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Holati</label>
            <select
              value={selectedStatus}
              onChange={(e) => handleFilterChange(setSelectedStatus, e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#14161f] border border-white/10 text-xs text-gray-200 focus:outline-none focus:border-red-600 cursor-pointer"
            >
              <option value="Barchasi">Barchasi</option>
              <option value="Efirda">Efirda</option>
              <option value="Tugallangan">Tugallangan</option>
            </select>
          </div>

          {/* Saralash Select */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Saralash</label>
            <select
              value={sortBy}
              onChange={(e) => handleFilterChange(setSortBy, e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#14161f] border border-white/10 text-xs text-gray-200 focus:outline-none focus:border-red-600 cursor-pointer"
            >
              <option value="Mashhurligi">Mashhurligi</option>
              <option value="Alfavit">Alfavit (A-Z)</option>
              <option value="Yangilik">Yangi qo'shilganlar</option>
              <option value="Reyting">Yuqori reyting</option>
            </select>
          </div>

          {/* Reset Filters Button */}
          <div className="flex flex-col justify-end">
            <button
              onClick={handleResetFilters}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold text-red-500 hover:text-white hover:bg-red-600/20 border border-transparent hover:border-red-600/40 transition-all cursor-pointer active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Filtrlarni tozalash</span>
            </button>
          </div>

        </div>
      </div>

      {/* 3. Anime Kartalar Gridi (Instant Rendering, Zero Glitch) */}
      {displayedAnimes.length === 0 ? (
        <div className="py-16 text-center text-gray-400">
          <p className="text-base font-bold text-gray-200 mb-1">Mos keluvchi animelar topilmadi</p>
          <p className="text-xs text-gray-500">Filtrlarni o'zgartirib ko'ring yoki tozalang</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3 sm:gap-4">
          {displayedAnimes.map((anime) => {
            const id = anime.anime_id || anime.id;
            const title = anime.title_uz || anime.title_en;
            const poster = anime.poster_r2_url || anime.poster;
            const rawRating = Number(anime.average_rating || anime.rating || 0);
            const ratingText = rawRating > 0 ? rawRating.toFixed(1) : '0';
            const isAiring = Number(anime.year) >= 2025;

            const genreNames = Array.isArray(anime.genres)
              ? anime.genres.map((g: any) => (typeof g === 'string' ? g : g.name)).filter(Boolean)
              : [];

            return (
              <Link
                key={id}
                href={`/anime/${id}`}
                className="group/card relative flex flex-col select-none transition-all"
              >
                {/* Poster Container */}
                <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-[#0d0e12] border border-white/5">
                  <img
                    src={poster}
                    alt={title}
                    loading="lazy"
                    className="w-full h-full object-cover object-center group-hover/card:scale-105 transition-transform duration-300 pointer-events-none"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&q=80';
                    }}
                  />

                  {/* Top Badges */}
                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none z-10">
                    {isAiring ? (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-600/90 text-white text-[9px] font-black tracking-wider uppercase shadow-sm">
                        Efirda
                      </span>
                    ) : (
                      <span />
                    )}

                    {rawRating > 0 && (
                      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-sm text-amber-400 text-[10px] font-black border border-white/10 shadow-sm">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{ratingText}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Info under poster */}
                <div className="pt-2 px-0.5 space-y-0.5">
                  <h3
                    className="font-bold text-xs sm:text-sm text-gray-100 truncate group-hover/card:text-red-500 transition-colors"
                    title={title}
                  >
                    {title}
                  </h3>

                  <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
                    <span className="truncate max-w-[120px]">
                      {genreNames.slice(0, 2).join(', ') || 'Anime'}
                    </span>
                    {!isAiring && (
                      <span className="text-[10px] text-red-500 font-semibold shrink-0">
                        Tugallangan
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* 4. Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 pt-8 pb-4 text-xs font-semibold">
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
  );
}
