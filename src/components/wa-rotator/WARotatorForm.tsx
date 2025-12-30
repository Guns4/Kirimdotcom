'use client';

import { useState } from 'react';
import { Plus, Trash2, Phone } from 'lucide-react';

interface CSNumber {
  number: string;
  name: string;
}

interface WARotatorFormProps {
  onSubmit: (data: {
    linkName: string;
    slug: string;
    csNumbers: CSNumber[];
    defaultMessage: string;
  }) => Promise<void>;
}

export default function WARotatorForm({ onSubmit }: WARotatorFormProps) {
  const [linkName, setLinkName] = useState('');
  const [slug, setSlug] = useState('');
  const [csNumbers, setCSNumbers] = useState<CSNumber[]>([
    { number: '', name: 'CS 1' },
    { number: '', name: 'CS 2' },
    { number: '', name: 'CS 3' },
  ]);
  const [defaultMessage, setDefaultMessage] = useState(
    'Halo! Saya tertarik dengan produk Anda.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddCS = () => {
    setCSNumbers([
      ...csNumbers,
      { number: '', name: `CS ${csNumbers.length + 1}` },
    ]);
  };

  const handleRemoveCS = (index: number) => {
    if (csNumbers.length > 1) {
      setCSNumbers(csNumbers.filter((_, i) => i !== index));
    }
  };

  const handleCSChange = (
    index: number,
    field: 'number' | 'name',
    value: string
  ) => {
    const updated = [...csNumbers];
    updated[index][field] = value;
    setCSNumbers(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const validCS = csNumbers.filter((cs) => cs.number.trim() !== '');
    if (validCS.length === 0) {
      alert('Tambahkan minimal 1 nomor WhatsApp!');
      return;
    }

    if (!slug.trim()) {
      alert('Slug link harus diisi!');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        linkName,
        slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        csNumbers: validCS,
        defaultMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-lg p-6 max-w-3xl mx-auto"
    >
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Buat WhatsApp CS Rotator
        </h2>
        <p className="text-gray-600">
          Bagikan 1 link, otomatis diarahkan ke beberapa CS secara bergantian
        </p>
      </div>

      {/* Link Name */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Nama Link
        </label>
        <input
          type="text"
          value={linkName}
          onChange={(e) => setLinkName(e.target.value)}
          placeholder="Contoh: Toko Baju Online"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      {/* Slug */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Custom Slug (Short Link)
        </label>
        <div className="flex items-center">
          <span className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-l-lg text-gray-600">
            cekkirim.com/wa/
          </span>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="toko-baju"
            className="flex-1 px-4 py-2 border border-l-0 border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            pattern="[a-z0-9-]+"
            required
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Hanya huruf kecil, angka, dan tanda hubung (-)
        </p>
      </div>

      {/* CS Numbers */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Nomor WhatsApp Customer Service
        </label>

        <div className="space-y-3">
          {csNumbers.map((cs, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-green-600" />
              </div>

              <input
                type="text"
                value={cs.name}
                onChange={(e) => handleCSChange(index, 'name', e.target.value)}
                placeholder="Nama CS"
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="tel"
                value={cs.number}
                onChange={(e) =>
                  handleCSChange(index, 'number', e.target.value)
                }
                placeholder="628123456789"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />

              {csNumbers.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveCS(index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleAddCS}
          className="mt-3 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
        >
          <Plus className="w-5 h-5" />
          Tambah CS
        </button>
      </div>

      {/* Default Message */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Pesan Default (Opsional)
        </label>
        <textarea
          value={defaultMessage}
          onChange={(e) => setDefaultMessage(e.target.value)}
          rows={3}
          placeholder="Pesan yang akan otomatis muncul saat customer chat WA"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-blue-900 mb-2">🔄 Cara Kerja:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Klik 1: Diarahkan ke CS 1</li>
          <li>• Klik 2: Diarahkan ke CS 2</li>
          <li>• Klik 3: Diarahkan ke CS 3</li>
          <li>• Klik 4: Kembali ke CS 1 (bergantian terus)</li>
        </ul>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white font-bold py-3 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Membuat Link...' : '🚀 Buat Link Rotator'}
      </button>
    </form>
  );
}
