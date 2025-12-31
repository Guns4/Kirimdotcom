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
