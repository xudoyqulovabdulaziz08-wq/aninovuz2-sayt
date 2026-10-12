'use client';

import React from 'react';
import { useAnimeData } from '@/context/AnimeDataContext';
import { HeroSlider } from '@/components/anime/HeroSlider';
import { AnimeRowSection } from '@/components/anime/AnimeRowSection';
import { AlertCircle } from 'lucide-react';

export default function HomePage() {
  const { homepageData, isInitialLoaded, error } = useAnimeData();

  if (!isInitialLoaded && !homepageData) {
    // Initial yuklanish paytida SiteLoadingScreen to'liq ekranni qoplab turadi, ortda bo'sh turadi
    return <div className="min-h-screen" />;
  }

  if (!homepageData) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-4">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-gray-200">Serverga ulanishda xatolik</h2>
        <p className="text-xs text-gray-400 mt-1 max-w-sm">
          {error || 'Backend ma\'lumotlar bazasi yoki kesh yangilanmoqda. Iltimos qayta urinib ko\'ring.'}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2 select-none animate-in fade-in duration-200">
      {/* 1. Hero Feature Banner Slider */}
      {homepageData.hero_slider && homepageData.hero_slider.length > 0 && (
        <HeroSlider items={homepageData.hero_slider} />
      )}

      {/* 2. 🔥 Trenddagi animelar (Popular) */}
      <AnimeRowSection
        id="popular"
        title="Trenddagi animelar"
        items={homepageData.popular}
        viewAllLink="/animes?sort=Mashhurligi"
        badgeType="HOT"
      />

      {/* 3. 🆕 Yangi animelar (Latest) */}
      <AnimeRowSection
        id="latest"
        title="Yangi animelar"
        items={homepageData.latest}
        viewAllLink="/animes?sort=Yangilik"
        badgeType="NEW"
      />

      {/* 4. 🏆 Eng yaxshi animelar (Top Rated) */}
      <AnimeRowSection
        id="top-rated"
        title="Eng yaxshi animelar"
        items={homepageData.top_rated}
        viewAllLink="/animes?sort=Reyting"
        badgeType="HOT"
      />

      {/* 5. 📺 Anime Seriallar (TV Series) */}
      {homepageData.tv_series && homepageData.tv_series.length > 0 && (
        <AnimeRowSection
          id="tv-series"
          title="Anime Seriallar"
          items={homepageData.tv_series}
          viewAllLink="/animes"
        />
      )}

      {/* 6. 🎬 Anime Filmlar (Movies) */}
      {homepageData.movies && homepageData.movies.length > 0 && (
        <AnimeRowSection
          id="movies"
          title="Anime Filmlar"
          items={homepageData.movies}
          viewAllLink="/animes"
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
