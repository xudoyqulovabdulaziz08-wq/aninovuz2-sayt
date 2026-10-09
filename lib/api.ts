import axios from 'axios';
import { ApiResponse, HomepageData, GenreItem, DubberItem, AnimeDetail, AnimeBase } from '@/types/anime/anime.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://aninovuz-backend.xudoyqulovabdulaziz08.workers.dev';

// Client-side in-memory cache to prevent duplicate requests across navigation
const clientMemoryCache = new Map<string, { data: any; timestamp: number }>();
const DEFAULT_TTL_MS = 15 * 60 * 1000; // 15 daqiqa kesh

function getCached<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  const item = clientMemoryCache.get(key);
  if (item && Date.now() - item.timestamp < DEFAULT_TTL_MS) {
    return item.data as T;
  }
  try {
    const stored = sessionStorage.getItem(`cache_${key}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Date.now() - parsed.timestamp < DEFAULT_TTL_MS) {
        clientMemoryCache.set(key, parsed);
        return parsed.data as T;
      } else {
        sessionStorage.removeItem(`cache_${key}`);
      }
    }
  } catch {}
  return null;
}

function setCached<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  const entry = { data, timestamp: Date.now() };
  clientMemoryCache.set(key, entry);
  try {
    sessionStorage.setItem(`cache_${key}`, JSON.stringify(entry));
  } catch {}
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
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

// Helper for server/client fetch with caching
async function fetchWithCache<T>(
  path: string, 
  revalidateSeconds = 1800,
  withCredentials = true // Default holda true turadi
): Promise<T> {
  const cacheKey = path;

  // 1. Check client-side cache first
  if (typeof window !== 'undefined') {
    const cached = getCached<T>(cacheKey);
    if (cached) return cached;
  }

  // 2. Fetch using native fetch with Next.js revalidation on server, or axios on client
  let data: T;
  if (typeof window === 'undefined') {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      next: { revalidate: revalidateSeconds },
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      throw new Error(`API fetch error ${res.status}: ${res.statusText}`);
    }
    const json: ApiResponse<T> = await res.json();
    data = json.data;
  } else {
    // Axios request parametrlari bilan (withCredentials dynamic)
    const res = await api.get<ApiResponse<T>>(path, { withCredentials });
    data = res.data.data;
  }

  // 3. Save to client-side cache
  if (typeof window !== 'undefined') {
    setCached(cacheKey, data);
  }

  return data;
}

export const animeApi = {
  getHomepage: async (): Promise<HomepageData> => {
    return fetchWithCache<HomepageData>('/api/homepage', 1800);
  },

  getGenres: async (): Promise<GenreItem[]> => {
    return fetchWithCache<GenreItem[]>('/api/anime/genres', 3600);
  },

  getDubbers: async (): Promise<DubberItem[]> => {
    return fetchWithCache<DubberItem[]>('/api/anime/dubbers', 3600);
  },

  getAnimeDetail: async (id: number | string): Promise<AnimeDetail> => {
    return fetchWithCache<AnimeDetail>(`/api/anime/${id}`, 1800);
  },

  search: async (params: { q?: string; genre?: string; year?: number; type?: string; page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params.q) queryParams.set('q', params.q);
    if (params.genre) queryParams.set('genre', params.genre);
    if (params.year) queryParams.set('year', params.year.toString());
    if (params.type) queryParams.set('type', params.type);
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.limit) queryParams.set('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const path = `/api/anime/search${queryString ? `?\${queryString}` : ''}`;

    // Faqat qidiruv so'rovida withCredentials parametrini false qilib o'tkazamiz
    return fetchWithCache<AnimeBase[]>(path, 300, false);
  },
};