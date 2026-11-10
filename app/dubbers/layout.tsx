import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Dublyajchilar va Ovoz ustalari",
  description:
    "Sevimli animelaringizni o'zbek tiliga mahorat bilan tarjima va dublyaj qilgan ovoz aktyorlari ro'yxati va ularning loyihalari.",
  alternates: {
    canonical: 'https://aninov.uz/dubbers',
  },
  openGraph: {
    title: "Dublyajchilar — AniNovuz",
    description: "Ovoz ustalari va ularning tarjima loyihalari.",
    url: 'https://aninov.uz/dubbers',
  },
};

export default function DubbersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
