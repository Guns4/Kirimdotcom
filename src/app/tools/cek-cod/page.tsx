import { Metadata } from 'next';
import { CODRiskChecker } from '@/components/tools/CODRiskChecker';

export const metadata: Metadata = {
  title: 'Cek Risiko Retur COD & Blacklist Buyer - CekKirim',
  description:
    'Cek potensi retur paket COD berdasarkan kode pos dan reputasi nomor HP pembeli. Lindungi tokomu dari pembeli fiktif dan RTS.',
};

export default function CODRiskPage() {
  return (
    <div className="min-h-screen bg-slate-950 py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400">
            COD Risk Checker
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Analisis potensi gagal kirim (RTS) sebelum Anda mengirim paket.
            Basis data kami membantu Anda menghindari kerugian ongkir.
          </p>
        </div>

        <CODRiskChecker />

        <div className="mt-16 text-center text-sm text-gray-600 max-w-2xl mx-auto">
          <p>
            DISCLAIMER: Data yang ditampilkan berdasarkan statistik historis dan
            laporan komunitas seller. Keputusan pengiriman sepenuhnya berada di
            tangan Anda. Kami menjaga privasi data pembeli dengan metode hashing
            (SHA-256).
          </p>
        </div>
      </div>
    </div>
  );
}
