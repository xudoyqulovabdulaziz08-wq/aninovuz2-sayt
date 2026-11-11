const CDN_BASE = 'https://backend.aninov.uz/posters';

/**
 * Fallback rasm — poster yuklanmasa yoki bo'sh bo'lsa ko'rsatiladi.
 * public/logos.png yoki tashqi URL ishlatsa bo'ladi.
 */
export const POSTER_FALLBACK =
  'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&q=80';

/**
 * Har qanday anime obyektidan to'g'ri poster URL ni olish.
 *
 * Prioritet tartibi:
 * 1. poster_r2_url (to'liq URL: "https://cdn.aninov.uz/posters/1.jpg")
 * 2. poster (to'liq URL bo'lsa)
 * 3. anime_id yoki id orqali CDN dan avtomatik qurish
 * 4. POSTER_FALLBACK
 */
export function getPosterUrl(anime: {
  poster_r2_url?: string | null;
  poster?: string | null;
  poster_url?: string | null;
  anime_id?: number | string | null;
  id?: number | string | null;
}): string {
  // 1. poster_r2_url — asosiy maydon
  if (anime.poster_r2_url && anime.poster_r2_url.startsWith('http')) {
    if (anime.poster_r2_url.includes('cdn.aninov.uz/posters')) {
      return anime.poster_r2_url.replace('https://cdn.aninov.uz/posters', CDN_BASE);
    }
    return anime.poster_r2_url;
  }

  // 2. poster yoki poster_url — alternativ maydon nomlari
  const fallback1 = anime.poster || anime.poster_url;
  if (fallback1 && typeof fallback1 === 'string' && fallback1.startsWith('http')) {
    return fallback1;
  }

  // 3. anime_id yoki id orqali CDN dan qurish
  const id = anime.anime_id || anime.id;
  if (id) {
    return `${CDN_BASE}/${id}.jpg`;
  }

  // 4. Oxirgi zaxira
  return POSTER_FALLBACK;
}

/**
 * <img> tagi uchun onError handler — rasm yuklanmasa fallbackga almashtiradi.
 * import React shart emas, SyntheticEvent any orqali yoziladi.
 */
export function handlePosterError(e: { target: unknown }) {
  const img = e.target as HTMLImageElement;
  if (img.src !== POSTER_FALLBACK) {
    img.src = POSTER_FALLBACK;
  }
}
