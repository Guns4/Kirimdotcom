import { WidgetSearchForm } from '@/components/widget/WidgetSearchForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cek Resi Widget',
  description: 'Widget Cek Resi CekKirim.com',
  robots: {
    index: false,
    follow: false,
  },
};

interface PageProps {
  searchParams: Promise<{
    color?: string;
  }>;
}

export default async function WidgetPage({ searchParams }: PageProps) {
  const { color } = await searchParams;
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-transparent">
      <WidgetSearchForm color={color} />
    </div>
  );
}
