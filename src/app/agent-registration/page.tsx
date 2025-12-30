import AgentRegistrationForm from '@/components/agent/AgentRegistrationForm';
import { getAgentStatus } from '@/lib/agent-service';
import { Store, ShieldCheck } from 'lucide-react';

export const metadata = {
    title: 'Daftar Agen CekKirim - Tambah Pemasukan Warung',
    description: 'Gabung menjadi mitra agen logistik dan dapatkan komisi dari setiap pengiriman.',
};

export default async function AgentRegistrationPage() {
    const existingAgent = await getAgentStatus();

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white pt-20 pb-24 px-4 overflow-hidden relative">
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <span className="inline-block bg-blue-800/50 border border-blue-400/30 px-3 py-1 rounded-full text-xs font-semibold mb-4 tracking-wider uppercase">
                        O2O Partnership
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Jadikan Warungmu <br /> Titik Layanan Logistik</h1>
                    <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-8">
                        Terima paket dari tetangga, dapatkan komisi. Tanpa modal besar, cukup modal tempat dan smartphone.
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 -mt-16 relative z-20">
                {existingAgent ? (
                    <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
                        <ShieldCheck className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Aplikasi Anda Sedang Diproses</h2>
                        <p className="text-gray-600">Status saat ini: <span className="font-bold uppercase text-blue-600">{existingAgent.status}</span></p>
                    </div>
                ) : (
                    <AgentRegistrationForm />
                )}
            </div>

            <div className="max-w-4xl mx-auto px-4 mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="p-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-blue-600">
                        <Store className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Traffic Toko Naik</h3>
                    <p className="text-sm text-gray-500">Orang datang kirim paket, sekalian belanja di warung Anda.</p>
                </div>
                <div className="p-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-green-600">
                        Rp
                    </div>
                    <h3 className="font-bold text-lg mb-2">Komisi Menarik</h3>
                    <p className="text-sm text-gray-500">Dapatkan hingga 15% dari ongkos kirim setiap transaksi.</p>
                </div>
                <div className="p-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-purple-600">
                        🚀
                    </div>
                    <h3 className="font-bold text-lg mb-2">Mudah & Cepat</h3>
                    <p className="text-sm text-gray-500">Proses pendaftaran full online, langsung aktif setelah verifikasi.</p>
                </div>
            </div>
        </div>
    );
}
