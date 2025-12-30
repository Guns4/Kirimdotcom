import { Shield, CheckCircle, Award } from 'lucide-react';

export const metadata = {
  title: 'Verified Account - Dapatkan Centang Biru | CekKirim',
  description:
    'Verifikasi akun Anda dengan KYC untuk mendapatkan badge centang biru dan privilese khusus.',
};

export default function VerifiedPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Dapatkan Centang Biru ✓
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Verifikasi identitas Anda untuk meningkatkan kepercayaan dan
            kredibilitas
          </p>
        </div>

        {/* Benefits */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Badge Centang Biru
            </h3>
            <p className="text-sm text-gray-600">
              Tampil di forum, review, dan profil Anda
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Prioritas Konten
            </h3>
            <p className="text-sm text-gray-600">
              Thread Anda muncul lebih atas di forum
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Link Aktif di Bio
            </h3>
            <p className="text-sm text-gray-600">
              Pasang link toko atau sosial media
            </p>
          </div>
        </div>

        {/* Requirements */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Syarat Verifikasi
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">
                  KTP / Identitas Resmi
                </h3>
                <p className="text-sm text-gray-600">
                  Upload foto KTP yang jelas dan masih berlaku
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">
                  Foto Selfie dengan KTP
                </h3>
                <p className="text-sm text-gray-600">
                  Selfie memegang KTP di samping wajah
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">
                  Informasi Bisnis (Opsional)
                </h3>
                <p className="text-sm text-gray-600">
                  Nama toko, link marketplace, media sosial
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 mb-8">
          <h3 className="font-bold text-yellow-900 mb-2">
            🔒 Privasi & Keamanan
          </h3>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Data KTP hanya digunakan untuk verifikasi</li>
            <li>• Tidak akan dipublikasikan atau dijual</li>
            <li>• Review manual oleh admin (1-3 hari kerja)</li>
            <li>• Gratis, tidak ada biaya verifikasi</li>
          </ul>
        </div>

        {/* CTA */}
        <div className="text-center">
          <a
            href="/dashboard/verification"
            className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-8 py-4 rounded-lg transition-colors text-lg"
          >
            Ajukan Verifikasi Sekarang
          </a>
          <p className="text-sm text-gray-600 mt-4">
            Gratis untuk semua pengguna
          </p>
        </div>
      </div>
    </main>
  );
}
