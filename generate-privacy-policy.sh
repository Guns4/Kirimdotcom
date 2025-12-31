#!/bin/bash

# generate-privacy-policy.sh
# Legal Docs Generator (Phase 1906-1910)
# compliance: Google Play User Data Policy

echo ">>> Generating Privacy Policy..."

# 1. Configuration
TARGET_FILE="src/app/privacy-policy/page.tsx"
LAST_UPDATED=$(date +"%d %B %Y")
COMPANY_NAME="CekKirim.com"
APP_NAME="CekKirim App"
CONTACT_EMAIL="legal@cekkirim.com"

# 2. Create Directory
mkdir -p src/app/privacy-policy

# 3. Write Content (Next.js Page)
cat > "$TARGET_FILE" <<EOF
import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | $APP_NAME',
  description: 'Kebijakan Privasi $APP_NAME - Penggunaan data, izin kamera, lokasi, dan kontak.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 py-16 px-4 md:px-8 max-w-4xl mx-auto">
      <header className="mb-10 pb-10 border-b border-zinc-200">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Kebijakan Privasi</h1>
        <p className="text-zinc-500">Terakhir Diperbarui: <span className="font-semibold text-zinc-900">$LAST_UPDATED</span></p>
      </header>

      <div className="prose prose-zinc max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-bold mb-3">1. Pendahuluan</h2>
          <p>
            $COMPANY_NAME ("Kami") berkomitmen melindungi privasi pengguna aplikasi $APP_NAME. 
            Kebijakan ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda 
            sesuai dengan standar Google Play Store dan hukum yang berlaku di Indonesia.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">2. Data yang Kami Kumpulkan</h2>
          <ul className="list-disc pl-5 space-y-2">
             <li><strong>Informasi Akun:</strong> Nama, Email, Nomor Telepon untuk registrasi dan verifikasi.</li>
             <li><strong>Data Transaksi:</strong> Riwayat pengiriman, top-up saldo, dan pembayaran PPOB.</li>
             <li><strong>Device Info:</strong> ID Perangkat, Tipe HP, dan OS untuk keamanan akun.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">3. Penggunaan Izin Khusus (App Permissions)</h2>
          <p>Aplikasi ini memerlukan izin tertentu agar fitur utama dapat berjalan:</p>
          
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-100">
              <h3 className="font-semibold text-blue-600 mb-2">📸 Kamera (Camera)</h3>
              <p className="text-sm">Digunakan untuk mengambil foto paket (bukti pengiriman) dan scan barcode resi. Kami tidak mengambil foto tanpa instruksi Anda.</p>
            </div>
            
            <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-100">
              <h3 className="font-semibold text-blue-600 mb-2">📍 Lokasi (Location)</h3>
              <p className="text-sm">Digunakan untuk fitur "Cari Agen Terdekat" dan memvalidasi titik jemput (Drop-off) kurir. Data lokasi hanya diambil saat fitur digunakan (Foreground).</p>
            </div>

            <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-100">
              <h3 className="font-semibold text-blue-600 mb-2">📒 Kontak (Contacts)</h3>
              <p className="text-sm">Opsional. Digunakan untuk memudahkan pengisian nomor HP tujuan saat Transaksi Pulsa/PPOB. Kami tidak menyimpan seluruh buku telepon Anda ke server.</p>
            </div>

            <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-100">
              <h3 className="font-semibold text-blue-600 mb-2">📂 Penyimpanan (Storage)</h3>
              <p className="text-sm">Digunakan untuk menyimpan bukti resi, label pengiriman, dan cache aplikasi.</p>
            </div>
          </div>
        </section>

        <section>
            <h2 className="text-xl font-bold mb-3">4. Keamanan & Penghapusan Data</h2>
            <p>Kami menerapkan enkripsi SSL/TLS untuk semua transmisi data.</p>
            <p className="mt-2">
                <strong>Ingin Menghapus Akun?</strong> Anda dapat mengajukan penghapusan akun dan data permanen melalui menu 
                <em>Settings > Danger Zone > Hapus Akun</em> di dalam aplikasi, atau email ke $CONTACT_EMAIL.
            </p>
        </section>

        <section>
            <h2 className="text-xl font-bold mb-3">5. Hubungi Kami</h2>
            <p>Jika ada pertanyaan mengenai kebijakan privasi ini, silakan hubungi:</p>
            <p className="font-medium mt-2">Email: $CONTACT_EMAIL</p>
        </section>
      </div>
      
      <footer className="mt-16 pt-8 border-t border-zinc-100 text-center text-sm text-zinc-400">
        &copy; $(date +"%Y") $COMPANY_NAME. All rights reserved.
      </footer>
    </div>
  );
}
EOF

echo ">>> Page Created at: $TARGET_FILE"
echo ">>> Last Updated set to: $LAST_UPDATED"

echo ""
echo ">>> NOTE FOR GOOGLE PLAY CONSOLE:"
echo "1. Login to Play Console."
echo "2. Go to App Content > Privacy Policy."
echo "3. Enter URL: https://cekkirim.com/privacy-policy"

echo ""
echo ">>> Setup Complete!"
