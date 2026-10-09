'use client';

import React from 'react';
import Link from 'next/link';
import { Send, Bot, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="relative w-full -mx-3 sm:-mx-5 lg:-mx-6 px-4 sm:px-8 lg:px-12 mt-16 pt-12 pb-8 bg-[#000000] text-gray-400 select-none overflow-hidden border-t border-white/5">
      {/* 
        "Quyosh chiqqandek" keng qizil nurli chiziq:
        O'rtasi qalin va yorqin nur sochadi, butun ekran kengligi bo'ylab cho'zilib, chekkalariga borgan sari silliq yo'qoladi.
      */}
      <div className="absolute top-0 left-0 right-0 h-[3px] flex items-center justify-center pointer-events-none">
        {/* Katta yumshoq quyosh nuri foni */}
        <div className="absolute -top-14 w-full max-w-6xl h-24 bg-red-600/20 blur-3xl rounded-full" />
        
        {/* Butun kenglik bo'ylab cho'zilgan nur chizig'i - chekkalari sekin yo'qoladi */}
        <div className="w-full h-[1.5px] bg-gradient-to-r from-transparent via-red-600/80 via-50% to-transparent shadow-[0_0_0px_rgba(239,68,68,0.8)]" />
        
        {/* Markaziy kengroq va qalinroq quyosh nuri */}
        <div className="absolute w-3/4 max-w-4xl h-[2.5px] bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_0px_0px_rgba(239,68,68,0.9)]" />

        {/* Eng o'rtadagi o'ta yorqin yadro */}
        <div className="absolute w-1/3 max-w-lg h-[3px] bg-gradient-to-r from-transparent via-red-400 to-transparent shadow-[0_0_0px_0px_rgba(255,100,100,1)]" />
      </div>

      <div className="w-full max-w-[1920px] mx-auto">
        {/* 1. Asosiy 3 ustunli qism - keng cho'zilgan tartib */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 pb-10">
          
          {/* 1-ustun: Logotip va Ta'rif (Chap tomon) */}
          <div className="md:col-span-5 lg:col-span-5 space-y-4">
            <Link href="/" className="inline-block group">
              <img
                src="/logos.png"
                alt="AniNovuz"
                className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </Link>
            <p className="text-xs sm:text-sm text-gray-400 max-w-md leading-relaxed">
              O&apos;zbekistondagi eng sevimli va zamonaviy anime platformasi — sevimli qatorlaringizni o&apos;zbek tilida his qiling.
            </p>
          </div>

          {/* 2-ustun: Sahifalar (O'rta tomon) */}
          <div className="md:col-span-3 lg:col-span-3 space-y-3 md:pl-6 lg:pl-10">
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-widest">
              SAHIFALAR
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Bosh sahifa
                </Link>
              </li>
              <li>
                <Link href="/anime" className="hover:text-white transition-colors">
                  Animelar
                </Link>
              </li>
              <li>
                <Link href="/genres" className="hover:text-white transition-colors">
                  Janrlar
                </Link>
              </li>
              <li>
                <Link href="/dubbers" className="hover:text-white transition-colors">
                  Dubblerlar
                </Link>
              </li>
            </ul>
          </div>

          {/* 3-ustun: Aloqa (O'ng tomon) */}
          <div className="md:col-span-4 lg:col-span-4 space-y-3 md:flex md:flex-col md:items-start lg:items-end">
            <div className="w-full md:max-w-xs space-y-3">
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-widest">
                ALOQA
              </h4>
              <div className="space-y-2.5">
                <a
                  href="https://t.me/aninovuz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-xs sm:text-sm text-gray-300 hover:text-white transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#12141c] border border-white/10 flex items-center justify-center text-sky-400 group-hover:border-sky-500/40 group-hover:bg-sky-500/10 transition-all shadow-sm">
                    <Send className="w-4 h-4" />
                  </div>
                  <span className="font-medium">Telegram Kanal</span>
                </a>

                <a
                  href="https://t.me/aninovuz_bot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-xs sm:text-sm text-gray-300 hover:text-white transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#12141c] border border-white/10 flex items-center justify-center text-emerald-400 group-hover:border-emerald-500/40 group-hover:bg-emerald-500/10 transition-all shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                  <span className="font-medium">Telegram Bot</span>
                </a>

                <a
                  href="mailto:aninovuz@gmail.com"
                  className="flex items-center gap-3 text-xs sm:text-sm text-gray-300 hover:text-white transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#12141c] border border-white/10 flex items-center justify-center text-red-500 group-hover:border-red-500/40 group-hover:bg-red-500/10 transition-all shadow-sm">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-gray-400 group-hover:text-gray-200">
                    aninovuz@gmail.com
                  </span>
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* 2. Pastki mualliflik huquqi va shartlar - chekkagacha cho'zilgan */}
        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <div>
            © 2026 <span className="text-gray-200 font-bold">AniNovuz</span>. Barcha huquqlar himoyalangan.
          </div>
          <div className="flex items-center gap-4">
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
