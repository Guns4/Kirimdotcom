import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ - Pertanyaan Seputar Tracking & Ongkir | CekKirim',
  description:
    'Temukan jawaban atas pertanyaan umum seputar cara tracking paket, cek ongkir, dan menggunakan fitur-fitur CekKirim.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
