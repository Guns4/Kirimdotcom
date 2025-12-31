import React from 'react';

export const metadata = {
    title: 'Kebijakan Privasi | CekKirim.com',
    description: 'Kebijakan Privasi dan perlindungan data pengguna CekKirim.com',
};

export default function PrivacyPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12 prose prose-slate dark:prose-invert">
            <h1>Kebijakan Privasi</h1>

            <h2>1. Pengumpulan Data</h2>
            <p>
                Kami mengumpulkan informasi yang Anda berikan secara langsung, seperti nama, alamat email, nomor telepon, dan data pengiriman.
            </p>

            <h2>2. Penggunaan Data</h2>
            <p>
                Data digunakan untuk memproses pesanan, meningkatkan layanan, dan komunikasi terkait transaksi. Kami tidak menjual data pribadi Anda kepada pihak ketiga.
            </p>

            <h2>3. Keamanan Data (Encryption)</h2>
            <p>
                Data sensitif seperti NIK dan KTP disimpan menggunakan enkripsi AES-256 (Column Level Encryption) untuk menjamin keamanan Anda.
            </p>

            <h2>4. Cookies</h2>
            <p>
                Kami menggunakan cookies untuk meningkatkan pengalaman pengguna dan analitik. Anda dapat mengatur preferensi cookies melalui browser Anda.
            </p>
        </div>
    );
}
