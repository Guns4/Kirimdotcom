import { Shield, Info } from 'lucide-react'

export const metadata = {
    title: 'Syarat & Ketentuan - CekKirim.com',
    description: 'Syarat dan ketentuan penggunaan layanan CekKirim.com'
}

export default function TermsPage() {
    return (
        <div className="container-custom py-12 max-w-4xl">
            <h1 className="text-3xl font-bold text-white mb-8">Syarat & Ketentuan</h1>

            <div className="space-y-8 text-gray-300 leading-relaxed">
                <section>
                    <h2 className="text-xl font-semibold text-white mb-4">1. Pendahuluan</h2>
                    <p>Selamat datang di CekKirim.com. Dengan menggunakan layanan kami, Anda menyetujui syarat dan ketentuan berikut.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-white mb-4">2. Layanan Cek Ongkir & Resi</h2>
                    <p>Data ongkos kirim dan status resi ditampilkan "sebagaimana adanya" dari sumber pihak ketiga (kurir). Kami tidak bertanggung jawab atas keterlambatan update atau ketidakakuratan data dari pihak ekspedisi.</p>
                </section>

                <section className="bg-indigo-900/10 border border-indigo-500/20 p-6 rounded-2xl">
                    <h2 className="text-xl font-semibold text-indigo-400 mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        3. COD Risk Checker & Data Komunitas
                    </h2>
                    <div className="space-y-4">
                        <p>
                            Fitur "COD Risk Checker" dan "Cek Buyer" menggunakan database yang dikumpulkan dari laporan komunitas pengguna (User Generated Content).
                        </p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>
                                <strong className="text-indigo-300">Akurasi Data:</strong> Kami tidak menjamin kebenaran 100% atas laporan yang dibuat oleh pengguna lain. Status "High Risk" adalah indikasi berdasarkan riwayat laporan, bukan vonis mutlak.
                            </li>
                            <li>
                                <strong className="text-indigo-300">Privasi:</strong> Nomor HP disimpan dalam bentuk terenkripsi (Hash SHA-256) untuk menjaga privasi pemilik nomor.
                            </li>
                            <li>
                                <strong className="text-indigo-300">Hak Jawab & Sanggahan:</strong> Jika nomor Anda keliru dilaporkan, Anda berhak mengajukan perbaikan melalui fitur <strong>"Ajukan Sanggahan"</strong>. Kami akan menghapus label risiko jika verifikasi kepemilikan berhasil disetujui.
                            </li>
                            <li>
                                <strong className="text-indigo-300">Penyalahgunaan:</strong> Melakukan laporan palsu secara sengaja dapat mengakibatkan pemblokiran akun akses pelapor.
                            </li>
                        </ul>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-white mb-4">4. Batasan Tanggung Jawab</h2>
                    <p>CekKirim.com tidak bertanggung jawab atas kerugian materiil atau immateriil yang timbul akibat keputusan bisnis yang diambil berdasarkan informasi di platform ini. Gunakan data sebagai referensi tambahan, bukan satu-satunya acuan.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-white mb-4">5. Perubahan Syarat</h2>
                    <p>Kami berhak mengubah syarat dan ketentuan ini sewaktu-waktu tanpa pemberitahuan sebelumnya.</p>
                </section>

                <div className="pt-8 border-t border-white/5 text-sm text-gray-500">
                    <p>Terakhir diperbarui: 27 Desember 2024</p>
                </div>
            </div>
        </div>
    )
}
