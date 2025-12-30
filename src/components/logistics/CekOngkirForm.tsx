'use client';

import { useState } from 'react';
import Select from 'react-select';
import { motion, AnimatePresence } from 'framer-motion';
import { getCityOptions } from '@/data/cities';
import TurnstileWidget from '@/components/security/TurnstileWidget';
import { checkOngkir, type CheckOngkirResult } from '@/app/actions/logistics';

import { Package, Loader2 } from 'lucide-react';
import { OngkirResults } from './OngkirResults';

const cityOptions = getCityOptions();

const customSelectStyles = {
  control: (base: any) => ({
    ...base,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '6px',
    boxShadow: 'none',
    '&:hover': {
      borderColor: 'rgba(99, 102, 241, 0.5)',
    },
  }),
  menu: (base: any) => ({
    ...base,
    backgroundColor: 'rgba(17, 24, 39, 0.95)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isFocused
      ? 'rgba(99, 102, 241, 0.2)'
      : 'transparent',
    color: '#fff',
    '&:hover': {
      backgroundColor: 'rgba(99, 102, 241, 0.3)',
    },
  }),
  singleValue: (base: any) => ({
    ...base,
    color: '#fff',
  }),
  input: (base: any) => ({
    ...base,
    color: '#fff',
  }),
  placeholder: (base: any) => ({
    ...base,
    color: 'rgba(255, 255, 255, 0.5)',
  }),
};

export function CekOngkirForm() {
  const [origin, setOrigin] = useState<any>(null);
  const [destination, setDestination] = useState<any>(null);
  const [weight, setWeight] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CheckOngkirResult | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!origin || !destination || !weight) {
      setResult({
        success: false,
        error: 'Mohon lengkapi semua field',
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      // Read Custom Key from LocalStorage
      const customKey = localStorage.getItem('rajaongkir_api_key');
      const accountType =
        localStorage.getItem('rajaongkir_account_type') || 'starter';

      const res = await checkOngkir({
        originId: origin.value,
        destinationId: destination.value,
        weight: parseInt(weight),
        customKey: customKey || undefined,
        accountType: accountType,
        token: turnstileToken,
      });
      setResult(res);
    } catch (error) {
      setResult({
        success: false,
        error: 'Terjadi kesalahan',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        onSubmit={handleSubmit}
        className="glass-card p-6 space-y-5"
      >
        <div className="hidden">
          <TurnstileWidget onVerify={setTurnstileToken} />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Kota Asal
          </label>
          <Select
            options={cityOptions}
            value={origin}
            onChange={setOrigin}
            placeholder="Pilih kota asal..."
            styles={customSelectStyles}
            className="text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Kota Tujuan
          </label>
          <Select
            options={cityOptions}
            value={destination}
            onChange={setDestination}
            placeholder="Pilih kota tujuan..."
            styles={customSelectStyles}
            className="text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Berat Paket (gram)
          </label>
          <div className="relative">
            <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Contoh: 1000"
              min="1"
              max="30000"
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
          </div>
          <p className="text-xs text-gray-400">Maksimal 30kg (30000 gram)</p>
        </div>

        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Mencari Tarif...
            </>
          ) : (
            'Cek Ongkir'
          )}
        </motion.button>
      </motion.form>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <OngkirResults
              result={result}
              originId={origin?.value}
              destinationId={destination?.value}
              weight={parseInt(weight) || 0}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
