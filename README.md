# 📦 CekKirim - Cek Ongkir & Lacak Resi Indonesia

<p align="center">
  <img src="public/logo.png" alt="CekKirim Logo" width="120" />
</p>

<p align="center">
  <strong>Aplikasi terlengkap untuk mengecek ongkos kirim dan melacak paket dari semua ekspedisi di Indonesia.</strong>
</p>

<p align="center">
  <a href="https://www.cekkirim.com">🌐 Live Demo</a> •
  <a href="#fitur">✨ Fitur</a> •
  <a href="#instalasi">🚀 Instalasi</a> •
  <a href="#environment-variables">🔐 Env Variables</a> •
  <a href="#deployment">📤 Deployment</a>
</p>

---

## ✨ Fitur

### 🚚 Core Features
- **Cek Ongkir** - Bandingkan harga pengiriman dari 10+ ekspedisi
- **Lacak Resi** - Track paket real-time dari semua kurir
- **AI Assistant** - Analisis cerdas untuk pengiriman optimal

### 💎 Premium Features
- **Unlimited Tracking** - Tidak ada batasan harian
- **No Ads** - Pengalaman bebas iklan
- **History** - Riwayat tracking tersimpan
- **Share as Image** - Bagikan status tracking

### 🛡️ Security & Performance
- **Rate Limiting** - Proteksi dari abuse
- **API Caching** - Response cepat dengan cache Supabase
- **Edge Runtime** - Deployed ke edge untuk latency rendah
- **PWA Ready** - Install sebagai native app

### 📈 SEO & Monetization
- **Programmatic SEO** - 40+ halaman ongkir dinamis
- **Affiliate System** - Link affiliate per kurir
- **Subscription Model** - Monthly, Yearly, Lifetime plans

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| API | BinderByte Logistics API |
| AI | DeepSeek API |
| Charts | Recharts |
| Animations | Framer Motion |
| Deployment | Vercel |

---

## 🚀 Instalasi

### Prerequisites
- Node.js 18+
- npm atau yarn
- Akun Supabase
- API Key BinderByte

### Clone & Install

```bash
# Clone repository
git clone https://github.com/Guns4/Kirimdotcom.git
cd Kirimdotcom

# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Isi environment variables (lihat section di bawah)

# Run development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

---

## 🔐 Environment Variables

Buat file `.env.local` dengan variabel berikut:

```env
# ===== SUPABASE =====
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# ===== BINDERBYTE API =====
BINDERBYTE_API_KEY=your-binderbyte-api-key

# ===== AI (Optional) =====
DEEPSEEK_API_KEY=your-deepseek-api-key

# ===== ADMIN =====
ADMIN_SECRET=your-admin-secret-for-webhooks

# ===== ANALYTICS (Optional) =====
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Cara Mendapatkan API Keys:

| Service | URL | Notes |
|---------|-----|-------|
| Supabase | https://supabase.com | Free tier available |
| BinderByte | https://binderbyte.com | Beli paket API |
| DeepSeek | https://platform.deepseek.com | Optional, untuk AI |

---

## 📁 Struktur Project

```
src/
├── app/                    # Next.js App Router
│   ├── actions/           # Server Actions
│   ├── api/               # API Routes
│   ├── dashboard/         # Protected pages
│   ├── cek-ongkir/       # Programmatic SEO pages
│   └── ...               # Other pages
├── components/
│   ├── admin/            # Admin dashboard components
│   ├── affiliate/        # Affiliate buttons
│   ├── dashboard/        # User dashboard
│   ├── layout/           # Navbar, Footer
│   ├── logistics/        # Cek resi, cek ongkir forms
│   ├── reviews/          # Courier reviews
│   ├── seo/              # SEO components
│   ├── share/            # Share functionality
│   └── ui/               # Reusable UI components
├── config/               # App configuration
├── data/                 # Static data (cities, couriers)
├── lib/                  # Utilities & services
│   ├── api/             # External API clients
│   ├── cache/           # Caching logic
│   ├── payment/         # Payment gateway
│   └── supabase/        # Supabase clients
├── types/               # TypeScript types
└── utils/               # Helper functions
```

---

## 🗄️ Database Schema

Jalankan SQL berikut di Supabase SQL Editor:

1. **Core Tables:** `supabase-reviews-schema.sql`
2. **Monetization:** `supabase-monetization-schema.sql`

### Main Tables:
- `profiles` - User profiles & roles
- `search_history` - User search logs
- `cached_resi` - Cached tracking data
- `cached_ongkir` - Cached shipping rates
- `courier_reviews` - User reviews for couriers
- `subscriptions` - Premium subscriptions
- `transactions` - Payment history
- `affiliate_clicks` - Affiliate click tracking

---

## 📤 Deployment

### Deploy ke Vercel (Recommended)

1. Push code ke GitHub
2. Connect repository di [Vercel](https://vercel.com)
3. Add Environment Variables di Vercel Dashboard
4. Deploy!

```bash
# Or use Vercel CLI
npm i -g vercel
vercel
```

### Build Commands

```bash
# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Type check
npm run typecheck
```

---

## 🧪 Testing

```bash
# Install test dependencies (if not installed)
npm install -D vitest @testing-library/react

# Run tests
npm test

# Watch mode
npm run test:watch
```

---

## 📊 Admin Dashboard

Akses admin dashboard di `/dashboard/admin` (requires admin role).

Features:
- 📈 Analytics Dashboard - Traffic & metrics
- 👥 User Management - Ban/upgrade users
- ⚙️ Site Settings - Logo, maintenance mode

---

## 🔒 Security Features

- **Rate Limiting** - 20 requests/hour for AI endpoints
- **Input Validation** - Server-side validation
- **XSS Protection** - Sanitized inputs
- **CSRF Protection** - Supabase Auth handles this
- **Security Headers** - CSP, HSTS, X-Frame-Options

---

## 📱 PWA Support

CekKirim dapat diinstall sebagai native app:

1. Buka di Chrome/Safari
2. Klik "Install App" atau "Add to Home Screen"
3. Enjoy native experience!

---

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/NewFeature`)
3. Commit changes (`git commit -m 'Add NewFeature'`)
4. Push to branch (`git push origin feature/NewFeature`)
5. Open Pull Request

---

## 📄 License

MIT License - feel free to use for personal or commercial projects.

---

## 📞 Contact

- **Website:** [cekkirim.com](https://www.cekkirim.com)
- **Email:** support@cekkirim.com
- **WhatsApp:** [Contact Admin](https://wa.me/6281234567890)

---

<p align="center">
  Made with ❤️ in Indonesia 🇮🇩
</p>
