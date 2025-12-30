export const COURIER_AFFILIATE_URLS: Record<string, string> = {
  // Affiliate / Redirect Links (Fallback)
  // Using Shopee/Tokopedia search or official pages with referrer
  jne: 'https://shopee.co.id/search?keyword=JNE',
  jnt: 'https://shopee.co.id/search?keyword=J%26T',
  sicepat: 'https://shopee.co.id/search?keyword=Sicepat',
  anteraja: 'https://shopee.co.id/search?keyword=Anteraja',
  shopee: 'https://shopee.co.id/',
  lazada: 'https://www.lazada.co.id/',
  tokopedia: 'https://www.tokopedia.com/',
  pos: 'https://www.posindonesia.co.id/',
  ninja: 'https://www.ninjaxpress.co/id-id',
  lion: 'https://lionparcel.com/track',
  idx: 'https://www.idx.co.id/',
};

export function getOfficialFallbackUrl(courier: string): string {
  const code = courier.toLowerCase().replace(/[^a-z0-9]/g, '');
  // Return specific link or generic search
  return (
    COURIER_AFFILIATE_URLS[code] ||
    `https://www.google.com/search?q=cek+resi+${courier}+resmi`
  );
}
