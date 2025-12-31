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
