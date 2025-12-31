import React from 'react';

export const metadata = {
    title: 'Acceptable Use Policy | CekKirim.com',
    description: 'Kebijakan Penggunaan yang Dapat Diterima',
};

export default function AupPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12 prose prose-slate dark:prose-invert">
            <h1>Acceptable Use Policy (AUP)</h1>

            <p>
                Kebijakan ini mengatur penggunaan layanan CekKirim.com yang dapat diterima dan tidak dapat diterima.
            </p>

            <h2>1. Barang Terlarang</h2>
            <ul className="list-disc pl-5">
                <li>Narkotika dan obat-obatan terlarang.</li>
                <li>Senjata api, bahan peledak, dan barang berbahaya lainnya.</li>
                <li>Barang curian atau barang yang melanggar hak kekayaan intelektual.</li>
                <li>Hewan langka atau dilindungi.</li>
            </ul>

            <h2>2. Keamanan Sistem</h2>
            <p>
                Dilarang melakukan upaya peretasan, scraping data secara masif tanpa izin, atau tindakan yang mengganggu stabilitas sistem CekKirim.com.
            </p>

            <h2>3. Sanksi</h2>
            <p>
                Pelanggaran terhadap AUP ini dapat mengakibatkan penangguhan akun secara permanen dan pelaporan kepada pihak berwajib.
            </p>
        </div>
    );
}
