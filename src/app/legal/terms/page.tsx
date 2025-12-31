import React from 'react';

export const metadata = {
    title: 'Terms of Service | CekKirim.com',
    description: 'Syarat dan Ketentuan penggunaan layanan CekKirim.com',
};

export default function TermsPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12 prose prose-slate dark:prose-invert">
            <h1>Syarat dan Ketentuan</h1>
            <p className="lead">Terakhir diperbarui: {new Date().toLocaleDateString('id-ID')}</p>

            <h2>1. Pendahuluan</h2>
            <p>
                Selamat datang di CekKirim.com. Dengan mengakses dan menggunakan layanan kami, Anda menyetujui untuk terikat oleh Syarat dan Ketentuan ini.
            </p>

            <h2>2. Layanan Kami</h2>
            <p>
                CekKirim.com menyediakan layanan agregator logistik, perbandingan harga, dan pelacakan pengiriman. Kami bekerja sama dengan berbagai vendor logistik pihak ketiga.
            </p>

            <h2>3. Akun Pengguna</h2>
            <p>
                Anda bertanggung jawab untuk menjaga kerahasiaan akun dan kata sandi Anda. Segala aktivitas yang terjadi di bawah akun Anda adalah tanggung jawab Anda sepenuhnya.
            </p>

            <h2>4. Pembayaran dan Saldo</h2>
            <p>
                Transaksi dilakukan melalui sistem saldo (Wallet). Pengembalian dana (Refund) tunduk pada kebijakan masing-masing vendor logistik dan prosedur verifikasi kami.
            </p>

            <h2>5. Larangan</h2>
            <p>
                Pengguna dilarang menggunakan layanan untuk pengiriman barang ilegal, berbahaya, atau melanggar hukum yang berlaku di Indonesia.
            </p>
        </div>
    );
}
