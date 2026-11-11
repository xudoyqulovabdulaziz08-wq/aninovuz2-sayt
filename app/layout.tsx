import type { Metadata } from 'next';
import './globals.css';
import { AppLayout } from '@/components/layout/AppLayout';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aninov.uz';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "AniNovuz — O'zbek tilidagi eng yirik anime portali",
    template: '%s | AniNovuz',
  },
  description:
    "Sevimli animelaringizni o'zbek tilida yuqori sifatda (HD/FHD) bepul tomosha qiling va eng so'nggi premyeralardan birinchilardan bo'lib xabardor bo'ling.",
  keywords: [
    'aninovuz',
    'anime uzbek tilida',
    'anime tarjima',
    'ozbekcha anime',
    'anime onlayn',
    'anime skachat',
    'uzbek anime',
    'aninov uz',
    'yangiliklar anime',
  ],
  authors: [{ name: 'AniNovuz Team' }],
  creator: 'AniNovuz',
  publisher: 'AniNovuz',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  icons: {
    icon: 'delfor.png',
    apple: '/logos.png',
  },
  openGraph: {
    type: 'website',
    locale: 'uz_UZ',
    url: SITE_URL,
    siteName: 'AniNovuz',
    title: "AniNovuz — O'zbek tilidagi eng yirik anime portali",
    description:
      "Sevimli animelaringizni o'zbek tilida yuqori sifatda tomosha qiling va eng so'nggi premyeralardan xabardor bo'ling.",
  },
  twitter: {
    card: 'summary_large_image',
    title: "AniNovuz — O'zbek tilidagi eng yirik anime portali",
    description:
      "Sevimli animelaringizni o'zbek tilida yuqori sifatda tomosha qiling.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AniNovuz',
    url: SITE_URL,
    description: "O'zbek tilidagi eng yirik anime portali",
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/animes?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
    inLanguage: 'uz',
  };

  return (
    <html lang="uz" className="dark">
      <head>
        {/* Telegram WebApp Rasmiy SDK Skripti (Mini App avtomatik login va to'liq ishlashi uchun) */}
        <script src="https://telegram.org/js/telegram-web-app.js" async></script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className="bg-[#000000] text-gray-100 antialiased selection:bg-red-800 selection:text-white">
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}

