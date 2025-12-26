// ============================================
// BLOG ARTICLE GENERATOR
// ============================================
// Run: npx ts-node scripts/generate-blog-articles.ts

import * as fs from 'fs'
import * as path from 'path'

const BLOG_DIR = path.join(process.cwd(), 'content/blog')

// Ensure directory exists
if (!fs.existsSync(BLOG_DIR)) {
    fs.mkdirSync(BLOG_DIR, { recursive: true })
}

// ============================================
// ARTICLE TEMPLATES
// ============================================

interface ArticleTemplate {
    slug: string
    title: string
    description: string
    tags: string[]
    content: string
}

// Generate slug from title
function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
}

// Get random date in last 3 months
function getRandomDate(): string {
    const now = new Date()
    const daysAgo = Math.floor(Math.random() * 90)
    const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
    return date.toISOString().split('T')[0]
}

// ============================================
// ARTICLE DATA
// ============================================

// Courier names
const couriers = ['JNE', 'J&T Express', 'SiCepat', 'AnterAja', 'Pos Indonesia', 'Ninja Xpress', 'Lion Parcel', 'TIKI', 'Wahana', 'SAP Express']

// Cities
const cities = [
    'Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang', 'Makassar', 'Palembang',
    'Yogyakarta', 'Denpasar', 'Malang', 'Tangerang', 'Bekasi', 'Depok', 'Bogor',
    'Balikpapan', 'Pontianak', 'Pekanbaru', 'Padang', 'Manado', 'Banjarmasin',
    'Batam', 'Cirebon', 'Solo', 'Samarinda', 'Jambi', 'Lampung', 'Aceh', 'Mataram'
]

// Service types
const services = ['Regular', 'Express', 'Same Day', 'Next Day', 'Ekonomi', 'Cargo', 'Trucking']

// Articles generators
const articleGenerators: (() => ArticleTemplate)[] = [
    // 1-10: Cara Cek Resi per Kurir
    ...couriers.map(courier => () => ({
        slug: slugify(`cara-cek-resi-${courier}-terbaru`),
        title: `Cara Cek Resi ${courier} Terbaru ${new Date().getFullYear()} - Panduan Lengkap`,
        description: `Panduan lengkap cara cek resi ${courier} secara online. Lacak paket ${courier} dengan mudah menggunakan nomor resi/AWB Anda.`,
        tags: ['tracking', courier.toLowerCase().replace(/\s+/g, '-'), 'tutorial'],
        content: `# Cara Cek Resi ${courier} Terbaru ${new Date().getFullYear()}

Ingin tahu status pengiriman paket ${courier} Anda? Artikel ini akan membahas cara mudah cek resi ${courier} secara online.

## Apa itu Nomor Resi ${courier}?

Nomor resi adalah kode unik yang diberikan oleh ${courier} untuk setiap pengiriman. Dengan nomor ini, Anda bisa melacak posisi dan status paket secara real-time.

## Ciri-ciri Nomor Resi ${courier}

Nomor resi ${courier} biasanya memiliki karakteristik:
- Terdiri dari kombinasi huruf dan angka
- Panjang sekitar 10-15 karakter
- Diberikan saat paket dikirim

## Cara Cek Resi ${courier} Online

### 1. Melalui CekKirim.com
1. Kunjungi [CekKirim.com](/)
2. Masukkan nomor resi ${courier}
3. Pilih kurir "${courier}"
4. Klik "Lacak Sekarang"

### 2. Melalui Website Resmi ${courier}
1. Buka website resmi ${courier}
2. Cari menu "Tracking" atau "Lacak"
3. Masukkan nomor resi
4. Lihat hasil tracking

### 3. Melalui Aplikasi ${courier}
1. Download aplikasi ${courier} di Play Store/App Store
2. Buka aplikasi dan login
3. Masukkan nomor resi untuk tracking

## Status Pengiriman ${courier}

Berikut arti status yang sering muncul:

| Status | Keterangan |
|--------|------------|
| Picked Up | Paket sudah dijemput kurir |
| In Transit | Paket dalam perjalanan |
| On Delivery | Paket sedang diantar |
| Delivered | Paket sudah diterima |

## Tips Tracking ${courier}

1. **Simpan nomor resi** - Jangan buang bukti pengiriman
2. **Cek berkala** - Update status setiap beberapa jam
3. **Hubungi CS** jika status tidak update lebih dari 3 hari

## Kesimpulan

Cek resi ${courier} sangat mudah dilakukan secara online. Gunakan CekKirim untuk tracking yang lebih cepat dan akurat.

---

*Butuh bantuan tracking? Gunakan fitur Cek Resi di halaman utama CekKirim!*
`
    })),

    // 11-25: Ongkir antar kota
    ...cities.slice(0, 15).map(city => () => ({
        slug: slugify(`ongkir-jakarta-ke-${city}`),
        title: `Ongkir Jakarta ke ${city} ${new Date().getFullYear()} - Tarif Semua Kurir`,
        description: `Cek tarif ongkir pengiriman dari Jakarta ke ${city}. Bandingkan harga JNE, J&T, SiCepat, dan kurir lainnya.`,
        tags: ['ongkir', 'jakarta', city.toLowerCase(), 'tarif'],
        content: `# Ongkir Jakarta ke ${city} ${new Date().getFullYear()}

Berapa biaya pengiriman paket dari Jakarta ke ${city}? Artikel ini membandingkan tarif dari berbagai kurir populer.

## Perbandingan Ongkir Jakarta - ${city}

Berikut estimasi ongkir untuk berat 1 kg:

| Kurir | Regular | Express | Estimasi |
|-------|---------|---------|----------|
| JNE | Rp 18.000 - 25.000 | Rp 28.000 - 40.000 | 2-4 hari |
| J&T | Rp 17.000 - 24.000 | Rp 26.000 - 38.000 | 2-3 hari |
| SiCepat | Rp 15.000 - 22.000 | Rp 22.000 - 35.000 | 1-3 hari |
| AnterAja | Rp 16.000 - 23.000 | Rp 25.000 - 36.000 | 2-3 hari |
| Pos Indonesia | Rp 12.000 - 18.000 | Rp 20.000 - 30.000 | 3-5 hari |

*Harga dapat berubah. Cek tarif terbaru di CekKirim.*

## Faktor yang Mempengaruhi Ongkir

### 1. Berat Paket
Ongkir dihitung berdasarkan berat aktual atau berat volumetrik (mana yang lebih besar).

**Rumus Volumetrik:**
\`\`\`
Berat Volume = (P x L x T) / 6000 (dalam cm)
\`\`\`

### 2. Jarak Pengiriman
Semakin jauh jarak Jakarta - ${city}, semakin tinggi biaya pengiriman.

### 3. Jenis Layanan
- **Regular**: Lebih murah, waktu lebih lama
- **Express**: Lebih cepat, biaya lebih tinggi
- **Same Day**: Tercepat, biaya premium

## Tips Hemat Ongkir Jakarta ke ${city}

1. **Bandingkan harga** - Gunakan CekKirim untuk membandingkan
2. **Pilih layanan regular** jika tidak urgent
3. **Gabung pengiriman** untuk volume besar
4. **Manfaatkan promo** dari marketplace

## Kurir Rekomendasi untuk Jakarta - ${city}

### Untuk Kecepatan
- SiCepat BEST
- JNE YES/Express

### Untuk Budget
- Pos Indonesia
- Wahana

### Untuk COD
- J&T Express
- SiCepat COD

## Cek Ongkir Sekarang

Gunakan fitur **Cek Ongkir** di CekKirim untuk mendapatkan tarif real-time dari semua kurir.

---

*Bandingkan harga 10+ kurir dalam satu klik di CekKirim!*
`
    })),

    // 26-35: Panduan per layanan kurir
    ...services.map(service => () => ({
        slug: slugify(`panduan-pengiriman-${service}-lengkap`),
        title: `Panduan Pengiriman ${service} - Kapan Harus Menggunakannya?`,
        description: `Pelajari kapan menggunakan layanan pengiriman ${service}. Tips memilih layanan yang tepat untuk kebutuhan Anda.`,
        tags: ['panduan', service.toLowerCase(), 'tips'],
        content: `# Panduan Pengiriman ${service}

Layanan pengiriman ${service} adalah salah satu pilihan populer di Indonesia. Kapan sebaiknya menggunakan layanan ini?

## Apa itu Layanan ${service}?

Layanan ${service} adalah jenis pengiriman yang menawarkan keseimbangan antara kecepatan dan biaya.

## Karakteristik Layanan ${service}

| Aspek | Keterangan |
|-------|------------|
| Estimasi Waktu | ${service === 'Same Day' ? '1 hari' : service === 'Express' ? '1-2 hari' : '2-5 hari'} |
| Kisaran Harga | ${service === 'Same Day' ? 'Premium' : service === 'Express' ? 'Menengah-Tinggi' : 'Ekonomis'} |
| Cocok Untuk | ${service === 'Same Day' ? 'Dokumen urgent, makanan' : service === 'Express' ? 'Barang penting' : 'Barang non-urgent'} |

## Kapan Menggunakan ${service}?

### Gunakan ${service} jika:
1. ${service === 'Same Day' ? 'Paket harus sampai hari ini' : 'Tidak terlalu urgent'}
2. ${service === 'Express' ? 'Butuh kepastian waktu' : 'Ingin hemat biaya'}
3. Barang tidak mudah rusak

### Jangan Gunakan ${service} jika:
1. Barang sangat urgent (pilih Same Day)
2. ${service === 'Ekonomi' ? 'Barang mudah basi' : 'Budget sangat terbatas'}

## Kurir yang Menyediakan Layanan ${service}

- **JNE**: ${service === 'Regular' ? 'REG' : service === 'Express' ? 'YES' : 'Tersedia'}
- **J&T**: ${service === 'Express' ? 'EXPRESS' : 'EZ'}
- **SiCepat**: ${service === 'Regular' ? 'HALU' : 'BEST'}
- **AnterAja**: ${service === 'Regular' ? 'Regular' : 'Next Day'}

## Tips Memilih Layanan yang Tepat

1. **Pertimbangkan urgency** - Seberapa cepat paket harus sampai?
2. **Cek budget** - Sesuaikan dengan kemampuan
3. **Perhatikan jarak** - Layanan ${service} mungkin berbeda waktunya untuk luar pulau

## Bandingkan Harga

Gunakan CekKirim untuk membandingkan harga layanan ${service} dari berbagai kurir sebelum memilih.

---

*Cek ongkir untuk layanan ${service} di CekKirim sekarang!*
`
    })),

    // 36-50: Tips untuk seller/UMKM
    ...Array.from({ length: 15 }, (_, i) => {
        const topics = [
            { title: 'Cara Packing Paket yang Aman untuk Online Shop', tags: ['packing', 'seller'] },
            { title: 'Tips Menghindari Paket Rusak Saat Pengiriman', tags: ['tips', 'packing'] },
            { title: 'Cara Klaim Asuransi Pengiriman untuk Seller', tags: ['asuransi', 'seller'] },
            { title: 'Strategi Subsidi Ongkir untuk Tingkatkan Penjualan', tags: ['seller', 'strategi'] },
            { title: 'Cara Menangani Komplain Pengiriman dari Pembeli', tags: ['komplain', 'seller'] },
            { title: 'Tips Memilih Kurir Terbaik untuk Bisnis Online', tags: ['kurir', 'seller'] },
            { title: 'Cara Negosiasi Harga Ongkir dengan Kurir', tags: ['negosiasi', 'seller'] },
            { title: 'Panduan COD untuk Seller Online', tags: ['cod', 'seller'] },
            { title: 'Cara Lacak Banyak Resi Sekaligus untuk Seller', tags: ['tracking', 'seller'] },
            { title: 'Tips Kirim Barang Fragile yang Aman', tags: ['fragile', 'packing'] },
            { title: 'Cara Hitung Ongkir Volumetrik dengan Benar', tags: ['volumetrik', 'ongkir'] },
            { title: 'Strategi Free Ongkir yang Menguntungkan', tags: ['strategi', 'seller'] },
            { title: 'Cara Mengatasi Paket Tertahan di Gudang Kurir', tags: ['problem', 'tips'] },
            { title: 'Tips Kirim Makanan Frozen via Ekspedisi', tags: ['frozen', 'makanan'] },
            { title: 'Panduan Pengiriman Internasional untuk UMKM', tags: ['internasional', 'umkm'] },
        ]
        const topic = topics[i]
        return () => ({
            slug: slugify(topic.title),
            title: `${topic.title} ${new Date().getFullYear()}`,
            description: `${topic.title}. Panduan lengkap untuk seller online dan UMKM Indonesia.`,
            tags: topic.tags,
            content: `# ${topic.title}

Panduan lengkap untuk seller online dan UMKM Indonesia mengenai ${topic.title.toLowerCase()}.

## Pendahuluan

Sebagai seller online, memahami ${topic.title.toLowerCase()} sangat penting untuk kesuksesan bisnis Anda.

## Mengapa Ini Penting?

1. **Meningkatkan kepuasan pelanggan**
2. **Mengurangi komplain dan retur**
3. **Menghemat biaya operasional**
4. **Membangun reputasi toko**

## Langkah-langkah Praktis

### 1. Persiapan Awal
- Pahami kebutuhan pelanggan
- Siapkan SOP yang jelas
- Latih tim dengan baik

### 2. Eksekusi
- Lakukan dengan konsisten
- Dokumentasikan setiap proses
- Evaluasi secara berkala

### 3. Evaluasi
- Cek feedback pelanggan
- Analisis data pengiriman
- Perbaiki yang perlu diperbaiki

## Tools yang Membantu

- **CekKirim** - Untuk cek ongkir dan tracking
- **Excel/Google Sheets** - Untuk rekap data
- **WhatsApp Business** - Untuk komunikasi pelanggan

## Kesalahan yang Harus Dihindari

1. Tidak mengecek status pengiriman secara rutin
2. Mengabaikan komplain pelanggan
3. Tidak menyimpan bukti pengiriman

## Tips Tambahan

- Selalu update nomor resi ke pelanggan
- Gunakan fitur bulk tracking CekKirim untuk efisiensi
- Simpan template pesan untuk komunikasi standar

## Kesimpulan

Dengan menerapkan tips di atas, Anda bisa meningkatkan kualitas layanan pengiriman dan kepuasan pelanggan.

---

*Gunakan fitur Cek Resi Massal di CekKirim untuk tracking hingga 100 paket sekaligus!*
`
        })
    }),

    // 51-70: Rute pengiriman populer
    ...cities.slice(0, 20).map(city => () => ({
        slug: slugify(`ongkir-${city}-ke-jakarta`),
        title: `Ongkir ${city} ke Jakarta ${new Date().getFullYear()} - Bandingkan Semua Kurir`,
        description: `Tarif ongkir dari ${city} ke Jakarta terbaru. Bandingkan harga JNE, J&T, SiCepat untuk pengiriman dari ${city}.`,
        tags: ['ongkir', city.toLowerCase(), 'jakarta'],
        content: `# Ongkir ${city} ke Jakarta ${new Date().getFullYear()}

Cari tahu berapa biaya kirim paket dari ${city} ke Jakarta dengan berbagai pilihan kurir.

## Tarif Ongkir ${city} - Jakarta

| Kurir | Regular | Express | Estimasi |
|-------|---------|---------|----------|
| JNE | Rp 18.000+ | Rp 28.000+ | 2-4 hari |
| J&T | Rp 17.000+ | Rp 26.000+ | 2-3 hari |
| SiCepat | Rp 15.000+ | Rp 22.000+ | 1-3 hari |
| Pos | Rp 12.000+ | Rp 18.000+ | 3-5 hari |

*Harga untuk berat 1 kg. Cek tarif aktual di CekKirim.*

## Kurir yang Tersedia di ${city}

Berikut kurir yang memiliki jaringan di ${city}:
- ✅ JNE
- ✅ J&T Express
- ✅ SiCepat
- ✅ Pos Indonesia
- ✅ AnterAja

## Tips Kirim dari ${city}

1. **Cek lokasi pickup terdekat**
2. **Bandingkan harga** sebelum kirim
3. **Gunakan packing yang aman**
4. **Simpan resi dengan baik**

## Cek Ongkir ${city} ke Jakarta

Gunakan CekKirim untuk mendapatkan tarif real-time dan pilih kurir terbaik.

---

*Bandingkan harga dari 10+ kurir di CekKirim!*
`
    })),

    // 71-85: Problem solving articles
    ...Array.from({ length: 15 }, (_, i) => {
        const problems = [
            'Paket Tidak Bergerak',
            'Resi Tidak Ditemukan',
            'Paket Salah Alamat',
            'Paket Hilang di Perjalanan',
            'Status Delivered Tapi Belum Terima',
            'Paket Tertahan di Customs',
            'Kurir Tidak Bisa Dihubungi',
            'Paket Rusak Saat Diterima',
            'Biaya Ongkir Berbeda dari Estimasi',
            'Paket Dikembalikan ke Pengirim',
            'COD Gagal Diproses',
            'Alamat Tidak Ditemukan Kurir',
            'Paket Terlambat dari Estimasi',
            'Nomor Resi Duplikat',
            'Tracking Tidak Update',
        ]
        const problem = problems[i]
        return () => ({
            slug: slugify(`solusi-${problem}`),
            title: `Solusi ${problem} - Cara Mengatasinya`,
            description: `Mengalami masalah ${problem.toLowerCase()}? Pelajari cara mengatasinya dengan panduan lengkap ini.`,
            tags: ['problem-solving', 'tips', 'tracking'],
            content: `# Solusi ${problem}

Mengalami masalah ${problem.toLowerCase()}? Jangan panik! Artikel ini akan membantu Anda mengatasinya.

## Penyebab ${problem}

Masalah ini biasanya terjadi karena:
1. Kesalahan input data
2. Gangguan sistem kurir
3. Kendala operasional di lapangan
4. Force majeure (cuaca, bencana)

## Langkah Penanganan

### Step 1: Verifikasi Data
- Pastikan nomor resi benar
- Cek kembali alamat pengiriman
- Konfirmasi dengan pengirim

### Step 2: Cek Status Terbaru
- Gunakan CekKirim untuk tracking real-time
- Cek di beberapa platform tracking
- Tunggu hingga 24 jam untuk update

### Step 3: Hubungi Kurir
- Siapkan nomor resi
- Hubungi customer service
- Jelaskan masalah dengan detail

### Step 4: Eskalasi jika Perlu
- Ajukan komplain resmi
- Minta kompensasi jika memenuhi syarat
- Dokumentasikan semua komunikasi

## Tips Pencegahan

1. Selalu cek alamat sebelum kirim
2. Gunakan asuransi untuk barang berharga
3. Simpan bukti pengiriman
4. Pantau status pengiriman secara rutin

## Kontak Customer Service Kurir

| Kurir | Hotline | WhatsApp |
|-------|---------|----------|
| JNE | 021-29278888 | - |
| J&T | 021-8066-1888 | - |
| SiCepat | 021-5020-0050 | - |

## Kesimpulan

Masalah ${problem.toLowerCase()} bisa diatasi dengan langkah yang tepat. Jangan ragu untuk menghubungi customer service kurir jika diperlukan.

---

*Lacak paket Anda secara real-time di CekKirim!*
`
        })
    }),

    // 86-100: Perbandingan kurir
    ...couriers.slice(0, 5).flatMap(courier1 =>
        couriers.slice(5, 8).map(courier2 => () => ({
            slug: slugify(`perbandingan-${courier1}-vs-${courier2}`),
            title: `${courier1} vs ${courier2} ${new Date().getFullYear()} - Mana yang Lebih Baik?`,
            description: `Perbandingan lengkap ${courier1} dan ${courier2}. Harga, kecepatan, layanan, dan pengalaman pengguna.`,
            tags: ['perbandingan', courier1.toLowerCase().replace(/\s+/g, '-'), courier2.toLowerCase().replace(/\s+/g, '-')],
            content: `# ${courier1} vs ${courier2} - Perbandingan Lengkap

Bingung memilih antara ${courier1} dan ${courier2}? Artikel ini membandingkan kedua kurir ini secara detail.

## Perbandingan Umum

| Aspek | ${courier1} | ${courier2} |
|-------|-------------|-------------|
| Harga | ⭐⭐⭐ | ⭐⭐⭐ |
| Kecepatan | ⭐⭐⭐ | ⭐⭐⭐ |
| Jangkauan | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Customer Service | ⭐⭐⭐ | ⭐⭐⭐ |

## Kelebihan ${courier1}

1. Jaringan luas di seluruh Indonesia
2. Layanan beragam
3. Tracking akurat
4. Berpengalaman

## Kelebihan ${courier2}

1. Harga kompetitif
2. Proses cepat
3. Aplikasi user-friendly
4. COD tersedia

## Kapan Pilih ${courier1}?

- Kirim ke daerah terpencil
- Butuh layanan premium
- Barang berharga tinggi

## Kapan Pilih ${courier2}?

- Budget terbatas
- Pengiriman dalam kota
- Butuh COD

## Kesimpulan

Kedua kurir memiliki keunggulan masing-masing. Pilih sesuai kebutuhan dan bandingkan harga di CekKirim sebelum kirim.

---

*Bandingkan harga ${courier1} dan ${courier2} di CekKirim!*
`
        }))
    ),
]

// ============================================
// GENERATE ARTICLES
// ============================================

function generateArticle(template: ArticleTemplate): string {
    return `---
title: "${template.title}"
description: "${template.description}"
date: "${getRandomDate()}"
author: "Tim CekKirim"
tags: ${JSON.stringify(template.tags)}
---

${template.content}
`
}

// Main
async function main() {
    console.log('🚀 Starting blog article generation...\n')

    let count = 0
    const maxArticles = 100

    for (const generator of articleGenerators) {
        if (count >= maxArticles) break

        const template = generator()
        const filename = `${template.slug}.mdx`
        const filepath = path.join(BLOG_DIR, filename)

        // Skip if already exists
        if (fs.existsSync(filepath)) {
            console.log(`⏭️  Skipped (exists): ${filename}`)
            continue
        }

        const content = generateArticle(template)
        fs.writeFileSync(filepath, content, 'utf-8')
        console.log(`✅ Created: ${filename}`)
        count++
    }

    console.log(`\n🎉 Done! Generated ${count} new articles.`)
    console.log(`📁 Location: ${BLOG_DIR}`)
}

main().catch(console.error)
