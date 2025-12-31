#!/bin/bash

# generate-legal-pages.sh
# -----------------------
# Document Management: Auto-generate legal documents.
# Creates comprehensive ToS, Privacy Policy, and AUP.

echo "📄 Generating Legal Pages..."

mkdir -p src/app/legal/terms
mkdir -p src/app/legal/privacy
mkdir -p src/app/legal/aup

# 1. Terms of Service
cat > src/app/legal/terms/page.tsx << 'EOF'
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
EOF

# 2. Privacy Policy
cat > src/app/legal/privacy/page.tsx << 'EOF'
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
EOF

# 3. Acceptable Use Policy (AUP)
cat > src/app/legal/aup/page.tsx << 'EOF'
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
EOF

echo "✅ Terms of Service: src/app/legal/terms/page.tsx"
echo "✅ Privacy Policy: src/app/legal/privacy/page.tsx"
echo "✅ Acceptable Use Policy: src/app/legal/aup/page.tsx"
