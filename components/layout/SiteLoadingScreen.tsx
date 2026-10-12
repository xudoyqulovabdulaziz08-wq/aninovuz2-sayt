'use client';

import React, { useState, useEffect } from 'react';
import { useAnimeData } from '@/context/AnimeDataContext';

export const SiteLoadingScreen: React.FC = () => {
  const { isInitialLoaded, loadProgress } = useAnimeData();
  const [displayProgress, setDisplayProgress] = useState(15);
  const [shouldRender, setShouldRender] = useState(true);

  // Silliq progress animatsiyasi
  useEffect(() => {
    const target = isInitialLoaded ? 100 : Math.max(displayProgress, loadProgress);
    const interval = setInterval(() => {
      setDisplayProgress((prev) => {
        if (prev >= target) {
          clearInterval(interval);
          return target;
        }
        return prev + 2;
      });
    }, 20);

    return () => clearInterval(interval);
  }, [loadProgress, isInitialLoaded, displayProgress]);

  // Yuklanish tugagandan so'ng DOM dan butunlay olib tashlash
  useEffect(() => {
    if (isInitialLoaded && displayProgress >= 100) {
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [isInitialLoaded, displayProgress]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#000000] select-none transition-opacity duration-700 ease-out ${
        isInitialLoaded && displayProgress >= 100 ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Ambient background glow */}
      <div className="absolute w-80 h-80 rounded-full bg-red-600/15 blur-3xl pointer-events-none animate-pulse" />

      <div className="relative z-10 flex flex-col items-center max-w-sm px-6">
        {/* LOGO: "Aninovuz" with spinning Shuriken on red 'i' */}
        <div className="flex items-center justify-center tracking-tight mb-8">
          {/* "An" in white */}
          <span className="text-4xl sm:text-5xl font-black text-white font-serif italic drop-shadow-[0_2px_12px_rgba(255,255,255,0.2)]">
            An
          </span>

          {/* "i" with spinning Shuriken */}
          <div className="relative inline-flex flex-col items-center justify-center mx-1 sm:mx-1.5 -mb-1">
            {/* 4-Point Spinning Ninja Shuriken */}
            <div className="animate-spin" style={{ animationDuration: '2.5s' }}>
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 drop-shadow-[0_0_10px_rgba(220,38,38,0.9)]"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M 12 1 C 13.3 7 17 10.7 23 12 C 17 13.3 13.3 17 12 23 C 10.7 17 7 13.3 1 12 C 7 10.7 10.7 7 12 1 Z M 12 8.5 L 15.5 12 L 12 15.5 L 8.5 12 Z"
                />
              </svg>
            </div>

            {/* Red 'i' vertical body */}
            <div className="w-2.5 sm:w-3 h-5 sm:h-6 bg-red-600 rounded-sm mt-1 shadow-[0_0_12px_rgba(220,38,38,0.7)]" />
          </div>

          {/* "novuz" in white */}
          <span className="text-4xl sm:text-5xl font-black text-white font-serif italic drop-shadow-[0_2px_12px_rgba(255,255,255,0.2)]">
            novuz
          </span>
        </div>

        {/* Loading Progress Bar Container */}
        <div className="w-60 sm:w-72 space-y-3 text-center">
          {/* Progress bar */}
          <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-white/10 p-[1px]">
            <div
              className="h-full bg-gradient-to-r from-red-600 via-red-500 to-amber-500 rounded-full transition-all duration-100 ease-out shadow-[0_0_12px_rgba(239,68,68,0.8)]"
              style={{ width: `${displayProgress}%` }}
            />
          </div>

          {/* Status & Percentage */}
          <div className="flex items-center justify-between text-xs font-semibold text-gray-400">
            <span className="tracking-wide">
              {displayProgress >= 100 ? (
                <span className="text-red-500 font-bold">Yuklandi</span>
              ) : (
                <span>Tayyorlanmoqda...</span>
              )}
            </span>
            <span className="text-white font-bold font-mono text-sm">
              {displayProgress}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
