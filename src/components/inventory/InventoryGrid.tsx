'use client';

import { useState, useTransition } from 'react';
import {
  Plus,
  Minus,
  Package,
  AlertTriangle,
  AlertCircle,
  Search,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils'; // Assuming you have this, otherwise implementation below

// Simple formatter if lib doesn't exist
const formatRp = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
};

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  stock: number;
  cost_price: number;
  sell_price?: number;
  image_url?: string;
}

interface Props {
  items: InventoryItem[];
  onUpdateStock: (id: string, delta: number) => Promise<void>;
}

export function InventoryGrid({ items, onUpdateStock }: Props) {
  const [search, setSearch] = useState('');
  const [isPending, startTransition] = useTransition();

  const filtered = items.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.sku.toLowerCase().includes(search.toLowerCase())
  );

  const lowStockCount = items.filter((i) => i.stock > 0 && i.stock < 5).length;
  const outOfStockCount = items.filter((i) => i.stock === 0).length;

  const handleStockUpdate = (id: string, delta: number) => {
    startTransition(async () => {
      try {
        await onUpdateStock(id, delta);
      } catch (e) {
        console.error('Failed to update stock', e);
        alert('Gagal update stok');
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Summaries */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <div className="text-gray-500 text-xs font-bold uppercase tracking-wider">
            Total Produk
          </div>
          <div className="text-2xl font-black text-gray-800">
            {items.length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <div className="text-gray-500 text-xs font-bold uppercase tracking-wider">
            Total Stok
          </div>
          <div className="text-2xl font-black text-indigo-600">
            {items.reduce((acc, curr) => acc + curr.stock, 0)}
          </div>
        </div>
        <div
          className={`p-4 rounded-xl border shadow-sm ${lowStockCount > 0 ? 'bg-orange-50 border-orange-200' : 'bg-white'}`}
        >
          <div
            className={`${lowStockCount > 0 ? 'text-orange-600' : 'text-gray-500'} text-xs font-bold uppercase tracking-wider flex items-center gap-1`}
          >
            {lowStockCount > 0 && <AlertTriangle className="w-3 h-3" />}
            Stok Menipis
          </div>
          <div
            className={`text-2xl font-black ${lowStockCount > 0 ? 'text-orange-700' : 'text-gray-800'}`}
          >
            {lowStockCount}
          </div>
        </div>
        <div
          className={`p-4 rounded-xl border shadow-sm ${outOfStockCount > 0 ? 'bg-red-50 border-red-200' : 'bg-white'}`}
        >
          <div
            className={`${outOfStockCount > 0 ? 'text-red-600' : 'text-gray-500'} text-xs font-bold uppercase tracking-wider flex items-center gap-1`}
          >
            {outOfStockCount > 0 && <AlertCircle className="w-3 h-3" />}
            Habis
          </div>
          <div
            className={`text-2xl font-black ${outOfStockCount > 0 ? 'text-red-700' : 'text-gray-800'}`}
          >
            {outOfStockCount}
          </div>
        </div>
      </div>

      {/* Search & Actions */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari nama produk atau SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        {/* Add Product Button could go here */}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map((item) => (
          <div
            key={item.id}
            className={`bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md ${item.stock === 0 ? 'opacity-75 grayscale-[0.5]' : ''}`}
          >
            {/* Header/Image Area */}
            <div className="h-32 bg-gray-100 relative flex items-center justify-center">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="w-10 h-10 text-gray-300" />
              )}

              {/* Stock Badge for Image */}
              <div className="absolute top-2 right-2">
                {item.stock === 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                    HABIS
                  </span>
                )}
                {item.stock > 0 && item.stock < 5 && (
                  <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                    MENIPIS
                  </span>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-4 flex-1 flex flex-col">
              <div className="mb-1">
                <span className="text-[10px] text-gray-400 font-mono bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                  {item.sku}
                </span>
              </div>
              <h3
                className="font-bold text-gray-800 leading-tight mb-2 line-clamp-2"
                title={item.name}
              >
                {item.name}
              </h3>

              <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-gray-400 uppercase">
                    Harga Jual
                  </div>
                  <div className="font-bold text-indigo-600">
                    {item.sell_price ? formatRp(item.sell_price) : '-'}
                  </div>
                  {item.cost_price > 0 && (
                    <div className="text-[10px] text-gray-400">
                      Modal: {formatRp(item.cost_price)}
                    </div>
                  )}
                </div>

                {/* Stock Controls */}
                <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200">
                  <button
                    onClick={() => handleStockUpdate(item.id, -1)}
                    disabled={isPending || item.stock <= 0}
                    className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm border border-gray-200 text-gray-600 hover:text-red-600 hover:border-red-200 disabled:opacity-50 active:scale-95 transition"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <div className="w-8 text-center font-bold text-lg leading-none">
                    {item.stock}
                  </div>
                  <button
                    onClick={() => handleStockUpdate(item.id, 1)}
                    disabled={isPending}
                    className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm border border-gray-200 text-gray-600 hover:text-green-600 hover:border-green-200 disabled:opacity-50 active:scale-95 transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-400">
            Tidak ada produk ditemukan.
          </div>
        )}
      </div>
    </div>
  );
}
