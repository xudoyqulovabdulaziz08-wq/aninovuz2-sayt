'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, LoginResponse } from '@/types/anime/anime.types';
import { authApi } from '@/lib/api';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (userId: number | string, code: string) => Promise<LoginResponse>;
  loginWithTelegramWebApp: () => Promise<LoginResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  isTelegramWebApp: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => ({ success: false, message: '' }),
  loginWithTelegramWebApp: async () => ({ success: false, message: '' }),
  logout: async () => {},
  refreshUser: async () => {},
  isAuthenticated: false,
  isTelegramWebApp: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTelegramWebApp, setIsTelegramWebApp] = useState(false);

  // Telegram WebApp orqali kirish (qo'lda yoki avtomatik chaqirish uchun)
  const loginWithTelegramWebApp = useCallback(async (): Promise<LoginResponse> => {
    if (typeof window === 'undefined') {
      return { success: false, message: 'Browser emas.' };
    }

    const tgWebApp = (window as any)?.Telegram?.WebApp;
    if (!tgWebApp || !tgWebApp.initData) {
      return { success: false, message: 'Telegram WebApp ma\'lumotlari topilmadi.' };
    }

    try {
      try {
        tgWebApp.ready();
        tgWebApp.expand();
      } catch {}

      const res = await authApi.loginWithWebApp(tgWebApp.initData);
      if (res.success && res.user) {
        setUser(res.user);
      } else {
        const meRes = await authApi.getMe().catch(() => null);
        if (meRes?.success && meRes.authenticated && meRes.user) {
          setUser(meRes.user);
        }
      }
      return res;
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Telegram orqali kirishda xatolik.';
      return { success: false, message };
    }
  }, []);

  // Sahifa yuklanganda global sessiyani va Telegram WebApp avto-loginni tiklash
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        // 1. Telegram WebApp mavjudligini aniqlash va ilovani faollashtirish
        if (typeof window !== 'undefined') {
          const tgWebApp = (window as any)?.Telegram?.WebApp;
          if (tgWebApp) {
            try {
              tgWebApp.ready();
              tgWebApp.expand();
              if (tgWebApp.initData) {
                if (isMounted) setIsTelegramWebApp(true);
              }
            } catch {}
          }
        }

        // 2. Avval mavjud sessiyani (/api/auth/me) cookie yoki token orqali tekshiramiz
        const meRes = await authApi.getMe().catch(() => null);
        if (isMounted && meRes && meRes.success && meRes.authenticated && meRes.user) {
          setUser(meRes.user);
          setIsLoading(false);
          return;
        }

        // 3. AGAR sessiya bo'lmasa va sayt Telegram Mini App ichida ochilgan bo'lsa — AVTOMATIK LOGIN!
        if (typeof window !== 'undefined') {
          const tgWebApp = (window as any)?.Telegram?.WebApp;
          if (tgWebApp && tgWebApp.initData) {
            console.log('[Auth] Telegram Mini App aniqlandi, avtomatik login qilinmoqda...');
            const webAppLoginRes = await loginWithTelegramWebApp();
            if (isMounted && webAppLoginRes.success) {
              console.log('[Auth] Telegram Mini App orqali muvaffaqiyatli ulandi!');
              setIsLoading(false);
              return;
            }
          }

          // 4. Bot yuborgan to'g'ridan-to'g'ri havola orqali kelganda: ?userId=123&code=AN-123
          const params = new URLSearchParams(window.location.search);
          const urlUserId = params.get('userId') || params.get('id');
          const urlCode = params.get('code') || params.get('token');

          if (urlUserId && urlCode) {
            console.log('[Auth] URL parametrlar orqali avtomatik login...');
            const paramLoginRes = await authApi.login(urlUserId, urlCode).catch(() => null);
            if (isMounted && paramLoginRes?.success && paramLoginRes.user) {
              setUser(paramLoginRes.user);
              // Brauzer manzil satrini tozalash
              try {
                const cleanUrl = window.location.pathname;
                window.history.replaceState({}, '', cleanUrl);
              } catch {}
              setIsLoading(false);
              return;
            }
          }
        }

        if (isMounted) setUser(null);
      } catch (err) {
        console.error('Session restore error:', err);
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, [loginWithTelegramWebApp]);

  const login = async (userId: number | string, code: string): Promise<LoginResponse> => {
    try {
      const res = await authApi.login(userId, code);
      if (res.success) {
        if (res.user) {
          setUser(res.user);
        } else {
          const meRes = await authApi.getMe().catch(() => null);
          if (meRes && meRes.success && meRes.authenticated && meRes.user) {
            setUser(meRes.user);
          }
        }
      }
      return res;
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Kirishda xatolik yuz berdi.';
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout().catch(() => {});
    } finally {
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const res = await authApi.getMe();
      if (res.success && res.authenticated && res.user) {
        setUser(res.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Refresh user error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        loginWithTelegramWebApp,
        logout,
        refreshUser,
        isAuthenticated: !!user,
        isTelegramWebApp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
