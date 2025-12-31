export default function TermsOfServicePage() {
    return (
        <div className="max-w-4xl mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6">Syarat dan Ketentuan Layanan</h1>
            <p className="text-sm text-gray-600 mb-8">Versi 2.0 | Berlaku sejak: 1 Januari 2024</p>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">1. Penerimaan Syarat</h2>
                <p className="mb-4">
                    Dengan menggunakan layanan CekKirim.com, Anda menyetujui syarat dan ketentuan berikut.
                    Jika Anda tidak setuju, harap tidak menggunakan layanan kami.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">2. Layanan Logistik & PPOB</h2>
                <p className="mb-4">
                    CekKirim.com menyediakan platform untuk pengecekan tarif pengiriman dan pembayaran tagihan.
                </p>
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
                    <p className="font-semibold">⚠️ PENTING - Tanggung Jawab Konten Paket:</p>
                    <p>
                        Kami TIDAK bertanggung jawab atas isi, kualitas, atau legalitas konten dalam paket yang dikirim.
                        Pengirim bertanggung jawab penuh atas kepatuhan terhadap hukum yang berlaku.
                    </p>
                </div>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">3. Larangan Keras</h2>
                <ul className="list-disc pl-8 space-y-2">
                    <li><strong>Pencucian Uang (AML):</strong> Semua transaksi dimonitor. Aktivitas mencurigakan akan dilaporkan ke pihak berwajib.</li>
                    <li><strong>Barang Terlarang:</strong> Dilarang keras mengirim narkoba, senjata, bahan peledak, atau barang ilegal lainnya.</li>
                    <li><strong>Fraud:</strong> Manipulasi sistem, penggunaan kartu kredit curian, atau penipuan akan mengakibatkan pemblokiran permanen.</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">4. Biaya dan Pembayaran</h2>
                <p className="mb-4">
                    Semua biaya layanan tercantum jelas. Anda bertanggung jawab untuk memastikan saldo mencukupi sebelum bertransaksi.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">5. Pembatasan Liabilitas</h2>
                <p className="mb-4">
                    CekKirim.com bertindak sebagai agregator informasi. Kami tidak bertanggung jawab atas keterlambatan,
                    kehilangan, atau kerusakan yang disebabkan oleh pihak kurir eksternal.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">6. Perubahan Ketentuan</h2>
                <p className="mb-4">
                    Kami berhak mengubah syarat ini kapan saja. Perubahan material akan diberitahukan melalui email
                    atau notifikasi di aplikasi.
                </p>
            </section>

            <footer className="mt-12 pt-6 border-t text-sm text-gray-600">
                <p>Untuk pertanyaan, hubungi: legal@cekkirim.com</p>
                <p className="mt-2">© 2024 CekKirim.com - Hak Cipta Dilindungi</p>
            </footer>
        </div>
    );
}
