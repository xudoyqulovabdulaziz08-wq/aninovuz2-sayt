import type { Metadata } from 'next';
export const runtime = 'edge';
export const metadata: Metadata = {
  title: "Barcha animelar katalogi — O'zbek tilida tomosha qilish",
  description:
    "Eng so'nggi va mashhur animelarni o'zbek tilida janrlar, yillar va reytinglar bo'yicha saralab, bepul yuqori sifatda tomosha qiling.",
  alternates: {
    canonical: 'https://aninov.uz/animes',
  },
  openGraph: {
    title: "Barcha animelar katalogi — AniNovuz",
    description: "Eng so'nggi va mashhur animelar katalogi o'zbek tilida.",
    url: 'https://aninov.uz/animes',
  },
};

export default function AnimesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
