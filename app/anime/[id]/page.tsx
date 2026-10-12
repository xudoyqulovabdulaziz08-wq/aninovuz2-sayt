import { Suspense } from 'react';
import { animeApi } from '@/lib/api';
import { Play, Star, Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { AnimeCard } from '@/components/anime/AnimeCard';

interface AnimeDetailPageProps {
  params: Promise<{ id: string }>;
}

async function AnimeDetailContent({ params }: AnimeDetailPageProps) {
  const { id } = await params;

  let animeDetail: any = null;
  try {
    animeDetail = await animeApi.getAnimeDetail(id);
  } catch (err) {
    console.error('Failed to load anime detail:', err);
  }

  if (!animeDetail) {
    return (
      <div className="py-20 text-center space-y-4 select-none">
        <h2 className="text-xl font-bold text-gray-200">Anime topilmadi</h2>
        <p className="text-sm text-gray-400">Ushbu anime ma'lumotlar bazasida mavjud emas yoki o'chirilgan.</p>
        <Link
          href="/animes"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs shadow-lg hover:bg-red-500 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Barcha animelarga qaytish
        </Link>
      </div>
    );
  }

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

  return (
    <div className="w-full space-y-8 select-none pb-12">
      {/* 1. Orqaga qaytish havolasi */}
      <div>
        <Link
          href="/animes"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-red-500" />
          <span>Barcha animelar ro'yxatiga qaytish</span>
        </Link>
      </div>

      {/* 2. Asosiy Anime Tafsilotlari Bloki */}
      <div className="relative rounded-2xl overflow-hidden bg-[#0d0e12] border border-white/5 p-4 sm:p-6 lg:p-8 shadow-2xl flex flex-col md:flex-row gap-6 lg:gap-8 items-start">
        {/* Poster */}
        <div className="w-48 sm:w-56 md:w-64 aspect-[3/4] rounded-xl overflow-hidden bg-gray-950 border border-white/10 shrink-0 shadow-2xl mx-auto md:mx-0">
          <img
            src={animeDetail.poster_r2_url || animeDetail.poster}
            alt={animeDetail.title_uz || animeDetail.title_en}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex-1 space-y-4 min-w-0">
          <div>
            <span className="px-2 py-0.5 rounded bg-red-600/20 text-red-400 text-xs font-bold border border-red-600/30 uppercase">
              {animeDetail.type || 'TV SERIES'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2">
              {animeDetail.title_uz || animeDetail.title_en}
            </h1>
            {animeDetail.title_en && animeDetail.title_en !== animeDetail.title_uz && (
              <p className="text-sm text-gray-400 font-medium mt-0.5">
                {animeDetail.title_en}
              </p>
            )}
          </div>

          {/* Badges / Meta */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-300 font-medium">
            <div className="flex items-center gap-1 text-amber-400 font-bold bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>{ratingText} / 10</span>
            </div>

            <div className="flex items-center gap-1 text-gray-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>{animeDetail.year || 2024}</span>
            </div>

            <span>•</span>
            <span>{episodes.length > 0 ? `${episodes.length} qism` : '12 qism'}</span>

            {dubberNames.length > 0 && (
              <>
                <span>•</span>
                <span className="text-emerald-400 font-medium">🎙️ {dubberNames.join(', ')}</span>
              </>
            )}
          </div>

          {/* Janrlar */}
          {genreNames.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
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
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Tavsif</h3>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-2xl">
              {animeDetail.description || 'Ushbu anime uchun tavsif matni kiritilmagan.'}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Epizodlar / Qismlar Ro'yxati */}
      {episodes.length > 0 && (
        <div className="space-y-4">
          <div className="border-l-[3.5px] border-red-600 pl-3">
            <h2 className="text-lg font-bold text-white tracking-tight">
              Barcha qismlar ({episodes.length})
            </h2>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
            {episodes.map((ep: any) => (
              <button
                key={ep.id || ep.episode}
                className="py-3 px-2 rounded-xl bg-[#0d0e12] hover:bg-red-600 border border-white/5 hover:border-red-600 text-xs font-bold text-gray-200 hover:text-white transition-all flex flex-col items-center justify-center gap-1 shadow-sm group"
              >
                <Play className="w-3.5 h-3.5 text-red-500 group-hover:text-white transition-colors" />
                <span>{ep.episode}-qism</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. O'xshash Animelar (Tavsiyalar) */}
      {similar.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="border-l-[3.5px] border-red-600 pl-3">
            <h2 className="text-lg font-bold text-white tracking-tight">
              O'xshash tavsiya etiladigan animelar
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {similar.slice(0, 6).map((item: any) => (
              <AnimeCard key={item.anime_id || item.id} anime={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AnimeDetailSkeleton() {
  return (
    <div className="w-full space-y-8 animate-pulse">
      <div className="h-4 w-40 rounded bg-gray-900" />
      <div className="h-96 rounded-2xl bg-gray-900/60 border border-white/5" />
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-gray-900" />
        ))}
      </div>
    </div>
  );
}

export default function AnimeDetailPage(props: AnimeDetailPageProps) {
  return (
    <Suspense fallback={<AnimeDetailSkeleton />}>
      <AnimeDetailContent {...props} />
    </Suspense>
  );
}

