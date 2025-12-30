import {
  getUserInsurancePolicies,
  getUserClaims,
  purchaseInsurance,
  fileInsuranceClaim,
  formatRupiah,
} from '@/app/actions/insuranceActions';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import {
  Shield,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';

export const metadata = {
  title: 'Asuransi Paket - Insurance | CekKirim',
  description: 'Lindungi paket Anda dengan asuransi otomatis',
};

async function getInsuranceData() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/dashboard/insurance');
  }

  const { data: policies } = await getUserInsurancePolicies();
  const { data: claims } = await getUserClaims();

  return { policies: policies || [], claims: claims || [] };
}

export default async function InsuranceDashboardPage() {
  const { policies, claims } = await getInsuranceData();

  const handlePurchase = async (formData: FormData) => {
    'use server';
    const trackingNumber = formData.get('tracking_number') as string;
    const declaredValue = parseFloat(formData.get('declared_value') as string);
    const courier = formData.get('courier') as string;
    const destination = formData.get('destination') as string;

    await purchaseInsurance(
      trackingNumber,
      declaredValue,
      courier,
      destination
    );
    redirect('/dashboard/insurance?purchased=true');
  };

  const handleFileClaim = async (formData: FormData) => {
    'use server';
    const insuranceId = formData.get('insurance_id') as string;
    const claimType = formData.get('claim_type') as
      | 'lost'
      | 'damaged'
      | 'delayed';
    const description = formData.get('description') as string;

    await fileInsuranceClaim(insuranceId, claimType, description);
    redirect('/dashboard/insurance?claimed=true');
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const activeInsurance = policies.filter((p: any) => p.status === 'active');
  const pendingClaims = claims.filter((c: any) => c.status === 'pending');

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Asuransi Paket
          </h1>
          <p className="text-gray-600">
            Lindungi paket Anda dari risiko hilang atau rusak
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Asuransi Aktif</p>
                <p className="text-2xl font-bold text-gray-900">
                  {activeInsurance.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Klaim Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pendingClaims.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Klaim</p>
                <p className="text-2xl font-bold text-gray-900">
                  {claims.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Purchase Insurance */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Beli Asuransi Baru
            </h2>

            <form action={handlePurchase} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  No. Resi
                </label>
                <input
                  type="text"
                  name="tracking_number"
                  required
                  placeholder="JNTXXXXXXXXX"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Kurir
                </label>
                <select
                  name="courier"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih Kurir</option>
                  <option value="JNE">JNE</option>
                  <option value="JNT">J&T</option>
                  <option value="SICEPAT">SiCepat</option>
                  <option value="ANTERAJA">AnterAja</option>
                  <option value="IDEXPRESS">ID Express</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nilai Barang (Rp)
                </label>
                <input
                  type="number"
                  name="declared_value"
                  min="10000"
                  max="5000000"
                  step="1000"
                  required
                  placeholder="500000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Premi: 1.5% dari nilai barang | Max: Rp 5,000,000
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tujuan
                </label>
                <input
                  type="text"
                  name="destination"
                  required
                  placeholder="Jakarta"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors"
              >
                Beli Asuransi
              </button>
            </form>
          </div>

          {/* File Claim */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Ajukan Klaim
            </h2>

            {activeInsurance.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Tidak ada asuransi aktif</p>
                <p className="text-sm text-gray-400 mt-2">
                  Beli asuransi terlebih dahulu
                </p>
              </div>
            ) : (
              <form action={handleFileClaim} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Pilih Asuransi
                  </label>
                  <select
                    name="insurance_id"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih paket yang diasuransikan</option>
                    {activeInsurance.map((ins: any) => (
                      <option key={ins.id} value={ins.id}>
                        {ins.tracking_number} -{' '}
                        {formatRupiah(ins.coverage_amount)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tipe Klaim
                  </label>
                  <select
                    name="claim_type"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih tipe klaim</option>
                    <option value="lost">Hilang</option>
                    <option value="damaged">Rusak</option>
                    <option value="delayed">Terlambat</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Deskripsi Masalah
                  </label>
                  <textarea
                    name="description"
                    rows={4}
                    required
                    placeholder="Jelaskan kronologi masalah yang terjadi..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors"
                >
                  Ajukan Klaim
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Claims History */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Riwayat Klaim
          </h2>

          {claims.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Belum ada klaim</p>
            </div>
          ) : (
            <div className="space-y-4">
              {claims.map((claim: any) => (
                <div
                  key={claim.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-gray-900">
                        {claim.tracking_number}
                      </p>
                      <p className="text-sm text-gray-600">
                        {claim.claim_type.toUpperCase()} -{' '}
                        {claim.auto_detected ? '🤖 Auto-detected' : '📝 Manual'}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        claim.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : claim.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : claim.status === 'paid'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {claim.status}
                    </span>
                  </div>

                  <p className="text-sm text-gray-700 mb-2">
                    {claim.description}
                  </p>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      Diajukan: {formatDate(claim.created_at)}
                    </span>
                    <span className="font-bold text-gray-900">
                      {formatRupiah(claim.claim_amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-bold text-blue-900 mb-3">
            ℹ️ Tentang Asuransi Paket
          </h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• Premi: 1.5% dari nilai barang</li>
            <li>• Coverage maksimal: Rp 5,000,000 per paket</li>
            <li>• Berlaku untuk paket hilang, rusak, atau terlambat</li>
            <li>
              • Sistem auto-detect akan otomatis membuat klaim jika terdeteksi
              anomali
            </li>
            <li>• Proses klaim: 3-7 hari kerja</li>
            <li>• Pembayaran klaim via wallet atau transfer bank</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
