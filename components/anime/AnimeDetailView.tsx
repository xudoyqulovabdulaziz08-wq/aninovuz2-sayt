'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Play, Star, Calendar, ArrowLeft, Award, MessageSquare, Send, Sparkles, Mic } from 'lucide-react';
import Link from 'next/link';
import { AnimeRowSection } from '@/components/anime/AnimeRowSection';
import { getPosterUrl, handlePosterError } from '@/lib/poster';

interface AnimeDetailViewProps {
  animeDetail: any;
}

export function AnimeDetailView({ animeDetail }: AnimeDetailViewProps) {
  const router = useRouter();

  // Baholash va izohlar state-lari
  const [selectedRating, setSelectedRating] = React.useState<number | null>(null);
  const [commentText, setCommentText] = React.useState('');

  // Zamonaviy bildirishnoma (Toast) holati — alert() o'rniga
  const [toast, setToast] = React.useState<{ message: string; visible: boolean } | null>(null);

  const showToast = (message: string) => {
    setToast({ message, visible: true });
  };

  React.useEffect(() => {
    if (toast?.visible) {
      const timer = setTimeout(() => {
        setToast((prev) => (prev ? { ...prev, visible: false } : null));
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleBack = () => {
    if (
      typeof window !== 'undefined' &&
      window.history.length > 1 &&
      document.referrer &&
      document.referrer.includes(window.location.host)
    ) {
      router.back();
    } else {
      router.push('/');
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) {
      showToast("Iltimos, avval izoh matnini yozing!");
      return;
    }
    showToast("Rahmat! Izohlar tizimi tez kunda to'liq ishga tushadi.");
    setCommentText('');
  };

  const rawRating = Number(animeDetail.average_rating || animeDetail.rating || 0);
  const ratingText = rawRating > 0 ? rawRating.toFixed(1) : '0';

  const genreNames = Array.isArray(animeDetail.genres)
    ? animeDetail.genres.map((g: any) => (typeof g === 'string' ? g : g.name)).filter(Boolean)
    : [];

  const dubberNames = Array.isArray(animeDetail.dubbers)
    ? animeDetail.dubbers.map((d: any) => (typeof d === 'string' ? d : d.name)).filter(Boolean)
    : [];

  const episodes = Array.isArray(animeDetail.episodes) ? animeDetail.episodes : [];
  const similar = Array.isArray(animeDetail.similar_animes) ? animeDetail.similar_animes : [];
  const similarItems = similar.map((item: any) => ({
    ...item,
    anime_id: item.anime_id || item.id,
  }));

  const posterSrc = getPosterUrl(animeDetail);
  const animeTitle = animeDetail.title_uz || animeDetail.title_en || 'Anime';

  return (
    <div className="w-full space-y-6 sm:space-y-8 select-none pb-14">
      {/* 1. Orqaga qaytish tugmasi */}
      <div>
        <button
          onClick={handleBack}
          type="button"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 hover:text-white transition-all cursor-pointer border border-white/5 active:scale-95 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-red-500" />
          <span>Orqaga</span>
        </button>
      </div>

      {/* 2. Asosiy Anime Tafsilotlari Bloki */}

      {/* MOBIL VERSIYA (md:hidden): 
          1. Rasm to'liq o'lchamda.
          2. Ma'lumotlar joyi rasmni yarmigacha yopib turadi (-mt orqali), qoraroq va blur effektli.
          3. Tavsif (Tasnif) rasm ustiga chiqmaydi, undan pastga tushadi. */}
      <div className="md:hidden space-y-3">
        {/* Rasm va uning pastki yarmidagi ma'lumotlar bloki */}
        <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#0c0d12]">
          {/* 1. To'liq o'lchamdagi Poster rasm */}
          <div className="w-full aspect-[3/4] max-h-[480px] overflow-hidden bg-gray-950">
            <img
              src={posterSrc}
              alt={`${animeTitle} o'zbek tilida poster`}
              className="w-full h-full object-cover object-top"
              loading="eager"
              onError={handlePosterError}
            />
          </div>

          {/* 2. Ma'lumotlar joyi */}
          <div className="relative -mt-52 z-10 p-4 sm:p-5 bg-gradient-to-t from-[#0c0d12] from-40% via-[#0c0d12]/95 to-transparent backdrop-blur-[3px] flex flex-col gap-3.5">
            <div>
              <span className="px-2.5 py-0.5 rounded-md bg-red-600/35 text-red-300 text-[11px] font-black border border-red-500/35 uppercase tracking-wide backdrop-blur-md">
                {animeDetail.type || 'TV SERIES'}
              </span>
              {/* Mobil uchun asosiy H1 sarlavha */}
              <h1 className="text-2xl font-black text-white tracking-tight mt-2 leading-tight drop-shadow-md">
                {animeDetail.title_uz || animeDetail.title_en}
              </h1>
              {animeDetail.title_en && animeDetail.title_en !== animeDetail.title_uz && (
                <p className="text-xs text-gray-300 font-medium mt-1 drop-shadow-sm">
                  {animeDetail.title_en}
                </p>
              )}
            </div>

            {/* Badges / Meta */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-200 font-medium">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold bg-amber-400/20 backdrop-blur-md px-2.5 py-1 rounded-lg border border-amber-400/30">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{ratingText} / 10</span>
              </div>

              <div className="flex items-center gap-1 text-gray-200 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                <Calendar className="w-3.5 h-3.5 text-gray-300" />
                <span>{animeDetail.year || 2024}</span>
              </div>

              <div className="flex items-center gap-1 text-gray-200 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                <span>{episodes.length > 0 ? `${episodes.length} qism` : '12 qism'}</span>
              </div>

              {dubberNames.length > 0 && (
                <div className="flex items-center gap-1 text-emerald-300 bg-emerald-500/20 backdrop-blur-md px-2.5 py-1 rounded-lg border border-emerald-400/30 font-medium">
                  <Mic className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{dubberNames.join(', ')}</span>
                </div>
              )}
            </div>

            {/* Janrlar */}
            {genreNames.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {genreNames.map((genre: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/15 text-xs text-gray-200 font-medium shadow-sm"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {/* Tomosha qilish tugmasi */}
            <div className="pt-1">
              <Link
                href={`https://t.me/Aninovuz_bot?start=${animeDetail.anime_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-bold text-sm shadow-xl shadow-red-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Tomosha qilish</span>
              </Link>
            </div>
          </div>
        </div>

        {/* MOBIL: Tavsif (Tasnif) qismi */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0c0d12] border border-white/5 shadow-xl space-y-2">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tavsif</h2>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            {animeDetail.description || 'Ushbu anime uchun tavsif matni kiritilmagan.'}
          </p>
        </div>
      </div>

      {/* DESKTOP VA PLANSHET VERSIYA (hidden md:flex):
          Chapda poster va tugma, o'ngda barcha ma'lumotlar va tavsif */}
      <div className="hidden md:flex relative rounded-3xl overflow-hidden bg-[#0d0e12] border border-white/5 p-6 lg:p-8 shadow-2xl flex-row gap-6 lg:gap-8 items-start">
        {/* Chap ustun: Poster va tugma */}
        <div className="w-56 lg:w-64 shrink-0 flex flex-col gap-3.5">
          <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden bg-gray-950 border border-white/10 shadow-2xl">
            <img
              src={posterSrc}
              alt={`${animeTitle} o'zbek tilida poster`}
              className="w-full h-full object-cover"
              loading="eager"
              onError={handlePosterError}
            />
          </div>

          <Link
            href={`https://t.me/Aninovuz_bot?start=${animeDetail.anime_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold text-sm shadow-xl shadow-red-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Tomosha qilish</span>
          </Link>
        </div>

        {/* O'ng ustun: Ma'lumotlar va Tavsif */}
        <div className="flex-1 space-y-4 min-w-0">
          <div>
            <span className="px-2.5 py-0.5 rounded-md bg-red-600/30 text-red-400 text-xs font-black border border-red-500/30 uppercase tracking-wide">
              {animeDetail.type || 'TV SERIES'}
            </span>
            {/* Desktop sarlavha: yagona semantik h1 saqlash uchun hidden md:block */}
            <div className="text-3xl lg:text-4xl font-black text-white tracking-tight mt-2 leading-tight">
              {animeDetail.title_uz || animeDetail.title_en}
            </div>
            {animeDetail.title_en && animeDetail.title_en !== animeDetail.title_uz && (
              <p className="text-sm text-gray-400 font-medium mt-1">
                {animeDetail.title_en}
              </p>
            )}
          </div>

          {/* Badges / Meta */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-300 font-medium">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{ratingText} / 10</span>
            </div>

            <div className="flex items-center gap-1 text-gray-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{animeDetail.year || 2024}</span>
            </div>

            <div className="flex items-center gap-1 text-gray-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
              <span>{episodes.length > 0 ? `${episodes.length} qism` : '12 qism'}</span>
            </div>

            {dubberNames.length > 0 && (
              <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-lg border border-emerald-400/20 font-medium">
                <Mic className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{dubberNames.join(', ')}</span>
              </div>
            )}
          </div>

          {/* Janrlar */}
          {genreNames.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {genreNames.map((genre: string, idx: number) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-[#14161f] border border-white/10 text-xs text-gray-300 font-medium"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          {/* Tavsif */}
          <div className="pt-2">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Tavsif</h2>
            <p className="text-sm text-gray-300 leading-relaxed max-w-3xl">
              {animeDetail.description || 'Ushbu anime uchun tavsif matni kiritilmagan.'}
            </p>
          </div>
        </div>
      </div>

      {/* 3. O'xshash Animelar (Bir qatorda gorizontal skroll) */}
      {similarItems.length > 0 && (
        <AnimeRowSection
          id="similar-animes"
          title="O'xshash animelar"
          items={similarItems}
          badgeType="AUTO"
        />
      )}

      {/* 4. Baholash va reyting qo'yish (Telefonga ixcham va qulay) */}
      <div className="p-4 sm:p-5 md:p-6 rounded-2xl bg-[#0c0d12] border border-white/5 shadow-xl space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400 shrink-0" />
            <h2 className="text-sm sm:text-base md:text-lg font-bold text-white tracking-tight">
              Baho berish
            </h2>
          </div>
          {selectedRating && (
            <span className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-lg border border-amber-400/20">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>Bahoingiz: {selectedRating} / 10</span>
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400">
          1 dan 10 gacha bo'lgan shkala bo'yicha o'z bahoingizni qoldiring:
        </p>
        
        {/* Mobilda 5 tadan 2 qator, planshet va noutbukda bir tekis qator */}
        <div className="grid grid-cols-5 sm:flex sm:flex-wrap items-center gap-1.5 sm:gap-2 pt-1">
          {Array.from({ length: 10 }).map((_, index) => {
            const score = index + 1;
            const isSelected = selectedRating === score;
            return (
              <button
                key={score}
                type="button"
                onClick={() => {
                  setSelectedRating(score);
                  showToast(`Siz ${score}/10 baho berdingiz! Reytinglar tizimi tez kunda ishga tushadi.`);
                }}
                className={`h-10 sm:w-10 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer active:scale-90 border ${
                  isSelected
                    ? 'bg-amber-400 text-black border-amber-300 shadow-lg shadow-amber-400/30'
                    : 'bg-[#14161f] border-white/10 hover:border-amber-400/50 hover:bg-amber-400/10 text-gray-300 hover:text-amber-400'
                }`}
                title={`${score} baho berish`}
              >
                {score}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Izoh qoldirish (Ixcham va qulay UI) */}
      <div className="p-4 sm:p-5 md:p-6 rounded-2xl bg-[#0c0d12] border border-white/5 shadow-xl space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-red-500 shrink-0" />
          <h2 className="text-sm sm:text-base md:text-lg font-bold text-white tracking-tight">
            Izoh qoldirish
          </h2>
        </div>
        <p className="text-xs text-gray-400">
          Anime haqida o'z fikr va taassurotlaringizni qoldiring:
        </p>

        <form onSubmit={handleCommentSubmit} className="space-y-3">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="O'z fikringizni yozing..."
            rows={3}
            className="w-full p-3 rounded-xl bg-[#14161f] border border-white/10 text-xs sm:text-sm text-gray-200 placeholder:text-gray-500 resize-none focus:outline-none focus:border-red-500/50 transition-colors"
          />
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <span className="text-[11px] text-gray-500">
              * Izohlar tez kunda avtomatik moderatsiya bilan saqlanadi
            </span>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/20 transition-all cursor-pointer active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Izoh yuborish</span>
            </button>
          </div>
        </form>
      </div>

      {/* 6. Foydalanuvchi izohlari ro'yxati */}
      <div className="space-y-3 sm:space-y-4 pt-1">
        <div className="border-l-[3.5px] border-red-600 pl-3">
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Foydalanuvchi izohlari
          </h2>
        </div>
        <div className="p-5 sm:p-6 rounded-2xl bg-[#0c0d12] border border-white/5 text-center space-y-1.5">
          <p className="text-xs sm:text-sm font-bold text-gray-300">Hozircha izohlar mavjud emas</p>
          <p className="text-[11px] sm:text-xs text-gray-500 max-w-md mx-auto">
            Birinchi bo'lib fikringizni qoldiring! To'liq muhokamalar bo'limi tez kunda ishga tushadi.
          </p>
        </div>
      </div>

      {/* 7. Toast Bildirishnoma (Browser alert o'rniga zamonaviy pop-up) */}
      {toast?.visible && (
        <div className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-50 max-w-[92vw] sm:max-w-md w-full px-4 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#14161f]/95 border border-white/15 shadow-[0_10px_35px_rgba(0,0,0,0.8)] backdrop-blur-xl text-white text-xs sm:text-sm font-medium">
            <div className="w-7 h-7 rounded-lg bg-red-600/20 text-red-400 flex items-center justify-center shrink-0 border border-red-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="leading-snug">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
