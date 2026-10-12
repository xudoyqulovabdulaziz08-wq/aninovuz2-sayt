'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { ChevronRight } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { Footer } from './Footer';
import { SiteLoadingScreen } from './SiteLoadingScreen';
import { AnimeDataProvider } from '@/context/AnimeDataContext';
import { AuthProvider } from '@/context/AuthContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

const LayoutInner: React.FC<AppLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const isAuthPage = pathname === '/auth/login' || pathname === '/login';

  // Keyboard shortcut to toggle sidebar: '[' or 'Alt + b'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }
      if (e.key === '[' || (e.altKey && e.key.toLowerCase() === 'b')) {
        e.preventDefault();
        setIsSidebarOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#000000] text-gray-100 transition-colors duration-200">
      {/* Initial Global Loading Screen on F5 / first visit */}
      <SiteLoadingScreen />

      {/* Top Sticky Header */}
      <Header isAuthPage={isAuthPage} />

      {/* Main Body with Collapsible Sidebar */}
      <div className={`flex-1 flex max-w-[1920px] w-full mx-auto relative ${isAuthPage ? 'justify-center items-center' : ''}`}>
        {/* Floating Open Handle when sidebar is closed (Desktop only, non-auth pages) */}
        {!isAuthPage && !isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="hidden lg:flex fixed left-0 top-20 z-30 w-6 h-10 rounded-r-xl bg-red-600/20 hover:bg-red-600 border-y border-r border-red-600/40 text-red-400 hover:text-white items-center justify-center transition-all shadow-lg backdrop-blur-md active:scale-95 group"
            title="Sidebarni ochish (Klaviaturada: [)"
            aria-label="Sidebarni ochish"
          >
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}

        {/* Left Navigation Sidebar (Desktop only, non-auth pages) */}
        {!isAuthPage && (
          <Suspense fallback={<aside className="hidden lg:block w-56 shrink-0 bg-[#000000]" />}>
            <Sidebar
              isOpen={isSidebarOpen}
              onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            />
          </Suspense>
        )}

        {/* Right Main Page Content */}
        <main
          className={`flex-1 min-w-0 flex flex-col ${
            isAuthPage ? 'p-2 sm:p-4 w-full' : 'p-3 sm:p-5 lg:p-6 pb-24 lg:pb-6 overflow-y-auto'
          } transition-all duration-300`}
        >
          <div className="flex-1 flex flex-col">
            {children}
          </div>
          {!isAuthPage && <Footer />}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (4 items, non-auth pages) */}
      {!isAuthPage && (
        <Suspense fallback={<nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-[#000000] border-t border-white/10 h-16" />}>
          <BottomNav />
        </Suspense>
      )}
    </div>
  );
};

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <AuthProvider>
      <AnimeDataProvider>
        <Suspense fallback={<div className="min-h-screen bg-[#000000]" />}>
          <LayoutInner>{children}</LayoutInner>
        </Suspense>
      </AnimeDataProvider>
    </AuthProvider>
  );
};
