'use client';

import { useRouter } from 'next/navigation';

export function PurchaseButton() {
  const router = useRouter();

  const handlePurchase = () => {
    router.push('/checkout?bundle=starter-kit-pemula');
  };

  return (
    <button
      onClick={handlePurchase}
      className="bg-white text-blue-600 font-bold px-12 py-4 rounded-full text-lg hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
    >
      🚀 Ambil Paket Sekarang - Hemat 30%!
    </button>
  );
}
