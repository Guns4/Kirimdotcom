'use client';

import React, { useState } from 'react';
import { Truck, Search, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
// Assuming we can reuse components, if not we build simplified versions
// import { CheckCostForm } from '@/components/CheckCostForm'; 

export default function WidgetPage() {
  const [activeTab, setActiveTab] = useState<'cost' | 'track'>('cost');
  const [copied, setCopied] = useState(false);

  // Mock Result for Demo
  const [result, setResult] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    // Send message to parent window (content script)
    // window.parent.postMessage({ type: 'COPY_TEXT', text }, '*'); 

    // Local feedback
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateCheck = () => {
    if (activeTab === 'cost') {
      setResult(`🚚 *Ongkir JNE Regular*\nRp 12.000 / kg\nEstimasi: 2-3 Hari\n\n_Dicek via CekKirim.com_`);
    } else {
      setResult(`📦 *Status Resi JP123456*\n✅ Terkirim (Hari ini, 14:30)\n📍 Jakarta Selatan\n\n_Dicek via CekKirim.com_`);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-lg text-gray-900 leading-tight">CekKirim</h1>
          <p className="text-xs text-gray-500">Quick Access Widget</p>
        </div>
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
          CK
        </div>
      </div>

      {/* Tabs */}
      <div className="p-4 pb-0">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('cost')}
            className={cn(
              "flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2",
              activeTab === 'cost' ? "bg-white shadow text-blue-600" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Truck className="w-4 h-4" />
            Cek Ongkir
          </button>
          <button
            onClick={() => setActiveTab('track')}
            className={cn(
              "flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2",
              activeTab === 'track' ? "bg-white shadow text-blue-600" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Search className="w-4 h-4" />
            Cek Resi
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {/* Inputs would go here. Using simplified placeholders for widget demo */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              {activeTab === 'cost' ? 'Asal & Tujuan' : 'Nomor Resi'}
            </label>
            <input
              type="text"
              placeholder={activeTab === 'cost' ? "Ketik kecamatan asal..." : "Masukkan no resi..."}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            />
            {activeTab === 'cost' && (
              <input
                type="text"
                placeholder="Ketik kecamatan tujuan..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              />
            )}
          </div>

          <button
            onClick={handleSimulateCheck}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-500/20 active:scale-[0.98]"
          >
            {activeTab === 'cost' ? 'Cek Harga' : 'Lacak Paket'}
          </button>

          {/* Result Display */}
          {result && (
            <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div className="flex justify-between items-start gap-2 mb-2">
                <h3 className="text-sm font-semibold text-blue-900">Hasil Pencarian</h3>

                <button
                  onClick={() => handleCopy(result)}
                  className="p-1.5 hover:bg-blue-100 rounded-md text-blue-600 transition-colors"
                  title="Salin untuk chat"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <pre className="text-xs text-blue-800 whitespace-pre-wrap font-sans bg-white/50 p-2 rounded-lg border border-blue-100/50">
                {result}
              </pre>

              <p className="text-[10px] text-blue-500 mt-2 text-center">
                Tekan ikon copy untuk menyalin ke chat WhatsApp
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
        <p className="text-[10px] text-gray-400">Powered by CekKirim Enterprise</p>
      </div>
    </div>
  );
}
