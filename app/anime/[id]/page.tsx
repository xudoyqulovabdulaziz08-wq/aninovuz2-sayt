import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AnimeDetailView } from '@/components/anime/AnimeDetailView';

interface AnimeDetailPageProps {
  params: Promise<{ id: string }>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://aninovuz-backend.xudoyqulovabdulaziz08.workers.dev';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aninov.uz';

async function getAnimeData(id: string): Promise<any | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/anime/${id}`, {
      next: { revalidate: 3600 }, // 1 soat kesh (Cloudflare va Next.js ISR)
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || null;
  } catch (error) {
    console.error(`Failed to fetch anime detail for id ${id}:`, error);
    return null;
  }
}

export async function generateMetadata({ params }: AnimeDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const anime = await getAnimeData(id);

  if (!anime) {
    return {
      title: 'Anime topilmadi',
      description: "Ushbu anime ma'lumotlar bazasida mavjud emas yoki o'chirilgan.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const titleUz = anime.title_uz || anime.title_en || 'Anime';
  const titleEn = anime.title_en && anime.title_en !== titleUz ? anime.title_en : '';
  const titleRu = anime.title_ru && anime.title_ru !== titleUz && anime.title_ru !== titleEn ? anime.title_ru : '';
  const isMovie = (anime.type || '').toUpperCase() === 'MOVIE' || (anime.type || '').toUpperCase() === 'FILM';
  const typeLabel = isMovie ? 'filmi' : 'barcha qismlari';

  // Sarlavhada ikkala nomni ham chiqarish: Masalan: Tabiat Farzand / Weathering With You
  const titleDisplay = [titleUz, titleEn].filter(Boolean).join(' / ');
  const title = `${titleDisplay} o'zbek tilida ${typeLabel} tomosha qilish`;

  const rawDesc = anime.description ? anime.description.replace(/\s+/g, ' ').trim() : '';
  const cleanDescription = rawDesc
    ? `${titleDisplay} (${anime.year || 2024}) o'zbek tilida: ${rawDesc.slice(0, 140)}...`
    : `${titleDisplay} animelarini o'zbek tilida yuqori sifatda (HD/FHD) AniNovuz portalida bepul tomosha qiling.`;

  const poster = anime.poster_r2_url || anime.poster || `${SITE_URL}/og-default.jpg`;
  const canonicalUrl = `${SITE_URL}/anime/${id}`;

  const genreNames = Array.isArray(anime.genres)
    ? anime.genres.map((g: any) => (typeof g === 'string' ? g : g.name)).filter(Boolean)
    : [];

  const dubberNames = Array.isArray(anime.dubbers)
    ? anime.dubbers.map((d: any) => (typeof d === 'string' ? d : d.name)).filter(Boolean)
    : [];

  return {
    title,
    description: cleanDescription,
    keywords: [
      titleUz,
      titleEn,
      titleRu,
      `${titleUz} uzbek tilida`,
      `${titleUz} tarjima`,
      `${titleUz} skachat`,
      titleEn ? `${titleEn} uzbek tilida` : '',
      titleEn ? `${titleEn} tarjima` : '',
      titleEn ? `${titleEn} skachat` : '',
      titleEn ? `${titleEn} watch online` : '',
      titleRu ? `${titleRu} узбек тилида` : '',
      'anime uzbek tilida',
      'aninovuz',
      ...genreNames,
      ...dubberNames,
    ].filter(Boolean) as string[],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: isMovie ? 'video.movie' : 'video.tv_show',
      url: canonicalUrl,
      title: `${titleDisplay} — O'zbek tilida tomosha qilish | AniNovuz`,
      description: cleanDescription,
      siteName: 'AniNovuz',
      images: [
        {
          url: poster,
          width: 800,
          height: 1200,
          alt: `${titleDisplay} o'zbek tilida`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${titleDisplay} — O'zbek tilida tomosha qilish | AniNovuz`,
      description: cleanDescription,
      images: [poster],
    },
  };
}

export default async function AnimeDetailPage({ params }: AnimeDetailPageProps) {
  const { id } = await params;
  const animeDetail = await getAnimeData(id);

  if (!animeDetail) {
    return (
      <div className="py-20 text-center space-y-4 select-none">
        <h2 className="text-xl font-bold text-gray-200">Anime topilmadi</h2>
        <p className="text-sm text-gray-400">
          Ushbu anime ma'lumotlar bazasida mavjud emas yoki o'chirilgan.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs shadow-lg hover:bg-red-500 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Bosh sahifaga qaytish
        </Link>
      </div>
    );
  }

  const rawRating = Number(animeDetail.average_rating || animeDetail.rating || 0);
  const ratingText = rawRating > 0 ? rawRating.toFixed(1) : '8.5';
  const isMovie = (animeDetail.type || '').toUpperCase() === 'MOVIE' || (animeDetail.type || '').toUpperCase() === 'FILM';
  const posterSrc = animeDetail.poster_r2_url || animeDetail.poster || '';
  const animeTitle = animeDetail.title_uz || animeDetail.title_en || 'Anime';

  const genreNames = Array.isArray(animeDetail.genres)
    ? animeDetail.genres.map((g: any) => (typeof g === 'string' ? g : g.name)).filter(Boolean)
    : [];

  const episodes = Array.isArray(animeDetail.episodes) ? animeDetail.episodes : [];

  const alternateNames = [animeDetail.title_en, animeDetail.title_ru]
    .filter(Boolean)
    .filter((n) => n !== animeTitle);

  // Google Schema.org (JSON-LD) Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': isMovie ? 'Movie' : 'TVSeries',
    name: animeTitle,
    alternateName: alternateNames.length > 0 ? (alternateNames.length === 1 ? alternateNames[0] : alternateNames) : undefined,
    url: `${SITE_URL}/anime/${id}`,
    image: posterSrc,
    description:
      animeDetail.description || `${animeTitle} animesini o'zbek tilida AniNovuz saytida bepul tomosha qiling.`,
    genre: genreNames.length > 0 ? genreNames : ['Anime'],
    dateCreated: animeDetail.year ? String(animeDetail.year) : undefined,
    datePublished: animeDetail.year ? `${animeDetail.year}-01-01` : undefined,
    inLanguage: 'uz',
    numberOfEpisodes: !isMovie && episodes.length > 0 ? episodes.length : undefined,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: ratingText,
      bestRating: '10',
      worstRating: '1',
      ratingCount: String(animeDetail.views_total || animeDetail.view_count || 148),
    },
  };

  return (
    <>
      {/* Google Bot uchun Schema.org (JSON-LD) mikromaqomi */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <AnimeDetailView animeDetail={animeDetail} />
    </>
  );
}
