export interface AnimeBase {
  anime_id: number;
  title_uz: string;
  title_en: string;
  title_ru?: string;
  type: string;
  year: number;
  poster_r2_url: string;
  average_rating: number;
  rating_count: number;
  views_total: number;
  views_week: number;
  genres: string[];
  dubbers?: string[];
  episodes_count?: number;
  description?: string;
}

export interface HomepageData {
  hero_slider: AnimeBase[];
  latest: AnimeBase[];
  popular: AnimeBase[];
  top_rated: AnimeBase[];
  random: AnimeBase[];
  movies: AnimeBase[];
  ovas: AnimeBase[];
  tv_series: AnimeBase[];
}

export interface ApiResponse<T> {
  success: boolean;
  source?: string;
  data: T;
  message?: string;
}

export interface GenreItem {
  id: number;
  name: string;
  anime_count: number;
}

export interface DubberItem {
  id: number;
  name: string;
  anime_count: number;
}

export interface EpisodeStream {
  id: number;
  episode_id: number;
  dub_group: string;
  is_vip: boolean;
  file_id: string;
}

export interface AnimeEpisode {
  id: number;
  episode: number;
  is_filler: boolean;
  streams?: EpisodeStream[];
}

export interface AnimeDetail extends AnimeBase {
  description: string;
  episodes: AnimeEpisode[];
  similar_animes: AnimeBase[];
}
