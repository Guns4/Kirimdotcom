import { AdminQRScanner } from '@/components/admin/mobile/AdminQRScanner';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ScanPage() {
  return (
    <div className="min-h-screen bg-gray-900 p-6 flex flex-col">
      <Link
        href="/admin/mobile"
        className="text-white mb-8 flex items-center gap-2"
      >
        <ArrowLeft className="w-5 h-5" /> Back
      </Link>

      <h1 className="text-2xl font-bold text-white mb-2 text-center">
        Scan User QR
      </h1>
      <p className="text-gray-400 text-center mb-10 text-sm">
        Arahkan kamera ke kode QR User untuk membuka profil.
      </p>

      <AdminQRScanner />
    </div>
  );
}
