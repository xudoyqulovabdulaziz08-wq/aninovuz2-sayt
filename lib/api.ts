import axios from 'axios';
import { ApiResponse, HomepageData, GenreItem, DubberItem, AnimeDetail, AnimeBase, UserProfile, LoginResponse } from '@/types/anime/anime.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://aninovuz-backend.xudoyqulovabdulaziz08.workers.dev';

export const api = axios.create({
  baseURL: API_BASE_URL,
  // withCredentials: true, // faqat auth talab qiladigan endpointlar uchun kerakli bo'ladi
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

const CACHE_KEY = 'aninovuz_all_animes_cache';
const CACHE_DURATION = 15 * 60 * 1000; // 15 daqiqa (ms)

export const animeApi = {
  getHomepage: async (): Promise<HomepageData> => {
    const res = await api.get<ApiResponse<HomepageData>>('/api/homepage');
    return res.data.data;
  },

  getGenres: async (): Promise<GenreItem[]> => {
    const res = await api.get<ApiResponse<GenreItem[]>>('/api/genres');
    return res.data.data;
  },

  getDubbers: async (): Promise<DubberItem[]> => {
    const res = await api.get<ApiResponse<DubberItem[]>>('/api/dubbers');
    return res.data.data;
  },

  getAnimeDetail: async (id: number | string): Promise<AnimeDetail> => {
    const res = await api.get<ApiResponse<AnimeDetail>>(`/api/anime/${id}`);
    return res.data.data;
  },

  search: async (params: { q?: string; genre?: string; year?: number; type?: string; page?: number; limit?: number }) => {
    const res = await api.get<ApiResponse<AnimeBase[]>>('/api/search', { params });
    return res.data;
  },

  /**
   * Barcha animelarni /api/xotira/anime.json dan olish va brauzerda 15 daqiqaga keshlab saqlash
   */
  getAllAnimesCached: async (): Promise<any[]> => {
    if (typeof window !== 'undefined') {
      try {
        const cachedStr = localStorage.getItem(CACHE_KEY);
        if (cachedStr) {
          const parsed = JSON.parse(cachedStr);
          if (parsed && parsed.timestamp && (Date.now() - parsed.timestamp < CACHE_DURATION) && Array.isArray(parsed.data) && parsed.data.length > 0) {
            return parsed.data;
          }
        }
      } catch (e) {
        console.warn('Cache read error:', e);
      }
    }

    // Tarmoq orqali yuklash
    const res = await fetch(`${API_BASE_URL}/api/xotira/anime.json`);
    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
    const json = await res.json();
    const data: any[] = Array.isArray(json) ? json : (json.data || []);

    if (typeof window !== 'undefined' && data.length > 0) {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          timestamp: Date.now(),
          data,
        }));
      } catch (e) {
        console.warn('Cache write error:', e);
      }
    }

    return data;
  },
};

export const authApi = {
  login: async (userId: number | string, code: string): Promise<LoginResponse> => {
    const res = await api.post<LoginResponse>('/api/auth/login', { userId, code });
    return res.data;
  },

  getMe: async (): Promise<{ success: boolean; authenticated: boolean; user: UserProfile | null }> => {
    const res = await api.get('/api/auth/me');
    return res.data;
  },

  logout: async (): Promise<{ success: boolean; message: string }> => {
    const res = await api.post('/api/auth/logout');
    return res.data;
  },
};