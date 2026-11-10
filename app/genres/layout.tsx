import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Anime janrlari — Sarguzasht, Jangari, Komediya, Romantika",
  description:
    "O'zingiz yoqtirgan anime janrlari bo'yicha eng yaxshi o'zbekcha tarjima qilingan seriallar va filmlarni toping.",
  alternates: {
    canonical: 'https://aninov.uz/genres',
  },
  openGraph: {
    title: "Anime janrlari — AniNovuz",
    description: "Janrlar bo'yicha o'zbek tilidagi eng yaxshi animelar.",
    url: 'https://aninov.uz/genres',
  },
};

export default function GenresLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
