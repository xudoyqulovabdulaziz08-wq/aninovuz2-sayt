'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Send, KeyRound, Loader2, AlertCircle, CheckCircle2, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { user, login, loginWithTelegramWebApp, isTelegramWebApp } = useAuth();

  const [userId, setUserId] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoConnecting, setIsAutoConnecting] = useState(false);
  const [quickLoginNotice, setQuickLoginNotice] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // 1. Agar foydalanuvchi allaqachon tizimga kirgan bo'lsa, bosh sahifaga yo'naltirish
  useEffect(() => {
    if (user && !successMsg) {
      router.push('/');
    }
  }, [user, router, successMsg]);

  // 2. Telegram Mini App ichida ochilganda darhol avto-login qilishga urinish
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const tryWebAppAutoLogin = async () => {
      const tg = (window as any)?.Telegram?.WebApp;
      if (tg?.initData && !user) {
        setIsAutoConnecting(true);
        const res = await loginWithTelegramWebApp();
        if (res.success) {
          setSuccessMsg('Telegram orqali muvaffaqiyatli ulandingiz! Bosh sahifaga yo\'naltirilmoqda...');
          setTimeout(() => {
            router.push('/');
          }, 800);
        } else {
          setIsAutoConnecting(false);
        }
      }
    };

    tryWebAppAutoLogin();
  }, [loginWithTelegramWebApp, user, router]);

  // 3. Brauzer vkladkasiga qaytilganda (window focus) sessiyani avtomatik tekshirish
  useEffect(() => {
    const handleFocus = async () => {
      if (quickLoginNotice && !user) {
        // Foydalanuvchi botga o'tib qaytib kelgan bo'lishi mumkin
        try {
          const params = new URLSearchParams(window.location.search);
          const uId = params.get('userId') || params.get('id');
          const uCode = params.get('code') || params.get('token');
          if (uId && uCode) {
            setUserId(uId);
            setCode(uCode);
            setIsLoading(true);
            const res = await login(uId, uCode);
            if (res.success) {
              setSuccessMsg('Telegram orqali avtomatik ulandi!');
              setTimeout(() => router.push('/'), 800);
            }
          }
        } catch {}
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [quickLoginNotice, user, login, router]);

  // 4. "Telegram orqali tezkor kirish" tugmasi bosilganda
  const handleTelegramQuickLogin = () => {
    setError(null);
    setQuickLoginNotice(true);

    const botUrl = 'https://t.me/Aninovuz_bot?start=login';
    const tgAppUrl = 'tg://resolve?domain=Aninovuz_bot&start=login';

    // Agar allaqachon Telegram Mini App ichida bo'lsa — to'g'ridan-to'g'ri WebApp auth ni chaqiramiz
    const tg = (window as any)?.Telegram?.WebApp;
    if (tg?.initData) {
      setIsAutoConnecting(true);
      loginWithTelegramWebApp().then((res) => {
        if (res.success) {
          setSuccessMsg('Telegram orqali kirdingiz!');
          setTimeout(() => router.push('/'), 700);
        } else {
          setIsAutoConnecting(false);
          setError(res.message || 'Telegram WebApp orqali kirish amalga oshmadi.');
        }
      });
      return;
    }

    // Mobil yoki kompyuter ilovasida Telegram botni ochish
    try {
      window.location.href = tgAppUrl;
    } catch {}

    // Zaxira: 300ms dan keyin web orqali ochish
    setTimeout(() => {
      window.open(botUrl, '_blank', 'noopener,noreferrer');
    }, 350);
  };

  // 5. Qo'lda Telegram ID va parol kiritib kirish
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanUserId = userId.trim();
    const cleanCode = code.trim();

    if (!cleanUserId) {
      setError('Telegram ID kiritilmadi.');
      return;
    }

    if (!cleanCode) {
      setError('Maxsus parol kiritilmadi.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await login(cleanUserId, cleanCode);

      if (res.success) {
        setSuccessMsg(res.message || 'Muvaffaqiyatli kirdingiz.');
        setTimeout(() => {
          router.push('/');
        }, 800);
      } else {
        setError(res.message || "Kod noto'g'ri yoki uning muddati tugagan.");
      }
    } catch (err: any) {
      setError(err?.message || 'Server bilan bog\'lanishda xatolik yuz berdi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-120px)] flex flex-col items-center justify-center px-4 py-8 select-none animate-in fade-in duration-200">
      {/* 1. Bosh sahifaga qaytish havolasi */}
      <div className="w-full max-w-[440px] mb-3">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors font-medium cursor-pointer"
          draggable={false}
        >
          <span>←</span>
          <span>Bosh sahifaga qaytish</span>
        </Link>
      </div>

      {/* 2. Asosiy Login Kartasi */}
      <div className="w-full max-w-[440px] bg-[#0c0d12] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
        {/* Logo va Sarlavha */}
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="inline-block">
            <img
              src="/logos.png"
              alt="AniNovuz"
              className="h-8 sm:h-9 w-auto object-contain"
            />
          </Link>
          <p className="text-xs text-gray-400 font-medium mt-2">
            Shaxsiy kabinetga kirish
          </p>
        </div>

        {/* Xabarlar (Xato / Muvaffaqiyat / Avto-ulanish) */}
        {isAutoConnecting && (
          <div className="p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs flex items-center gap-2.5 animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-sky-400 shrink-0" />
            <span>Telegram hisobingiz avtomatik ulanmoqda...</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-red-600/10 border border-red-600/30 text-red-400 text-xs flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-600/10 border border-emerald-600/30 text-emerald-400 text-xs flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 🚀 TELEGRAM ORQALI TEZKOR KIRISH TUGMASI */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleTelegramQuickLogin}
            disabled={isLoading || isAutoConnecting}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#229ED9] to-[#1E8BC7] hover:brightness-110 active:scale-[0.98] text-white font-bold text-sm tracking-wide transition-all shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2.5 cursor-pointer group disabled:opacity-50"
          >
            <Send className="w-4 h-4 fill-white text-white group-hover:translate-x-0.5 transition-transform" />
            <span>Telegram orqali tezkor kirish</span>
            <Sparkles className="w-4 h-4 text-amber-300" />
          </button>

          {/* Tezkor kirish yo'riqnomasi */}
          {quickLoginNotice && (
            <div className="p-3.5 rounded-xl bg-sky-950/40 border border-sky-500/30 text-gray-200 text-xs space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 text-sky-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Tezkor kirish qadamlari:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-gray-300 leading-relaxed">
                <li>
                  Ochilgan botda <b className="text-white">&quot;Boshlash&quot; (Start)</b> tugmasini bosing.
                </li>
                <li>
                  Bot sizga yuborgan <b className="text-amber-400">Telegram ID</b> va <b className="text-amber-400">Parol</b>ni quyidagi kataklarga kiriting.
                </li>
              </ol>
              <div className="pt-1 flex justify-end">
                <a
                  href="https://t.me/Aninovuz_bot?start=login"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-400 hover:text-sky-300 underline"
                >
                  <span>Bot ochilmadimi? Bu yerni bosing</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Ajratuvchi chiziq (OR divider) */}
        <div className="relative flex items-center justify-center my-3">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative px-3 bg-[#0c0d12] text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
            yoki ID va parol bilan
          </div>
        </div>

        {/* Qo'lda ID va Parol bilan kirish formasi */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Telegram ID */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-300">
              Telegram ID
            </label>
            <div className="relative flex items-center">
              <Send className="w-4 h-4 text-gray-500 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Masalan: 512345678"
                autoComplete="username"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#06070a] border border-white/10 focus:border-red-600 focus:ring-1 focus:ring-red-600/30 text-sm text-gray-100 placeholder-gray-600 outline-none transition-all"
                required
              />
            </div>
          </div>

          {/* Maxsus parol */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-300">
              Maxsus bir martalik parol
            </label>
            <div className="relative flex items-center">
              <KeyRound className="w-4 h-4 text-gray-500 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Masalan: AN-123456"
                autoComplete="current-password"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#06070a] border border-white/10 focus:border-red-600 focus:ring-1 focus:ring-red-600/30 text-sm text-gray-100 placeholder-gray-600 outline-none transition-all"
                required
              />
            </div>
          </div>

          {/* Qizil Tizimga kirish tugmasi */}
          <button
            type="submit"
            disabled={isLoading || isAutoConnecting}
            className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 active:scale-[0.98] text-white font-bold text-sm tracking-wide transition-all shadow-lg shadow-red-600/30 cursor-pointer disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 mt-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Tekshirilmoqda...</span>
              </>
            ) : (
              <span>Tizimga kirish</span>
            )}
          </button>
        </form>

        {/* Yordamchi matn */}
        <div className="pt-4 border-t border-white/5 flex flex-col items-center text-center space-y-2">
          <p className="text-[11px] text-gray-400 leading-relaxed max-w-sm">
            Parol olish uchun Telegramdagi rasmiy{' '}
            <a
              href="https://t.me/Aninovuz_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 hover:underline font-semibold"
              draggable={false}
            >
              @Aninovuz_bot
            </a>{' '}
            ga kiring va <b>/start login</b> deb yuboring.
          </p>
        </div>
      </div>
    </div>
  );
}
