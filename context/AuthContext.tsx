'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, LoginResponse } from '@/types/anime/anime.types';
import { authApi } from '@/lib/api';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (userId: number | string, code: string) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  login: async () => ({ success: false, message: '' }),
  logout: async () => {},
  refreshUser: async () => {},
  isAuthenticated: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initial session restoration from localStorage & /api/auth/me
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('user_data');

        if (storedToken) {
          setToken(storedToken);
          if (storedUser) {
            try {
              setUser(JSON.parse(storedUser));
            } catch (e) {
              console.warn('Invalid stored user data');
            }
          }

          // Live session verification with backend
          const meRes = await authApi.getMe().catch(() => null);
          if (isMounted) {
            if (meRes && meRes.success && meRes.authenticated && meRes.user) {
              setUser(meRes.user);
              localStorage.setItem('user_data', JSON.stringify(meRes.user));
            } else if (meRes && !meRes.authenticated) {
              // Token expired or invalid
              localStorage.removeItem('auth_token');
              localStorage.removeItem('user_data');
              setToken(null);
              setUser(null);
            }
          }
        }
      } catch (err) {
        console.error('Session restore error:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (userId: number | string, code: string): Promise<LoginResponse> => {
    try {
      const res = await authApi.login(userId, code);
      if (res.success && res.token && res.user) {
        localStorage.setItem('auth_token', res.token);
        localStorage.setItem('user_data', JSON.stringify(res.user));
        setToken(res.token);
        setUser(res.user);
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
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      setToken(null);
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const res = await authApi.getMe();
      if (res.success && res.authenticated && res.user) {
        setUser(res.user);
        localStorage.setItem('user_data', JSON.stringify(res.user));
      }
    } catch (err) {
      console.error('Refresh user error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
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

