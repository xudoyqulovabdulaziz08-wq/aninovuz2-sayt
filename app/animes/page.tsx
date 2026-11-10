'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Star, 
  RotateCcw, 
  SlidersHorizontal, 
  X, 
  ChevronDown, 
  Radio, 
  CheckCircle2, 
  Flame, 
  Sparkles, 
  ArrowDownAZ 
} from 'lucide-react';
import { useAnimeData } from '@/context/AnimeDataContext';

export default function AnimesPage() {
  const { allAnimes, isInitialLoaded } = useAnimeData();

  // Filters State
  const [selectedGenre, setSelectedGenre] = useState<string>('Barchasi');
  const [selectedYear, setSelectedYear] = useState<string>('Barchasi');
  const [selectedRating, setSelectedRating] = useState<string>('Barchasi');
  const [selectedStatus, setSelectedStatus] = useState<string>('Barchasi');
  const [sortBy, setSortBy] = useState<string>('Mashhurligi');

  // Mobil filtrlar paneli (Bottom Sheet / Drawer) holati
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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

    // 4. Holati bo'yicha filter (is_finished asosida to'g'irlandi)
    if (selectedStatus !== 'Barchasi') {
      if (selectedStatus === 'Efirda') {
        list = list.filter((item) => item.is_finished === false);
      } else if (selectedStatus === 'Tugallangan') {
        list = list.filter((item) => item.is_finished === true);
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

  // Faol filtrlar sonini hisoblash
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedGenre !== 'Barchasi') count++;
    if (selectedYear !== 'Barchasi') count++;
    if (selectedRating !== 'Barchasi') count++;
    if (selectedStatus !== 'Barchasi') count++;
    if (sortBy !== 'Mashhurligi') count++;
    return count;
  }, [selectedGenre, selectedYear, selectedRating, selectedStatus, sortBy]);

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
    <div className="w-full space-y-4 sm:space-y-6 select-none pb-12 animate-in fade-in duration-200">
      {/* 1. Header: Sarlavha, jami soni va Mobil Filtr tugmasi */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Barcha Animelar
          </h1>
          <span className="px-2.5 py-0.5 rounded-full bg-red-600/15 text-[11px] text-red-400 font-bold border border-red-500/20">
            {filteredAnimes.length} ta
          </span>
        </div>

        {/* Mobil uchun asosiy "Filtrlar" tugmasi */}
        <button
          onClick={() => setIsFilterOpen(true)}
          className="md:hidden flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#14161f] border border-white/10 hover:border-red-500/40 text-xs font-bold text-white shadow-lg active:scale-95 transition-all cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-red-500" />
          <span>Filtrlar</span>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center shadow-sm">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* 2. MOBIL TEZKOR FILTRLAR (Gorizontal skroll bo'ladigan pilla tugmalar) */}
      <div className="md:hidden flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs">
        {/* Holat: Barchasi */}
        <button
          onClick={() => handleFilterChange(setSelectedStatus, 'Barchasi')}
          className={`shrink-0 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer active:scale-95 ${
            selectedStatus === 'Barchasi'
              ? 'bg-red-600 border-red-500 text-white font-bold shadow-md shadow-red-600/25'
              : 'bg-[#14161f] border-white/5 text-gray-400 hover:text-white'
          }`}
        >
          Barchasi
        </button>

        {/* Holat: Efirda */}
        <button
          onClick={() => handleFilterChange(setSelectedStatus, 'Efirda')}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer active:scale-95 ${
            selectedStatus === 'Efirda'
              ? 'bg-red-600 border-red-500 text-white font-bold shadow-md shadow-red-600/25'
              : 'bg-[#14161f] border-white/5 text-gray-400 hover:text-white'
          }`}
        >
          <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span>Efirda</span>
        </button>

        {/* Holat: Tugallangan */}
        <button
          onClick={() => handleFilterChange(setSelectedStatus, 'Tugallangan')}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer active:scale-95 ${
            selectedStatus === 'Tugallangan'
              ? 'bg-red-600 border-red-500 text-white font-bold shadow-md shadow-red-600/25'
              : 'bg-[#14161f] border-white/5 text-gray-400 hover:text-white'
          }`}
        >
          <CheckCircle2 className="w-3 h-3 text-red-400" />
          <span>Tugallangan</span>
        </button>

        {/* Tezkor saralash tugmasi */}
        <button
          onClick={() => setIsFilterOpen(true)}
          className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl border border-white/10 bg-[#14161f] text-gray-300 hover:text-white text-xs font-medium cursor-pointer"
        >
          <span>Saralash: <strong className="text-white">{sortBy}</strong></span>
          <ChevronDown className="w-3 h-3 text-gray-400" />
        </button>

        {/* Janr tanlangan bo'lsa */}
        {selectedGenre !== 'Barchasi' && (
          <button
            onClick={() => handleFilterChange(setSelectedGenre, 'Barchasi')}
            className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-600/15 border border-red-500/30 text-red-400 text-xs font-bold"
          >
            <span>{selectedGenre}</span>
            <X className="w-3 h-3" />
          </button>
        )}

        {/* Agar birorta filtr faol bo'lsa, tozalash tugmasi */}
        {activeFilterCount > 0 && (
          <button
            onClick={handleResetFilters}
            className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-red-600/10 border border-red-500/20 text-red-400 hover:text-white hover:bg-red-600 text-xs font-bold transition-all cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Tozalash</span>
          </button>
        )}
      </div>

      {/* Faol filtrlar ko'rsatkichi (Mobilda qaysi filtrlar yoqilganini ko'rsatib turadi) */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 text-xs pt-0.5">
          <span className="text-[11px] text-gray-500 font-semibold mr-1">Faol:</span>
          {selectedGenre !== 'Barchasi' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-600/15 border border-red-500/30 text-red-400 font-medium">
              Janr: {selectedGenre}
              <button onClick={() => setSelectedGenre('Barchasi')} className="hover:text-white"><X className="w-3 h-3" /></button>
            </span>
          )}
          {selectedYear !== 'Barchasi' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-600/15 border border-red-500/30 text-red-400 font-medium">
              Yil: {selectedYear}
              <button onClick={() => setSelectedYear('Barchasi')} className="hover:text-white"><X className="w-3 h-3" /></button>
            </span>
          )}
          {selectedRating !== 'Barchasi' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-400/15 border border-amber-400/30 text-amber-400 font-medium">
              Reyting: {selectedRating}
              <button onClick={() => setSelectedRating('Barchasi')} className="hover:text-white"><X className="w-3 h-3" /></button>
            </span>
          )}
          {selectedStatus !== 'Barchasi' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-600/15 border border-red-500/30 text-red-400 font-medium">
              Holat: {selectedStatus}
              <button onClick={() => setSelectedStatus('Barchasi')} className="hover:text-white"><X className="w-3 h-3" /></button>
            </span>
          )}
          {sortBy !== 'Mashhurligi' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 border border-white/10 text-gray-200 font-medium">
              {sortBy}
              <button onClick={() => setSortBy('Mashhurligi')} className="hover:text-white"><X className="w-3 h-3" /></button>
            </span>
          )}
        </div>
      )}

      {/* 3. DESKTOP VA PLANSHET FILTER BAR (hidden md:block - Maxsus chiroyli uslublangan) */}
      <div className="hidden md:block p-4 rounded-2xl bg-[#0c0d12] border border-white/5 shadow-xl space-y-3">
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 items-center">
          
          {/* Janrlar */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Janrlar</label>
            <div className="relative">
              <select
                value={selectedGenre}
                onChange={(e) => handleFilterChange(setSelectedGenre, e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-2 rounded-xl bg-[#14161f] border border-white/10 text-xs text-gray-200 focus:outline-none focus:border-red-600 hover:border-white/20 transition-all cursor-pointer"
              >
                <option value="Barchasi">Barcha Janrlar</option>
                {allGenres.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Yil */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Yil</label>
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => handleFilterChange(setSelectedYear, e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-2 rounded-xl bg-[#14161f] border border-white/10 text-xs text-gray-200 focus:outline-none focus:border-red-600 hover:border-white/20 transition-all cursor-pointer"
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
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Reyting */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Reyting</label>
            <div className="relative">
              <select
                value={selectedRating}
                onChange={(e) => handleFilterChange(setSelectedRating, e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-2 rounded-xl bg-[#14161f] border border-white/10 text-xs text-gray-200 focus:outline-none focus:border-red-600 hover:border-white/20 transition-all cursor-pointer"
              >
                <option value="Barchasi">Barchasi</option>
                <option value="9+">9+ A'lo</option>
                <option value="8+">8+ Yaxshi</option>
                <option value="7+">7+ O'rtacha</option>
                <option value="5+">5+ Qoniqarli</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Holati */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Holati</label>
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => handleFilterChange(setSelectedStatus, e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-2 rounded-xl bg-[#14161f] border border-white/10 text-xs text-gray-200 focus:outline-none focus:border-red-600 hover:border-white/20 transition-all cursor-pointer"
              >
                <option value="Barchasi">Barchasi</option>
                <option value="Efirda">Efirda</option>
                <option value="Tugallangan">Tugallangan</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Saralash */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Saralash</label>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => handleFilterChange(setSortBy, e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-2 rounded-xl bg-[#14161f] border border-white/10 text-xs text-gray-200 focus:outline-none focus:border-red-600 hover:border-white/20 transition-all cursor-pointer"
              >
                <option value="Mashhurligi">Mashhurligi</option>
                <option value="Yangilik">Yangi qo'shilganlar</option>
                <option value="Reyting">Yuqori reyting</option>
                <option value="Alfavit">Alfavit (A-Z)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Tozalash tugmasi */}
          <div className="flex flex-col justify-end">
            <button
              onClick={handleResetFilters}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-red-500 hover:text-white hover:bg-red-600/20 border border-transparent hover:border-red-600/40 transition-all cursor-pointer active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Tozalash</span>
            </button>
          </div>

        </div>
      </div>

      {/* 4. MOBIL UCHUN PASTKI FILTRLAR PANELI (BOTTOM SHEET DRAWER) */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end bg-black/80 backdrop-blur-sm md:hidden animate-in fade-in duration-200">
          {/* Tashqi fonga bosganda yopilish */}
          <div className="flex-1" onClick={() => setIsFilterOpen(false)} />

          {/* Panel qutisi */}
          <div className="w-full max-h-[85vh] rounded-t-3xl bg-[#0d0e14] border-t border-white/10 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-red-500" />
                <h3 className="text-base font-bold text-white">Filtrlar</h3>
                {activeFilterCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[11px] font-black">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Mazmuni */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 no-scrollbar">
              {/* 1. Holati */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Holati</label>
                <div className="flex flex-wrap gap-2">
                  {(['Barchasi', 'Efirda', 'Tugallangan'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleFilterChange(setSelectedStatus, st)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedStatus === st
                          ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                          : 'bg-[#161824] text-gray-300 border border-white/5'
                      }`}
                    >
                      {st === 'Efirda' ? (
                        <>
                          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                          <span>Efirda</span>
                        </>
                      ) : st === 'Tugallangan' ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-red-400" />
                          <span>Tugallangan</span>
                        </>
                      ) : (
                        <span>Barchasi</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Saralash */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Saralash usuli</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: 'Mashhurligi', label: 'Mashhurligi', Icon: Flame, color: 'text-red-500' },
                    { val: 'Yangilik', label: 'Yangi qo\'shilganlar', Icon: Sparkles, color: 'text-amber-400' },
                    { val: 'Reyting', label: 'Yuqori reyting', Icon: Star, color: 'text-amber-400' },
                    { val: 'Alfavit', label: 'Alfavit (A-Z)', Icon: ArrowDownAZ, color: 'text-blue-400' },
                  ].map(({ val, label, Icon, color }) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleFilterChange(setSortBy, val)}
                      className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-left transition-all cursor-pointer ${
                        sortBy === val
                          ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                          : 'bg-[#161824] text-gray-300 border border-white/5 hover:border-white/10'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${sortBy === val ? 'text-white' : color}`} />
                      <span className="truncate">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Reyting */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Reyting</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { val: 'Barchasi', label: 'Barchasi', hasStar: false },
                    { val: '9+', label: '9+ A\'lo', hasStar: true },
                    { val: '8+', label: '8+ Yaxshi', hasStar: true },
                    { val: '7+', label: '7+ O\'rtacha', hasStar: true },
                    { val: '5+', label: '5+', hasStar: true },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => handleFilterChange(setSelectedRating, item.val)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedRating === item.val
                          ? 'bg-amber-400 text-black font-black shadow-lg shadow-amber-400/25'
                          : 'bg-[#161824] text-gray-300 border border-white/5'
                      }`}
                    >
                      {item.hasStar && (
                        <Star className={`w-3 h-3 ${selectedRating === item.val ? 'fill-black text-black' : 'fill-amber-400 text-amber-400'}`} />
                      )}
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Yil */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ishlab chiqarilgan yili</label>
                <div className="flex flex-wrap gap-1.5">
                  {['Barchasi', '2026', '2025', '2024', '2023', '2022', '2020+', '2010+', 'Eski'].map((y) => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => handleFilterChange(setSelectedYear, y)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedYear === y
                          ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                          : 'bg-[#161824] text-gray-300 border border-white/5'
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Janrlar */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Janrlar</label>
                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto no-scrollbar p-0.5">
                  <button
                    type="button"
                    onClick={() => handleFilterChange(setSelectedGenre, 'Barchasi')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedGenre === 'Barchasi'
                        ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                        : 'bg-[#161824] text-gray-300 border border-white/5'
                    }`}
                  >
                    Barcha Janrlar
                  </button>
                  {allGenres.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => handleFilterChange(setSelectedGenre, g)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedGenre === g
                          ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                          : 'bg-[#161824] text-gray-300 border border-white/5'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Harakatlar */}
            <div className="p-4 border-t border-white/10 bg-[#0d0e14] flex items-center gap-3 shrink-0">
              {activeFilterCount > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Tozalash</span>
                </button>
              )}
              <button
                onClick={() => setIsFilterOpen(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 flex items-center justify-center transition-all cursor-pointer active:scale-95"
              >
                Natijalarni ko'rish ({filteredAnimes.length} ta)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Anime Kartalar Gridi */}
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
            
            // is_finished asosida efirda ekanligini aniqlash (false bo'lsa efirda)
            const isAiring = anime.is_finished === false;

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