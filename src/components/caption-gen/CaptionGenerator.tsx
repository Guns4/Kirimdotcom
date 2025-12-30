'use client';

import { useState } from 'react';
import { Copy, Check, Share2, Heart, Filter } from 'lucide-react';

interface CaptionTemplate {
  id: string;
  template_text: string;
  category: string;
  sales_type: string;
  template_name: string;
  usage_count: number;
}

interface CaptionGeneratorProps {
  templates: CaptionTemplate[];
}

export default function CaptionGenerator({ templates }: CaptionGeneratorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter templates
  const filteredTemplates = templates.filter((template) => {
    const matchesCategory =
      selectedCategory === 'all' || template.category === selectedCategory;
    const matchesType =
      selectedType === 'all' || template.sales_type === selectedType;
    const matchesSearch =
      template.template_text
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      template.template_name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesType && matchesSearch;
  });

  // Copy to clipboard
  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Share to WhatsApp Story
  const handleShareToWA = (text: string) => {
    const encoded = encodeURIComponent(text);
    const waUrl = `https://wa.me/?text=${encoded}`;
    window.open(waUrl, '_blank');
  };

  const categories = [
    { value: 'all', label: 'Semua Kategori', emoji: '🎯' },
    { value: 'fashion', label: 'Fashion', emoji: '👗' },
    { value: 'food', label: 'Makanan', emoji: '🍔' },
    { value: 'electronics', label: 'Elektronik', emoji: '📱' },
    { value: 'beauty', label: 'Kecantikan', emoji: '💄' },
    { value: 'general', label: 'Umum', emoji: '📦' },
  ];

  const types = [
    { value: 'all', label: 'Semua Tipe' },
    { value: 'hard_selling', label: 'Hard Selling' },
    { value: 'soft_selling', label: 'Soft Selling' },
    { value: 'discount', label: 'Diskon/Promo' },
    { value: 'educational', label: 'Edukatif' },
  ];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-gray-900">Filter Caption</h3>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Category filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Kategori Produk
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.emoji} {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Type filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tipe Jualan
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              {types.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Cari Caption
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ketik kata kunci..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Menampilkan{' '}
          <span className="font-bold">{filteredTemplates.length}</span> caption
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredTemplates.length === 0 ? (
          <div className="col-span-2 text-center py-12">
            <p className="text-gray-500 mb-4">
              Tidak ada caption yang sesuai filter
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedType('all');
                setSearchQuery('');
              }}
              className="text-purple-600 hover:underline"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">
                    {template.template_name}
                  </h3>
                  <div className="flex gap-2">
                    <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded">
                      {
                        categories.find((c) => c.value === template.category)
                          ?.label
                      }
                    </span>
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                      {
                        types.find((t) => t.value === template.sales_type)
                          ?.label
                      }
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  👥 {template.usage_count}x digunakan
                </div>
              </div>

              {/* Caption text */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-gray-700 whitespace-pre-wrap text-sm">
                  {template.template_text}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    handleCopy(template.template_text, template.id)
                  }
                  className={`flex-1 ${
                    copiedId === template.id
                      ? 'bg-green-600'
                      : 'bg-purple-600 hover:bg-purple-700'
                  } text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2`}
                >
                  {copiedId === template.id ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Salin Teks</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleShareToWA(template.template_text)}
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transitio n-colors flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share WA</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
