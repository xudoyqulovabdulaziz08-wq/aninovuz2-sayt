import axios from 'axios';
import { ApiResponse, HomepageData, GenreItem, DubberItem, AnimeDetail, AnimeBase } from '@/types/anime/anime.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://aninovuz-backend.xudoyqulovabdulaziz08.workers.dev';

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
};