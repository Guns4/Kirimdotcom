'use client';

import { useState, useEffect } from 'react';
import { Save, Key, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [accountType, setAccountType] = useState('starter'); // starter, pro
  const [savedKey, setSavedKey] = useState('');

  useEffect(() => {
    // Load from localStorage on mount
    const key = localStorage.getItem('rajaongkir_api_key');
    const type = localStorage.getItem('rajaongkir_account_type');
    if (key) {
      setApiKey(key);
      setSavedKey(key);
    }
    if (type) {
      setAccountType(type);
    }
  }, []);

  const handleSave = () => {
    if (!apiKey.trim()) {
      localStorage.removeItem('rajaongkir_api_key');
      localStorage.removeItem('rajaongkir_account_type');
      setSavedKey('');
      toast.success('API Key dihapus. Kembali ke mode default.');
      return;
    }

    localStorage.setItem('rajaongkir_api_key', apiKey.trim());
    localStorage.setItem('rajaongkir_account_type', accountType);
    setSavedKey(apiKey.trim());
    toast.success('Pengaturan berhasil disimpan di browser Anda.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 pt-24 pb-16 px-4">
      <div className="container-custom max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Pengaturan</h1>

        <div className="glass-card p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-indigo-500/20 rounded-xl">
              <Key className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Custom API Key</h2>
              <p className="text-sm text-gray-400">
                Gunakan API Key RajaOngkir pribadi Anda
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex gap-3 text-sm text-yellow-200">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <p>
                API Key Anda disimpan{' '}
                <strong>hanya di browser (LocalStorage)</strong> dan tidak
                pernah disimpan di database kami. Key hanya dikirim saat Anda
                melakukan cek ongkir.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tipe Akun RajaOngkir
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="starter"
                      checked={accountType === 'starter'}
                      onChange={(e) => setAccountType(e.target.value)}
                      className="form-radio text-indigo-500 bg-white/10 border-white/20"
                    />
                    <span className="text-white">Starter (Free)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="pro"
                      checked={accountType === 'pro'}
                      onChange={(e) => setAccountType(e.target.value)}
                      className="form-radio text-indigo-500 bg-white/10 border-white/20"
                    />
                    <span className="text-white">Pro (Paid)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  API Key
                </label>
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Tempel API Key Anda di sini..."
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {savedKey ? 'Update Pengaturan' : 'Simpan Pengaturan'}
              </button>
            </div>

            {savedKey && (
              <div className="flex items-center gap-2 text-green-400 text-sm bg-green-500/10 p-3 rounded-lg">
                <CheckCircle className="w-4 h-4" />
                <span>API Key aktif dan siap digunakan.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
