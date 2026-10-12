'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { HomepageData, GenreItem, DubberItem } from '@/types/anime/anime.types';
import { animeApi } from '@/lib/api';

interface AnimeDataContextType {
  homepageData: HomepageData | null;
  allAnimes: any[];
  genres: GenreItem[];
  dubbers: DubberItem[];
  isInitialLoaded: boolean;
  loadProgress: number;
  error: string | null;
}

const AnimeDataContext = createContext<AnimeDataContextType>({
  homepageData: null,
  allAnimes: [],
  genres: [],
  dubbers: [],
  isInitialLoaded: false,
  loadProgress: 0,
  error: null,
});

export const AnimeDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [homepageData, setHomepageData] = useState<HomepageData | null>(null);
  const [allAnimes, setAllAnimes] = useState<any[]>([]);
  const [genres, setGenres] = useState<GenreItem[]>([]);
  const [dubbers, setDubbers] = useState<DubberItem[]>([]);
  const [isInitialLoaded, setIsInitialLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(10);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadAllInitialData = async () => {
      try {
        setLoadProgress(30);

        // 1. Homepage, Barcha animelar, Janrlar va Dubberlarni parallel yuklash
        const [hp, cachedAnimes, gn, db] = await Promise.all([
          animeApi.getHomepage().catch((e) => {
            console.error('Homepage load error:', e);
            return null;
          }),
          animeApi.getAllAnimesCached().catch((e) => {
            console.error('All animes load error:', e);
            return [];
          }),
          animeApi.getGenres().catch((e) => {
            console.error('Genres load error:', e);
            return [];
          }),
          animeApi.getDubbers().catch((e) => {
            console.error('Dubbers load error:', e);
            return [];
          }),
        ]);

        if (!isMounted) return;

        setLoadProgress(80);

        if (hp) setHomepageData(hp);
        if (cachedAnimes && cachedAnimes.length > 0) setAllAnimes(cachedAnimes);
        if (gn && gn.length > 0) setGenres(gn);
        if (db && db.length > 0) setDubbers(db);

        setLoadProgress(100);

        // Kichik silliq o'tish kechikishi
        setTimeout(() => {
          if (isMounted) {
            setIsInitialLoaded(true);
          }
        }, 300);

      } catch (err: any) {
        console.error('Initial data loading failed:', err);
        if (isMounted) {
          setError(err?.message || 'Yuklashda xatolik');
          setIsInitialLoaded(true);
        }
      }
    };

    loadAllInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AnimeDataContext.Provider
      value={{
        homepageData,
        allAnimes,
        genres,
        dubbers,
        isInitialLoaded,
        loadProgress,
        error,
      }}
    >
      {children}
    </AnimeDataContext.Provider>
  );
};

export const useAnimeData = () => useContext(AnimeDataContext);

