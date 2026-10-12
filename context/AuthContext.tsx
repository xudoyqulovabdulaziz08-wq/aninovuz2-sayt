'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, LoginResponse } from '@/types/anime/anime.types';
import { authApi } from '@/lib/api';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (userId: number | string, code: string) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => ({ success: false, message: '' }),
  logout: async () => {},
  refreshUser: async () => {},
  isAuthenticated: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sahifa yuklanganda HttpOnly cookie orqali sessiyani tekshirish
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        // Cookie avtomatik yuboriladi (withCredentials: true)
        const meRes = await authApi.getMe().catch(() => null);
        if (isMounted) {
          if (meRes && meRes.success && meRes.authenticated && meRes.user) {
            setUser(meRes.user);
          } else {
            setUser(null);
          }
        }
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
  }, []);

  const login = async (userId: number | string, code: string): Promise<LoginResponse> => {
    try {
      // Backend login qiladi va HttpOnly cookie o'rnatadi
      const res = await authApi.login(userId, code);
      if (res.success) {
        // Cookie o'rnatildi — /api/auth/me orqali foydalanuvchini olamiz
        const meRes = await authApi.getMe().catch(() => null);
        if (meRes && meRes.success && meRes.authenticated && meRes.user) {
          setUser(meRes.user);
        } else if (res.user) {
          // Fallback: login javobidagi user ma'lumotidan foydalanamiz
          setUser(res.user);
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
      // Backend cookie-ni o'chiradi, biz faqat React state-ni tozalaymiz
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
        logout,
        refreshUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
