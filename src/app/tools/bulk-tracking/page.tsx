import { Upload, Zap, FileSpreadsheet, Lock } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Bulk Tracking - Cek Ratusan Resi Sekaligus | CekKirim',
  description:
    'Upload CSV/Excel untuk cek status ratusan paket sekaligus. Fitur premium untuk seller besar.',
};

export default function BulkTrackingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileSpreadsheet className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Bulk Tracking 📊
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload file Excel/CSV untuk cek ratusan resi sekaligus. Hemat waktu
            untuk seller besar!
          </p>
        </div>

        {/* Premium Notice */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 rounded-xl p-8 mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Lock className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Fitur Premium</h2>
          </div>
          <p className="mb-6">
            Bulk tracking hanya tersedia untuk member Premium
          </p>
          <Link
            href="/pricing"
            className="inline-block bg-white text-orange-600 font-bold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Upgrade ke Premium
          </Link>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Cara Menggunakan
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Upload File</h3>
              <p className="text-sm text-gray-600">
                CSV atau Excel dengan kolom Resi & Kurir
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">2</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Proses Otomatis</h3>
              <p className="text-sm text-gray-600">
                Sistem cek semua resi secara bertahap
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">3</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Download Hasil</h3>
              <p className="text-sm text-gray-600">
                Excel dengan status semua paket
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Hemat Waktu</h3>
              <p className="text-sm text-gray-600">
                Ratusan resi dalam hitungan menit!
              </p>
            </div>
          </div>
        </div>

        {/* File Format */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Format File</h2>
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-bold text-gray-900 mb-4">
              Contoh Format CSV/Excel:
            </h3>
            <table className="w-full max-w-2xl">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="px-4 py-2 text-left">Resi</th>
                  <th className="px-4 py-2 text-left">Kurir</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                <tr className="border-b">
                  <td className="px-4 py-2">JP1234567890</td>
                  <td className="px-4 py-2">jne</td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-2">SI9876543210</td>
                  <td className="px-4 py-2">sicepat</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">TD1122334455</td>
                  <td className="px-4 py-2">jnt</td>
                </tr>
              </tbody>
            </table>
            <div className="mt-4 space-y-2 text-sm text-gray-600">
              <p>✓ Kolom pertama: Nomor Resi</p>
              <p>✓ Kolom kedua: Nama Kurir (jne, sicepat, jnt, dll)</p>
              <p>✓ Maksimal 500 resi per file</p>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <Upload className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="font-bold text-gray-900 mb-2">Upload Mudah</h3>
            <p className="text-sm text-gray-600">
              Support CSV dan Excel (.xlsx). Drag & drop langsung!
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <Zap className="w-12 h-12 text-green-600 mb-4" />
            <h3 className="font-bold text-gray-900 mb-2">Cepat & Stabil</h3>
            <p className="text-sm text-gray-600">
              Queue system mencegah server overload. Proses 5 resi/detik.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <FileSpreadsheet className="w-12 h-12 text-purple-600 mb-4" />
            <h3 className="font-bold text-gray-900 mb-2">Export Lengkap</h3>
            <p className="text-sm text-gray-600">
              Download hasil dalam format Exceldengan semua detail.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
