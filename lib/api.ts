import axios from 'axios';
import { ApiResponse, HomepageData, GenreItem, DubberItem, AnimeDetail, AnimeBase, UserProfile, LoginResponse } from '@/types/anime/anime.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend.aninov.uz';
const CDN_BASE = 'https://backend.aninov.uz/posters';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // HttpOnly cookie auth uchun — cookie avtomatik yuboriladi
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Backenddan kelayotgan anime obyektidagi poster maydonini normalize qilish.
 * /api/xotira/anime.json va /api/homepage endpointlari turli maydon nomlari qaytarishi mumkin.
 */
function normalizePoster(anime: any): any {
  if (anime.poster_r2_url && typeof anime.poster_r2_url === 'string' && anime.poster_r2_url.startsWith('http')) {
    if (anime.poster_r2_url.includes('cdn.aninov.uz/posters')) {
      return { ...anime, poster_r2_url: anime.poster_r2_url.replace('https://cdn.aninov.uz/posters', CDN_BASE) };
    }
    return anime;
  }
  // Alternativ maydon nomlarini tekshirish
  const url =
    anime.poster_url ||
    anime.poster ||
    anime.image ||
    anime.thumbnail;

  if (url && typeof url === 'string' && url.startsWith('http')) {
    const fixedUrl = url.includes('cdn.aninov.uz/posters')
      ? url.replace('https://cdn.aninov.uz/posters', CDN_BASE)
      : url;
    return { ...anime, poster_r2_url: fixedUrl };
  }

  // Oxirgi variant: anime_id yoki id orqali CDN dan qurish
  const id = anime.anime_id || anime.id;
  if (id) {
    return { ...anime, poster_r2_url: `${CDN_BASE}/${id}.jpg` };
  }

  return anime;
}

const CACHE_KEY = 'aninovuz_all_animes_cache';
const CACHE_DURATION = 60 * 1000; // 1 daqiqa (yangi animelar tez ko'rinishi uchun)

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
   * Barcha animelarni /api/xotira/anime.json dan olish va brauzerda keshlab saqlash
   * (Stale-While-Revalidate: tezkor 0ms yuklash + yangi animelarni 1 daqiqada yangilash)
   */
  getAllAnimesCached: async (): Promise<any[]> => {
    let cachedData: any[] | null = null;
    if (typeof window !== 'undefined') {
      try {
        const cachedStr = localStorage.getItem(CACHE_KEY);
        if (cachedStr) {
          const parsed = JSON.parse(cachedStr);
          if (parsed && Array.isArray(parsed.data) && parsed.data.length > 0) {
            cachedData = parsed.data.map(normalizePoster);
            // Agar kesh 1 daqiqadan yangi bo'lsa, darhol qaytaramiz
            if (cachedData && Date.now() - (parsed.timestamp || 0) < CACHE_DURATION) {
              return cachedData;
            }
          }
        }
      } catch (e) {
        console.warn('Cache read error:', e);
      }
    }

    try {
      // Tarmoq orqali yuklash
      const res = await fetch(`${API_BASE_URL}/api/xotira/anime.json`);
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      const json = await res.json();
      const raw: any[] = Array.isArray(json) ? json : (json.data || []);

      // Poster maydonini normalize qilamiz — qaysi nom bilan kelishidan qat'i nazar
      const data = raw.map(normalizePoster);

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
    } catch (fetchErr) {
      // Tarmoqda xatolik bo'lsa, mavjud keshdan foydalanamiz
      if (cachedData && cachedData.length > 0) {
        return cachedData;
      }
      throw fetchErr;
    }
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