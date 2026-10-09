import type { Metadata } from 'next';
import './globals.css';
import { AppLayout } from '@/components/layout/AppLayout';

export const metadata: Metadata = {
  title: 'AniNovuz — O\'zbek tilidagi eng yirik anime portali',
  description: 'Sevimli animelaringizni o\'zbek tilida yuqori sifatda tomosha qiling va eng so\'nggi premyeralardan xabardor bo\'ling.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" className="dark">
      <body className="bg-[#000000] text-gray-100 antialiased selection:bg-red-800 selection:text-white">
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
