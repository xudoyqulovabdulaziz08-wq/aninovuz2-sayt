'use client';

import React from 'react';
import Link from 'next/link';
import { Send, Bot, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="relative w-full -mx-3 sm:-mx-5 lg:-mx-6 px-4 sm:px-8 lg:px-12 mt-16 pt-10 pb-8 bg-[#000000] text-gray-400 select-none overflow-hidden border-t border-white/5">
      {/* 
        "Quyosh chiqqandek" keng qizil nurli chiziq:
        O'rtasi yorqin nur sochadi, butun ekran kengligi bo'ylab cho'zilib, chekkalariga borgan sari silliq yo'qoladi.
      */}
      <div className="absolute top-0 left-0 right-0 h-[3px] flex items-center justify-center pointer-events-none">
        {/* Yumshoq quyosh nuri foni */}
        <div className="absolute -top-12 w-full max-w-5xl h-20 bg-red-600/20 blur-3xl rounded-full" />
        
        {/* Nur chizig'i */}
        <div className="w-full h-[1.5px] bg-gradient-to-r from-transparent via-red-600/80 via-50% to-transparent" />
        
        {/* Markaziy qalinroq nur */}
        <div className="absolute w-2/3 max-w-3xl h-[2.5px] bg-gradient-to-r from-transparent via-red-500 to-transparent" />

        {/* Eng o'rtadagi yorqin yadro */}
        <div className="absolute w-1/4 max-w-md h-[3px] bg-gradient-to-r from-transparent via-red-400 to-transparent" />
      </div>

      <div className="w-full max-w-full mx-auto space-y-7">
        {/* 1. YUQORI BLOK: Tavsif / Shior matni (Rasmning yuqori qizil to'rtburchagi) */}
        <div className="text-center px-2">
          <p className="text-xs sm:text-sm text-gray-300 font-medium leading-relaxed max-w-3xl mx-auto">
            O&apos;zbekistondagi eng sevimli va zamonaviy anime platformasi — sevimli qatorlaringizni o&apos;zbek tilida his qiling.
          </p>
        </div>

        {/* 2. O'RTA BLOK: 2 Ustun - SAHIFALAR va ALOQA (Telefonda, planshetda va kompyuterda tartibli 2 ustun) */}
        <div className="grid grid-cols-2 gap-4 sm:gap-8 max-w-2xl mx-auto py-2">
          
          {/* Chap ustun: SAHIFALAR */}
          <div className="flex flex-col items-start pl-2 sm:pl-6 space-y-2.5">
            <h4 className="text-xs font-bold text-gray-200 uppercase tracking-widest pb-1 border-b border-white/10">
              SAHIFALAR
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors block py-0.5">
                  Bosh sahifa
                </Link>
              </li>
              <li>
                <Link href="/animes" className="text-gray-400 hover:text-white transition-colors block py-0.5">
                  Animelar
                </Link>
              </li>
              <li>
                <Link href="/genres" className="text-gray-400 hover:text-white transition-colors block py-0.5">
                  Janrlar
                </Link>
              </li>
              <li>
                <Link href="/dubbers" className="text-gray-400 hover:text-white transition-colors block py-0.5">
                  Dubberlar
                </Link>
              </li>
            </ul>
          </div>

          {/* O'ng ustun: ALOQA */}
          <div className="flex flex-col items-start pl-2 sm:pl-6 space-y-2.5">
            <h4 className="text-xs font-bold text-gray-200 uppercase tracking-widest pb-1 border-b border-white/10">
              ALOQA
            </h4>
            <div className="space-y-2 w-full">
              <a
                href="https://t.me/Aninovuz"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 sm:gap-2.5 text-xs sm:text-sm text-gray-300 hover:text-white transition-colors group py-0.5"
              >
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#12141c] border border-white/10 flex items-center justify-center text-sky-400 group-hover:border-sky-500/40 group-hover:bg-sky-500/10 transition-all shadow-sm shrink-0">
                  <Send className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>
                <span className="font-medium truncate">Telegram Kanal</span>
              </a>

              <a
                href="https://t.me/Aninovuz_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 sm:gap-2.5 text-xs sm:text-sm text-gray-300 hover:text-white transition-colors group py-0.5"
              >
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#12141c] border border-white/10 flex items-center justify-center text-emerald-400 group-hover:border-emerald-500/40 group-hover:bg-emerald-500/10 transition-all shadow-sm shrink-0">
                  <Bot className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>
                <span className="font-medium truncate">Telegram Bot</span>
              </a>

              <a
                href="mailto:aninovuz@gmail.com"
                className="flex items-center gap-2 sm:gap-2.5 text-xs sm:text-sm text-gray-300 hover:text-white transition-colors group py-0.5"
              >
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#12141c] border border-white/10 flex items-center justify-center text-red-500 group-hover:border-red-500/40 group-hover:bg-red-500/10 transition-all shadow-sm shrink-0">
                  <Mail className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>
                <span className="font-medium text-gray-400 group-hover:text-gray-200 truncate text-[11px] sm:text-xs">
                  aninovuz@gmail.com
                </span>
              </a>
            </div>
          </div>

        </div>

        {/* 3. PASTKI BLOK: Mualliflik huquqi va havolalar (Rasmning pastki qizil to'rtburchaklari) */}
        <div className="pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-gray-500 text-center sm:text-left">
          <div className="text-[11px] sm:text-xs">
            © 2026 <span className="text-gray-200 font-bold">AniNovuz</span>. Barcha huquqlar himoyalangan.
          </div>
          <div className="flex items-center justify-center gap-3 sm:gap-4 text-[11px] sm:text-xs">
            <Link href="/terms" className="hover:text-gray-300 transition-colors">
              Foydalanish shartlari
            </Link>
            <span className="text-gray-700">•</span>
            <Link href="/dmca" className="hover:text-gray-300 transition-colors">
              DMCA / Mualliflar
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
};
