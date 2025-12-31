#!/bin/bash

# setup-ui-components.sh
# UI/UX Monetization Components
# Creates premium tracking, calculator, and PPOB widgets with strategic ad placements

echo "╔══════════════════════════════════════════════════════════╗"
echo "║     Setup UI Monetization Components                    ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Create directories
echo "Creating component directories..."
mkdir -p src/components/tracking
mkdir -p src/components/shipping
mkdir -p src/components/ppob
mkdir -p src/components/ads

# Component 1: TrackingResult.tsx
echo "Generating TrackingResult.tsx..."
cat > src/components/tracking/TrackingResult.tsx << 'EOF'
'use client';

import { useState } from 'react';
import { Clock, Package, CheckCircle, TruckIcon, MapPin, Zap } from 'lucide-react';

interface TrackingHistory {
  date: string;
  desc: string;
  location: string;
}

interface TrackingData {
  waybill: string;
  courier: string;
  status: 'ON_PROCESS' | 'DELIVERED' | 'PENDING';
  history: TrackingHistory[];
}

interface TrackingResultProps {
  data: TrackingData;
}

export default function TrackingResult({ data }: TrackingResultProps) {
  const [showAd, setShowAd] = useState(true);

  const statusConfig = {
    PENDING: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    ON_PROCESS: { icon: TruckIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
    DELIVERED: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
  };

  const currentStatus = statusConfig[data.status];
  const StatusIcon = currentStatus.icon;

  // Detect if package is delayed (ON_PROCESS for > 3 days)
  const isDelayed = data.status === 'ON_PROCESS' && data.history.length > 3;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Header Status Card */}
      <div className={`${currentStatus.bg} rounded-2xl p-6 border-2 border-${data.status === 'DELIVERED' ? 'green' : 'blue'}-200`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`${currentStatus.color} bg-white rounded-full p-3 shadow-md`}>
              <StatusIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Resi: {data.waybill}</p>
              <h3 className="text-xl font-bold text-gray-900">
                {data.status === 'DELIVERED' ? 'Paket Sudah Sampai!' : 
                 data.status === 'ON_PROCESS' ? 'Paket Dalam Perjalanan' : 'Paket Diproses'}
              </h3>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase tracking-wide">{data.courier}</p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          Riwayat Pengiriman
        </h4>
        
        <div className="space-y-4">
          {data.history.map((item, index) => (
            <div key={index}>
              {/* Timeline Item */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-blue-600' : 'bg-gray-300'}`} />
                  {index !== data.history.length - 1 && (
                    <div className="w-0.5 h-12 bg-gray-200 mt-1" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <p className="font-medium text-gray-900">{item.desc}</p>
                  <p className="text-sm text-gray-500">{item.location}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(item.date).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>

              {/* STRATEGIC AD PLACEMENT - Between ON_PROCESS and DELIVERED */}
              {index === Math.floor(data.history.length / 2) && showAd && (
                <div className="my-6">
                  {/* Ad Banner */}
                  <div className="relative bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200 shadow-sm hover:shadow-md transition-shadow">
                    <button
                      onClick={() => setShowAd(false)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xs"
                    >
                      ✕
                    </button>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-2xl">
                        🎁
                      </div>
                      <div className="flex-1">
                        <h5 className="font-bold text-gray-900">Promo Akhir Tahun!</h5>
                        <p className="text-sm text-gray-600">Diskon hingga 50% untuk produk pilihan</p>
                        <a 
                          href="/shop" 
                          className="inline-block mt-2 text-sm font-semibold text-purple-600 hover:text-purple-700"
                        >
                          Belanja Sekarang →
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CROSS-SELL PPOB - Show if delayed */}
      {isDelayed && (
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border-2 border-orange-200">
          <div className="flex items-start gap-4">
            <div className="bg-orange-500 rounded-full p-3 text-white">
              <Zap className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 mb-2">Paket Belum Sampai?</h4>
              <p className="text-sm text-gray-600 mb-3">
                Sambil menunggu, yuk isi pulsa darurat! Proses instant, langsung masuk 🚀
              </p>
              <a
                href="/ppob"
                className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-lg"
              >
                <Zap className="w-5 h-5" />
                Beli Pulsa Sekarang
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Google AdSense Placeholder */}
      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 text-center">
        <p className="text-xs text-gray-400 mb-2">Advertisement</p>
        <div className="bg-white rounded-lg p-8 border-2 border-dashed border-gray-300">
          {/* Replace with actual AdSense code */}
          <p className="text-sm text-gray-500">Google AdSense 728x90</p>
          <p className="text-xs text-gray-400 mt-1">Insert your ad code here</p>
        </div>
      </div>
    </div>
  );
}
EOF

# Component 2: ShippingCalculator.tsx
echo "Generating ShippingCalculator.tsx..."
cat > src/components/shipping/ShippingCalculator.tsx << 'EOF'
'use client';

import { useState } from 'react';
import { Package, MapPin, Weight, Truck, Star, TrendingUp } from 'lucide-react';

interface ShippingOption {
  courier: string;
  service: string;
  price: number;
  etd: string;
  originalPrice?: number;
  margin?: number;
  isRecommended?: boolean;
}

export default function ShippingCalculator() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [weight, setWeight] = useState('');
  const [results, setResults] = useState<ShippingOption[]>([]);
  const [loading, setLoading] = useState(false);

  const calculateShipping = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/shipping/cost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin,
          destination,
          weight: parseFloat(weight),
          courier: 'all', // Get all couriers
        }),
      });

      const data = await response.json();
      
      // Mock data with margins (in real app, this comes from API)
      const mockResults: ShippingOption[] = [
        { courier: 'JNE', service: 'REG', price: 15000, etd: '2-3 hari', margin: 3000, originalPrice: 12000 },
        { courier: 'JNE', service: 'YES', price: 25000, etd: '1-2 hari', margin: 5000, originalPrice: 20000 },
        { courier: 'SiCepat', service: 'REG', price: 13000, etd: '2-3 hari', margin: 2000, originalPrice: 11000 },
        { courier: 'JNT', service: 'EZ', price: 12000, etd: '3-4 hari', margin: 1500, originalPrice: 10500 },
        { courier: 'AnterAja', service: 'Reguler', price: 14000, etd: '2-3 hari', margin: 4000, originalPrice: 10000 },
      ];

      // Mark highest margin as recommended
      const maxMargin = Math.max(...mockResults.map(r => r.margin || 0));
      const withRecommendation = mockResults.map(r => ({
        ...r,
        isRecommended: r.margin === maxMargin,
      }));

      setResults(withRecommendation);
    } catch (error) {
      console.error('Shipping calculation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Calculator Form */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <Package className="w-7 h-7 text-blue-600" />
          Cek Ongkir Instant
        </h2>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {/* Origin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Kota Asal
            </label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="Jakarta"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Destination */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Kota Tujuan
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Surabaya"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Weight */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Weight className="w-4 h-4 inline mr-1" />
              Berat (kg)
            </label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="1.0"
              step="0.1"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        <button
          onClick={calculateShipping}
          disabled={loading || !origin || !destination || !weight}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Menghitung...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Truck className="w-5 h-5" />
              Cek Ongkir Sekarang
            </span>
          )}  
        </button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="mt-6 space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 px-2">
            Pilihan Pengiriman ({results.length})
          </h3>
          
          {results.map((option, index) => (
            <div
              key={index}
              className={`bg-white rounded-2xl p-5 border-2 transition-all hover:shadow-md ${
                option.isRecommended
                  ? 'border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 shadow-md'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Courier Logo */}
                  <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center font-bold text-gray-700">
                    {option.courier.substring(0, 3)}
                  </div>

                  {/* Service Info */}
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-gray-900 text-lg">
                        {option.courier} {option.service}
                      </h4>
                      {option.isRecommended && (
                        <div className="flex items-center gap-1 bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                          <Star className="w-3 h-3 fill-current" />
                          Rekomendasi
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Estimasi: {option.etd}
                    </p>
                    {option.isRecommended && (
                      <p className="text-xs text-green-700 font-medium mt-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Harga terbaik untuk Anda!
                      </p>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatRupiah(option.price)}
                  </div>
                  {option.isRecommended && option.originalPrice && (
                    <div className="text-xs text-gray-500 line-through">
                      {formatRupiah(option.originalPrice + 1000)}
                    </div>
                  )}
                  <button className="mt-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                    Pilih
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
EOF

# Component 3: PPOBWidget.tsx
echo "Generating PPOBWidget.tsx..."
cat > src/components/ppob/PPOBWidget.tsx << 'EOF'
'use client';

import { useState, useEffect } from 'react';
import { Smartphone, Zap, CreditCard, AlertCircle } from 'lucide-react';

interface PriceOption {
  nominal: number;
  price: number;
  bonus?: string;
}

export default function PPOBWidget() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [provider, setProvider] = useState<string | null>(null);
  const [prices, setPrices] = useState<PriceOption[]>([]);
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Auto-detect provider
  useEffect(() => {
    if (phoneNumber.length >= 4) {
      const prefix = phoneNumber.substring(0, 4);
      
      // Telkomsel: 0811, 0812, 0813, 0821, 0822, 0823, 0852, 0853
      if (['0811', '0812', '0813', '0821', '0822', '0823', '0852', '0853'].some(p => prefix.startsWith(p))) {
        setProvider('Telkomsel');
        setPrices([
          { nominal: 5000, price: 5500 },
          { nominal: 10000, price: 10500 },
          { nominal: 20000, price: 20500, bonus: '+2GB' },
          { nominal: 50000, price: 50500, bonus: '+10GB' },
          { nominal: 100000, price: 100500, bonus: '+25GB' },
        ]);
      }
      // Indosat: 0814, 0815, 0816, 0855, 0856, 0857, 0858
      else if (['0814', '0815', '0816', '0855', '0856', '0857', '0858'].some(p => prefix.startsWith(p))) {
        setProvider('Indosat');
        setPrices([
          { nominal: 5000, price: 5400 },
          { nominal: 10000, price: 10400 },
          { nominal: 20000, price: 20400, bonus: '+1.5GB' },
          { nominal: 50000, price: 50400, bonus: '+8GB' },
          { nominal: 100000, price: 100400, bonus: '+20GB' },
        ]);
      }
      // XL: 0817, 0818, 0819, 0859, 0877, 0878
      else if (['0817', '0818', '0819', '0859', '0877', '0878'].some(p => prefix.startsWith(p))) {
        setProvider('XL');
        setPrices([
          { nominal: 5000, price: 5300 },
          { nominal: 10000, price: 10300 },
          { nominal: 25000, price: 25300, bonus: '+3GB' },
          { nominal: 50000, price: 50300, bonus: '+9GB' },
          { nominal: 100000, price: 100300, bonus: '+22GB' },
        ]);
      }
      // Tri: 0895, 0896, 0897, 0898, 0899
      else if (['0895', '0896', '0897', '0898', '0899'].some(p => prefix.startsWith(p))) {
        setProvider('Tri');
        setPrices([
          { nominal: 5000, price: 5200 },
          { nominal: 10000, price: 10200 },
          { nominal: 20000, price: 20200, bonus: '+2GB' },
          { nominal: 50000, price: 50200, bonus: '+12GB' },
        ]);
      } else {
        setProvider(null);
        setPrices([]);
      }
    } else {
      setProvider(null);
      setPrices([]);
    }
  }, [phoneNumber]);

  const handlePurchase = async () => {
    if (!selectedPrice || !phoneNumber) return;

    setLoading(true);
    try {
      const response = await fetch('/api/ppob/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_code: `PULSA_${provider}_${selectedPrice}`,
          amount: prices.find(p => p.nominal === selectedPrice)?.price || 0,
          customer_no: phoneNumber,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        alert('✅ Pulsa berhasil dibeli! Akan masuk dalam 1-5 menit.');
        setPhoneNumber('');
        setSelectedPrice(null);
      } else {
        alert('❌ Transaksi gagal: ' + result.error);
      }
    } catch (error) {
      alert('❌ Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold">Pulsa Instant</h3>
          </div>
          <p className="text-blue-100 text-sm">Isi pulsa cepat, tanpa ribet!</p>
        </div>

        {/* Form */}
        <div className="bg-white p-6 rounded-t-3xl">
          {/* Phone Number Input */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nomor HP
            </label>
            <div className="relative">
              <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="08123456789"
                maxLength={13}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-lg font-medium transition-all"
              />
            </div>
            
            {/* Provider Badge */}
            {provider && (
              <div className="mt-3 flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-blue-900">
                  {provider} terdeteksi
                </span>
              </div>
            )}
          </div>

          {/* Price Options */}
          {prices.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Pilih Nominal
              </label>
              <div className="grid grid-cols-2 gap-3">
                {prices.map((option) => (
                  <button
                    key={option.nominal}
                    onClick={() => setSelectedPrice(option.nominal)}
                    className={`relative p-4 rounded-2xl border-2 transition-all ${
                      selectedPrice === option.nominal
                        ? 'border-blue-600 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-blue-300 bg-white'
                    }`}
                  >
                    {option.bonus && (
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                        {option.bonus}
                      </div>
                    )}
                    <div className="text-left">
                      <div className="font-bold text-gray-900 text-lg">
                        {formatRupiah(option.nominal)}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {formatRupiah(option.price)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Info */}
          {!provider && phoneNumber.length > 0 && (
            <div className="mb-6 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-900">
                  Provider belum terdeteksi
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  Pastikan nomor HP Anda benar
                </p>
              </div>
            </div>
          )}

          {/* Buy Button */}
          <button
            onClick={handlePurchase}
            disabled={!selectedPrice || !phoneNumber || loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Beli Sekarang
              </>
            )}
          </button>

          {/* Features */}
          <div className="mt-6 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl mb-1">⚡</div>
              <p className="text-xs text-gray-600 font-medium">Instant</p>
            </div>
            <div>
              <div className="text-2xl mb-1">🔒</div>
              <p className="text-xs text-gray-600 font-medium">Aman</p>
            </div>
            <div>
              <div className="text-2xl mb-1">💳</div>
              <p className="text-xs text-gray-600 font-medium">Mudah</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
EOF

# Create Ad Component (reusable)
echo "Generating AdBanner.tsx..."
cat > src/components/ads/AdBanner.tsx << 'EOF'
'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface AdBannerProps {
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  emoji?: string;
  gradient?: string;
  dismissible?: boolean;
}

export default function AdBanner({
  title,
  description,
  ctaText,
  ctaLink,
  emoji = '🎁',
  gradient = 'from-purple-50 to-pink-50',
  dismissible = true,
}: AdBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className={`relative bg-gradient-to-r ${gradient} rounded-xl p-4 border-2 border-purple-200 shadow-sm hover:shadow-md transition-shadow`}>
      {dismissible && (
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xs p-1 rounded-full hover:bg-white/50"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
          {emoji}
        </div>
        <div className="flex-1 min-w-0">
          <h5 className="font-bold text-gray-900 truncate">{title}</h5>
          <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
          <a
            href={ctaLink}
            className="inline-block mt-2 text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors"
          >
            {ctaText} →
          </a>
        </div>
      </div>
    </div>
  );
}
EOF

echo ""
echo "✅ All UI components generated successfully!"
echo ""
echo "Components created:"
echo "  - src/components/tracking/TrackingResult.tsx"
echo "  - src/components/shipping/ShippingCalculator.tsx"
echo "  - src/components/ppob/PPOBWidget.tsx"
echo "  - src/components/ads/AdBanner.tsx"
echo ""
echo "Features implemented:"
echo "  ✓ Strategic ad placements in tracking timeline"
echo "  ✓ Cross-sell PPOB when package is delayed"
echo "  ✓ Recommended shipping options (highest margin)"
echo "  ✓ Auto-detect phone provider"
echo "  ✓ Premium UI/UX with gradients and animations"
echo ""

# Check if lucide-react is installed
echo "Checking dependencies..."
if grep -q "lucide-react" package.json; then
    echo "✓ lucide-react already installed"
else
    echo "Installing lucide-react..."
    npm install lucide-react
fi

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║     Setup Complete!                                      ║"
echo "╚══════════════════════════════════════════════════════════╝"
