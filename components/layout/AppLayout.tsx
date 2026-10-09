'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
      {/* Top Sticky Header */}
      <Header />

      {/* Main Body with Collapsible Sidebar */}
      <div className="flex-1 flex max-w-[1920px] w-full mx-auto relative">
        {/* Floating Open Handle when sidebar is closed */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="fixed left-0 top-20 z-30 w-6 h-10 rounded-r-xl bg-red-600/20 hover:bg-red-600 border-y border-r border-red-600/40 text-red-400 hover:text-white flex items-center justify-center transition-all shadow-lg backdrop-blur-md active:scale-95 group"
            title="Sidebarni ochish (Klaviaturada: [)"
            aria-label="Sidebarni ochish"
          >
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}

        {/* Left Navigation Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Right Main Page Content */}
        <main className="flex-1 min-w-0 p-3 sm:p-5 lg:p-6 overflow-y-auto transition-all duration-300">
          {children}
        </main>
      </div>
    </div>
  );
};
