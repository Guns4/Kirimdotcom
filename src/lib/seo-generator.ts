import { Metadata } from 'next';

interface RouteParams {
  origin: string;
  destination: string;
}

/**
 * Generates dynamic Metadata for Check Ongkir Route Pages.
 * Usage:
 * export async function generateMetadata({ params }: Props): Promise<Metadata> {
 *   return generateRouteMeta(params.origin, params.destination);
 * }
 */
export function generateRouteMeta(
  origin: string,
  destination: string
): Metadata {
  // Clean up inputs (remove dashes, capitalize)
  const cleanOrigin = formatCityName(origin);
  const cleanDest = formatCityName(destination);
  const year = new Date().getFullYear();

  const title = `Ongkir ${cleanOrigin} ke ${cleanDest} Termurah & Tercepat ${year} - CekKirim`;
  const description = `Cek tarif JNE, J&T, SiCepat, Wahana dari ${cleanOrigin} ke ${cleanDest}. Mulai Rp 6.000! Bandingkan harga, durasi pengiriman, dan lacak paket di sini.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://cekkirim.com/cek-ongkir/${origin}/${destination}`,
    },
    alternates: {
      canonical: `https://cekkirim.com/cek-ongkir/${origin}/${destination}`,
    },
  };
}

// Helper to format "jakarta-selatan" -> "Jakarta Selatan"
function formatCityName(slug: string): string {
  if (!slug) return '';
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
