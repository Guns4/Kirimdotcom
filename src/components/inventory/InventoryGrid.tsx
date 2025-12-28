'use client';

import { useState, useTransition } from 'react';
import { Plus, Minus, Package, AlertTriangle, RefreshCw } from 'lucide-react';

export interface InventoryItem {
    id: string;
    name: string;
    sku: string;
    stock: number;
    cost_price: number;
    sell_price?: number;
    image_url?: string;
    user_id: string;
    created_at?: string;
    updated_at?: string;
}

interface InventoryCardProps {
    item: InventoryItem;
    onUpdateStock: (id: string, delta: number) => Promise<void>;
}

const LOW_STOCK_THRESHOLD = 5;

/**
 * Single Inventory Item Card
 */
export function InventoryCard({ item, onUpdateStock }: InventoryCardProps) {
    const [isPending, startTransition] = useTransition();
    const isLowStock = item.stock < LOW_STOCK_THRESHOLD;
    const isOutOfStock = item.stock === 0;

    const handleStockChange = (delta: number) => {
        startTransition(async () => {
            await onUpdateStock(item.id, delta);
        });
    };

    return (
        <div
            className={`
        bg-white rounded-xl border-2 p-4 transition-all
        ${isOutOfStock ? 'border-red-500 bg-red-50' : isLowStock ? 'border-orange-400 bg-orange-50' : 'border-surface-200'}
      `}
        >
            {/* Low Stock Alert */}
            {isLowStock && !isOutOfStock && (
                <div className="flex items-center gap-2 text-orange-600 text-xs font-medium mb-3 bg-orange-100 px-2 py-1 rounded-lg">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Stok Menipis! Kulakan Sekarang</span>
                </div>
            )}

            {isOutOfStock && (
                <div className="flex items-center gap-2 text-red-600 text-xs font-medium mb-3 bg-red-100 px-2 py-1 rounded-lg">
                    <AlertTriangle className="w-3 h-3" />
                    <span>HABIS!</span>
                </div>
            )}

            {/* Product Info */}
            <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 bg-surface-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                        <Package className="w-6 h-6 text-surface-400" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-surface-900 truncate">{item.name}</h3>
                    <p className="text-xs text-surface-500">SKU: {item.sku}</p>
                </div>
            </div>

            {/* Stock Display */}
            <div className="text-center mb-4">
                <div className={`text-4xl font-bold ${isOutOfStock ? 'text-red-500' : isLowStock ? 'text-orange-500' : 'text-surface-900'}`}>
                    {item.stock}
                </div>
                <div className="text-xs text-surface-500">unit tersedia</div>
            </div>

            {/* Quick Update Buttons */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => handleStockChange(-1)}
                    disabled={isPending || item.stock === 0}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    {isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Minus className="w-4 h-4" />}
                    <span className="text-sm font-medium">1</span>
                </button>
                <button
                    onClick={() => handleStockChange(1)}
                    disabled={isPending}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 disabled:opacity-50 transition"
                >
                    {isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    <span className="text-sm font-medium">1</span>
                </button>
            </div>

            {/* Price Info */}
            <div className="mt-3 pt-3 border-t border-surface-100 flex justify-between text-xs text-surface-500">
                <span>Modal: Rp {item.cost_price.toLocaleString('id-ID')}</span>
                {item.sell_price && (
                    <span>Jual: Rp {item.sell_price.toLocaleString('id-ID')}</span>
                )}
            </div>
        </div>
    );
}

/**
 * Inventory Grid Component
 */
interface InventoryGridProps {
    items: InventoryItem[];
    onUpdateStock: (id: string, delta: number) => Promise<void>;
}

export function InventoryGrid({ items, onUpdateStock }: InventoryGridProps) {
    const lowStockItems = items.filter(i => i.stock < LOW_STOCK_THRESHOLD && i.stock > 0);
    const outOfStockItems = items.filter(i => i.stock === 0);

    return (
        <div className="space-y-6">
            {/* Alerts Summary */}
            {(lowStockItems.length > 0 || outOfStockItems.length > 0) && (
                <div className="flex gap-4 flex-wrap">
                    {outOfStockItems.length > 0 && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-sm font-medium">{outOfStockItems.length} barang habis</span>
                        </div>
                    )}
                    {lowStockItems.length > 0 && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-sm font-medium">{lowStockItems.length} stok menipis</span>
                        </div>
                    )}
                </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.map(item => (
                    <InventoryCard
                        key={item.id}
                        item={item}
                        onUpdateStock={onUpdateStock}
                    />
                ))}
            </div>
        </div>
    );
}

export default InventoryGrid;
