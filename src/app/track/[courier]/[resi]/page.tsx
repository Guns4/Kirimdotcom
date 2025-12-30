import { MagicTrackingHeader } from '@/components/MagicTrackingHeader';
import { Metadata } from 'next';

// In a real app, you'd reuse your existing TrackingResult component
// and wrap it here. For now, we simulate the structure.

type Props = {
  params: Promise<{ courier: string; resi: string }>;
  searchParams: Promise<{ shop_name?: string }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const { courier, resi } = await params;
  const { shop_name } = await searchParams;

  if (shop_name) {
    return {
      title: `Lacak Paket ${shop_name} - ${resi.toUpperCase()}`,
      description: `Cek status pengiriman paket dari ${shop_name}. Resi: ${resi.toUpperCase()} (${courier}).`,
      robots: { index: false }, // Prevent SEO duplicate content for branded pages
    };
  }

  return {
    title: `Lacak Paket ${courier.toUpperCase()} - ${resi.toUpperCase()} | CekKirim`,
    description: `Cek resi ${courier} ${resi} akurat dan cepat.`,
  };
}

export default async function TrackingPage({ params, searchParams }: Props) {
  const { courier, resi } = await params;
  const { shop_name } = await searchParams;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Branded Header */}
      {shop_name ? (
        <MagicTrackingHeader shopName={shop_name} />
      ) : (
        // Standard Header Fallback (or nothing if your Layout handles it)
        <div className="bg-white border-b py-4">
          <div className="max-w-4xl mx-auto px-4 font-bold text-gray-800">
            CekKirim <span className="text-gray-400">Tracking</span>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8 space-y-6">
        {/* Tracking Status Card (Mockup) */}
        <div className="bg-white rounded-xl shadow-sm border p-6 md:p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-1">
                {courier} EXPRESS
              </div>
              <div className="text-2xl md:text-3xl font-mono font-bold text-gray-900">
                {resi}
              </div>
            </div>
            <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-bold text-sm">
              DELIVERED
            </div>
          </div>

          <div className="space-y-8 relative pl-4 border-l-2 border-gray-100 ml-3">
            {/* Timeline Items */}
            <div className="relative">
              <div className="absolute -left-[21px] top-1 w-4 h-4 bg-green-500 rounded-full ring-4 ring-white shadow-sm"></div>
              <div className="mb-1 font-bold text-gray-900">
                Paket Diterima Oleh [NAMA]
              </div>
              <div className="text-sm text-gray-500">
                Jakarta Selatan • 14:30 WIB
              </div>
            </div>
            <div className="relative">
              <div className="absolute -left-[21px] top-1 w-4 h-4 bg-gray-300 rounded-full ring-4 ring-white"></div>
              <div className="mb-1 font-semibold text-gray-700">
                Paket Sedang Dikirim ke Alamat Tujuan
              </div>
              <div className="text-sm text-gray-500">
                Jakarta Selatan • 09:15 WIB
              </div>
            </div>
          </div>
        </div>

        {/* Ad Slot (Only for branded links) */}
        {shop_name && (
          <div className="bg-gradient-to-br from-indigo-900 to-blue-900 rounded-xl p-6 text-white flex items-center justify-between shadow-lg">
            <div>
              <h3 className="font-bold text-lg mb-1">
                Ingin tracking otomatis seperti {shop_name}?
              </h3>
              <p className="text-indigo-200 text-sm">
                Gunakan CekKirim untuk bisnis online Anda.
              </p>
            </div>
            <a
              href="/register?ref=magic_tracking"
              className="bg-white text-indigo-900 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-100 transition"
            >
              Coba Gratis
            </a>
          </div>
        )}
      </main>
    </div>
  );
}
