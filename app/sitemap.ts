import type { MetadataRoute } from 'next';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://aninovuz-backend.xudoyqulovabdulaziz08.workers.dev';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aninov.uz';
  const currentDate = new Date();

  // Asosiy statik sahifalar
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'hourly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/animes`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/movies`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/genres`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/dubbers`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  // Dinamik anime sahifalarini backenddan yuklash
  try {
    const res = await fetch(`${API_BASE_URL}/api/xotira/anime.json`, {
      next: { revalidate: 3600 }, // 1 soat davomida sitemapni keshda saqlash
    });

    if (!res.ok) {
      console.warn(`Sitemap fetch failed with status: ${res.status}`);
      return staticRoutes;
    }

    const data = await res.json();
    const animes: any[] = Array.isArray(data) ? data : (data?.data || []);

    const animeRoutes: MetadataRoute.Sitemap = animes
      .filter((anime) => Boolean(anime?.anime_id || anime?.id))
      .map((anime) => {
        const id = anime.anime_id || anime.id;
        const lastMod = anime.updated_at
          ? new Date(anime.updated_at)
          : anime.created_at
          ? new Date(anime.created_at)
          : currentDate;

        return {
          url: `${baseUrl}/anime/${id}`,
          lastModified: isNaN(lastMod.getTime()) ? currentDate : lastMod,
          changeFrequency: 'weekly',
          priority: 0.8,
        };
      });

    return [...staticRoutes, ...animeRoutes];
  } catch (error) {
    console.error('Failed to generate dynamic sitemap:', error);
    return staticRoutes;
  }
}
