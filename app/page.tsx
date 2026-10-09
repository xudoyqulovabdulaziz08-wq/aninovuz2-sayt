import { Suspense } from 'react';
import { animeApi } from '@/lib/api';
import { HeroSlider } from '@/components/anime/HeroSlider';
import { AnimeRowSection } from '@/components/anime/AnimeRowSection';
import { HomepageData } from '@/types/anime/anime.types';
import { AlertCircle } from 'lucide-react';

async function HomeContent() {
  let homepageData: HomepageData | null = null;
  let errorMessage: string | null = null;

  try {
    homepageData = await animeApi.getHomepage();
  } catch (err: any) {
    console.error('Homepage fetch error:', err?.message);
    errorMessage = err?.message || 'Ma\'lumotlarni yuklashda xatolik yuz berdi';
  }

  if (!homepageData) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-4">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-gray-200">Serverga ulanishda xatolik</h2>
        <p className="text-xs text-gray-400 mt-1 max-w-sm">
          {errorMessage || 'Backend ma\'lumotlar bazasi yoki kesh yangilanmoqda. Iltimos qayta urinib ko\'ring.'}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2">
      {/* 1. Hero Feature Banner Slider (Matches Image) */}
      {homepageData.hero_slider && homepageData.hero_slider.length > 0 && (
        <HeroSlider items={homepageData.hero_slider} />
      )}

      {/* 2. 🔥 Trenddagi animelar (Popular) */}
      <AnimeRowSection
        id="popular"
        title="Trenddagi animelar"
        
        items={homepageData.popular}
        viewAllLink="/anime?sort=popular"
        badgeType="HOT"
      />

      {/* 3. 🆕 Yangi animelar (Latest) */}
      <AnimeRowSection
        id="latest"
        title="Yangi animelar"
        
        items={homepageData.latest}
        viewAllLink="/anime?sort=latest"
        badgeType="NEW"
      />

      {/* 4. 🏆 Eng yaxshi animelar (Top Rated) */}
      <AnimeRowSection
        id="top-rated"
        title="Eng yaxshi animelar"
        
        items={homepageData.top_rated}
        viewAllLink="/anime?sort=top_rated"
        badgeType="HOT"
      />

      {/* 5. 📺 Anime Seriallar (TV Series) */}
      {homepageData.tv_series && homepageData.tv_series.length > 0 && (
        <AnimeRowSection
          id="tv-series"
          title="Anime Seriallar"
          
          items={homepageData.tv_series}
          viewAllLink="/anime?type=TV+SERIES"
        />
      )}

      {/* 6. 🎬 Anime Filmlar (Movies) */}
      {homepageData.movies && homepageData.movies.length > 0 && (
        <AnimeRowSection
          id="movies"
          title="Anime Filmlar"
          
          items={homepageData.movies}
          viewAllLink="/movies"
        />
      )}
      
      {/* 7. 🎲 Tasodifiy animelar (Random) */}
      {homepageData.random && homepageData.random.length > 0 && (
        <AnimeRowSection
          id="random"
          title="Tasodifiy animelar"
          
          items={homepageData.random}
        />
      )}
    </div>
  );
}

function HomeSkeleton() {
  return (
    <div className="w-full animate-pulse space-y-8">
      {/* Hero Banner Skeleton */}
      <div className="w-full h-80 sm:h-96 rounded-3xl bg-[#13151f] border border-white/5" />

      {/* Row Section Skeletons */}
      {Array.from({ length: 3 }).map((_, secIdx) => (
        <div key={secIdx} className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="h-6 w-40 rounded-lg bg-[#181a26]" />
            <div className="h-4 w-24 rounded-lg bg-[#181a26]" />
          </div>
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 6 }).map((_, cardIdx) => (
              <div
                key={cardIdx}
                className="w-36 sm:w-44 md:w-48 aspect-[3/4] rounded-2xl bg-[#13151f] shrink-0 border border-white/5"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomeSkeleton />}>
      <HomeContent />
    </Suspense>
  );
}
