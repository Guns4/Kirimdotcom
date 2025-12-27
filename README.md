# 🚀 CekKirim.com - The Logistics OS

**Enterprise-Grade Logistics & Supply Chain Management Platform**

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![Phase](https://img.shields.io/badge/phase-300-blue)]()
[![License](https://img.shields.io/badge/license-MIT-green)]()

## 📋 Overview

CekKirim is a comprehensive logistics and supply chain management platform built with modern web technologies. It integrates fintech, IoT, AI, and blockchain to create a complete "Logistics OS" for enterprise operations.

## ✨ Features

### 🔐 Fintech Module
- **Invoice Management** - Professional PDF invoicing system
- **Payment Integration** - Multi-gateway payment processing
- **Bank Reconciliation** - Automated transaction matching
- **Financial Reporting** - Real-time analytics

### 📦 IoT & Hardware Integration
- **WebUSB Thermal Printer** - Direct browser-to-printer communication
- **Warehouse Barcode Scanner** - Camera-based scanning with QuaggaJS
- **Fleet GPS Tracking** - Real-time driver location monitoring
- **Smart Locker Integration** - Package drop-off automation

### 🤖 AI & Intelligence
- **Predictive ETA Engine** - ML-powered delivery predictions
- **Voice Commands** - Hands-free navigation
- **Address Normalization** - Auto-correct typos and format addresses
- **AI Consultant** - LangChain-powered support assistant

### ⛓️ Blockchain & Web3
- **Proof of Delivery** - Immutable records on Polygon blockchain
- **Smart Contracts** - Solidity-based delivery verification

### 🌍 Global Trade
- **HS Code Lookup** - Customs tariff database
- **Multi-Currency Converter** - Real-time exchange rates
- **CN23 Form Generator** - International customs documentation
- **Freight Marketplace** - LCL/FCL shipping quotes

### 🎮 Gamification
- **Loyalty Coin System** - Earn and redeem points
- **Multi-tier Rewards** - Bronze to Diamond tiers
- **Referral System** - 20% lifetime commission

### 📊 Visualization
- **3D Supply Chain Globe** - Three.js-powered route visualization
- **Smart Map** - Interactive logistics tracking
- **God Mode Dashboard** - Real-time enterprise monitoring

### 🔗 Integrations
- **Webhook System** - Event-driven automation
- **Google Sheets Sync** - Bidirectional data sync
- **Mobile Share Target** - PWA sharing capabilities

### 📱 PWA Features
- **Biometric Authentication** - WebAuthn fingerprint/face login
- **Push Notifications** - Web Push API integration
- **Offline Sync** - IndexedDB persistence
- **Install Banner** - Native app-like experience

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - App Router, Server Actions, Server Components
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Shadcn UI** - Beautiful component library

### Backend & Database
- **Supabase** - PostgreSQL with Row Level Security
- **Next.js Server Actions** - Type-safe API
- **Edge Functions** - Serverless computing

### Libraries & Tools
- **Three.js** - 3D visualization
- **React Leaflet** - Map integration
- **Recharts** - Data visualization
- **React PDF** - PDF generation
- **Ethers.js** - Web3 integration
- **LangChain** - AI orchestration
- **QuaggaJS** - Barcode scanning
- **Socket.io** - Real-time communication

## 📦 Installation

```bash
# Clone repository
git clone https://github.com/yourusername/kirimdotcom.git
cd kirimdotcom

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run database migrations
# Execute all SQL files in src/utils/supabase/migrations/ in your Supabase dashboard

# Start development server
npm run dev
```

## 🔧 Configuration

### Required Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Biometric Auth
NEXT_PUBLIC_RP_ID=localhost
NEXT_PUBLIC_RP_NAME=CekKirim

# Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key

# Currency API
OPENEXCHANGERATES_API_KEY=your_api_key

# Blockchain (optional)
BLOCKCHAIN_PRIVATE_KEY=your_wallet_private_key
BLOCKCHAIN_CONTRACT_ADDRESS=your_contract_address
BLOCKCHAIN_RPC_URL=https://rpc-mumbai.maticvigil.com

# AI Features (optional)
OPENAI_API_KEY=your_openai_key

# Google Sheets (optional)
GOOGLE_SHEETS_API_KEY=your_google_api_key
```

## 🚀 Deployment

### Using Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Using Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Deploy
railway up
```

### Manual Deployment

1. Run build: `npm run build`
2. Set environment variables on your hosting platform
3. Run migrations on production database
4. Start: `npm start`

## 📊 Project Structure

```
kirimdotcom/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── actions/              # Server Actions
│   │   ├── api/                  # API Routes
│   │   ├── freight/              # Freight Marketplace
│   │   ├── god-mode/             # Admin Dashboard
│   │   ├── marketplace/          # Vendor Directory
│   │   └── supply-chain/         # 3D Visualization
│   ├── components/               # React Components
│   │   ├── auth/                 # Authentication
│   │   ├── blockchain/           # Web3 Components
│   │   ├── currency/             # Multi-currency
│   │   ├── customs/              # International Shipping
│   │   ├── fleet/                # GPS Tracking
│   │   ├── invoice/              # Invoicing
│   │   ├── loyalty/              # Gamification
│   │   └── visualization/        # 3D Graphics
│   ├── lib/                      # Utilities
│   │   ├── ai/                   # AI Logic
│   │   ├── blockchain/           # Web3 Integration
│   │   ├── currency/             # Exchange Rates
│   │   └── monitoring/           # Analytics
│   └── utils/
│       └── supabase/
│           └── migrations/       # SQL Migrations
├── public/
│   ├── sw.js                     # Service Worker
│   └── manifest.json             # PWA Manifest
├── scripts/                      # Setup Scripts
└── contracts/                    # Smart Contracts
```

## 🧪 Testing

```bash
# Run linter
npm run lint

# Run type check
npm run type-check

# Run build test
npm run build
```

## 🔐 Security

- ✅ Row Level Security on all database tables
- ✅ Environment variables for secrets
- ✅ HTTPS required in production
- ✅ CORS properly configured
- ✅ SQL injection prevention via prepared statements
- ✅ XSS protection via React
- ✅ CSRF protection via SameSite cookies

## 📈 Performance

- ⚡ Server Components for faster initial load
- ⚡ Edge functions for low latency
- ⚡ Image optimization with Next.js
- ⚡ Bundle splitting and code optimization
- ⚡ Caching strategies (1-hour for exchange rates, etc.)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Supabase for the backend infrastructure
- Shadcn for the beautiful UI components
- All open-source contributors

## 📞 Support

For support, email support@cekririm.com or join our Slack channel.

## 🎯 Roadmap

- [x] Phase 1-100: Core Features
- [x] Phase 101-200: Advanced Features
- [x] Phase 201-300: Enterprise Features
- [ ] Phase 301+: AI-Powered Automation
- [ ] Mobile App (React Native)
- [ ] Desktop App (Electron)

---

**Built with ❤️ by the CekKirim Team**

🌟 Star us on GitHub if this project helped you!
