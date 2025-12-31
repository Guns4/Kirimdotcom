import React from 'react';

// ==========================================
// TypeScript Interfaces
// ==========================================

interface Product {
    id: string;
    sku: string;
    name: string;
    type: 'PHYSICAL' | 'DIGITAL_SMM' | 'DIGITAL_FILE';
    category?: string;
    price_sell: number;
    image_url?: string;
    stock: number;
    description: string;
    is_featured?: boolean;
}

interface ProductCardProps {
    product: Product;
    onAddToCart: (product: Product) => void;
    compact?: boolean;  // For grid layouts
}

// ==========================================
// ProductCard Component
// ==========================================

export default function ProductCard({
    product,
    onAddToCart,
    compact = false
}: ProductCardProps) {

    const isPhysical = product.type === 'PHYSICAL';
    const isDigital = product.type.startsWith('DIGITAL');
    const isOutOfStock = isPhysical && product.stock <= 0;
    const isLowStock = isPhysical && product.stock > 0 && product.stock <= 10;

    // Get badge styling
    const getBadgeStyle = () => {
        if (isPhysical) {
            return 'bg-blue-100 text-blue-800 border border-blue-200';
        }
        return 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200';
    };

    // Get badge icon & text
    const getBadgeContent = () => {
        if (isPhysical) {
            return '📦 PHYSICAL';
        }
        if (product.type === 'DIGITAL_SMM') {
            return '⚡ INSTANT SMM';
        }
        return '💾 DIGITAL';
    };

    // Format price
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    return (
        <div
            className={`
        bg-white border-2 border-gray-200 rounded-xl overflow-hidden
        hover:border-blue-400 hover:shadow-xl transition-all duration-300
        ${compact ? 'h-full' : ''}
        ${product.is_featured ? 'ring-2 ring-yellow-400 ring-offset-2' : ''}
      `}
        >
            {/* Product Image */}
            <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
                {product.image_url ? (
                    <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                ) : (
                    <div className="text-center">
                        <div className="text-6xl mb-2">
                            {isPhysical ? '📦' : '⚡'}
                        </div>
                        <p className="text-xs text-gray-400">No Image</p>
                    </div>
                )}

                {/* Featured Badge */}
                {product.is_featured && (
                    <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                        ⭐ FEATURED
                    </div>
                )}

                {/* Stock Warning Badge */}
                {isLowStock && (
                    <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse">
                        🔥 {product.stock} LEFT!
                    </div>
                )}

                {/* Out of Stock Overlay */}
                {isOutOfStock && (
                    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                        <div className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold">
                            SOLD OUT
                        </div>
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className="p-4">
                {/* Type Badge */}
                <div className="mb-3">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${getBadgeStyle()}`}>
                        {getBadgeContent()}
                    </span>
                </div>

                {/* Product Name */}
                <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 min-h-[48px] text-base">
                    {product.name}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[40px]">
                    {product.description}
                </p>

                {/* Divider */}
                <div className="border-t border-gray-200 my-3"></div>

                {/* Price & Stock */}
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Harga</p>
                        <p className="text-2xl font-bold text-green-600">
                            {formatPrice(product.price_sell)}
                        </p>
                    </div>

                    <div className="text-right">
                        {isPhysical ? (
                            <>
                                <p className="text-xs text-gray-500">Stok</p>
                                <p className={`font-bold ${isOutOfStock ? 'text-red-600' :
                                        isLowStock ? 'text-orange-600' :
                                            'text-gray-700'
                                    }`}>
                                    {product.stock} pcs
                                </p>
                            </>
                        ) : (
                            <div className="flex items-center gap-1 text-green-600">
                                <span className="text-xs">✓</span>
                                <span className="text-xs font-semibold">Unlimited</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Add to Cart Button */}
                <button
                    onClick={() => onAddToCart(product)}
                    disabled={isOutOfStock}
                    className={`
            w-full py-3 px-4 rounded-lg font-semibold text-sm
            transition-all duration-300 transform
            ${isOutOfStock
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : isDigital
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 hover:scale-105 shadow-lg hover:shadow-xl'
                                : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 shadow-md hover:shadow-lg'
                        }
          `}
                >
                    {isOutOfStock ? (
                        <>
                            <span className="mr-2">🚫</span>
                            Stok Habis
                        </>
                    ) : isDigital ? (
                        <>
                            <span className="mr-2">⚡</span>
                            Beli Sekarang (Instant)
                        </>
                    ) : (
                        <>
                            <span className="mr-2">🛒</span>
                            Tambah ke Keranjang
                        </>
                    )}
                </button>

                {/* Additional Info */}
                {isDigital && (
                    <p className="text-center text-xs text-gray-500 mt-2">
                        📱 Proses otomatis • Garansi 30 hari
                    </p>
                )}

                {isPhysical && !isOutOfStock && (
                    <p className="text-center text-xs text-gray-500 mt-2">
                        🚚 Gratis ongkir min. belanja Rp 50.000
                    </p>
                )}
            </div>
        </div>
    );
}

// ==========================================
// Export Types
// ==========================================

export type { Product, ProductCardProps };
