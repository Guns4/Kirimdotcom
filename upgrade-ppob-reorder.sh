#!/bin/bash

# =============================================================================
# Upgrade PPOB Reorder (Phase 133)
# Retention Speed (Quick Actions)
# =============================================================================

echo "Setting up PPOB Quick Reorder..."
echo "================================================="
echo ""

# 1. Recent Numbers Component
echo "1. Creating Component: src/components/ppob/RecentNumbers.tsx"
mkdir -p src/components/ppob

cat <<EOF > src/components/ppob/RecentNumbers.tsx
'use client';

import { Zap, Smartphone, Wifi, History, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Mock Data Type
interface FavoriteItem {
    id: string;
    type: 'PLN' | 'PULSA' | 'DATA';
    number: string;
    alias?: string;
    provider?: string;
    last_trx_date: string;
}

// Mock Data Source (In real app, fetch from /api/user/favorites)
const MOCK_FAVORITES: FavoriteItem[] = [
    { id: '1', type: 'PLN', number: '14234567890', alias: 'Listrik Rumah', last_trx_date: '2024-12-20' },
    { id: '2', type: 'PULSA', number: '081234567890', alias: 'HP Ayah', provider: 'Telkomsel', last_trx_date: '2024-12-25' },
    { id: '3', type: 'DATA', number: '081234567890', alias: 'Paket Data', provider: 'Telkomsel', last_trx_date: '2024-12-28' },
];

export function RecentNumbers() {
    const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

    useEffect(() => {
        // Simulation of fetching data
        setTimeout(() => setFavorites(MOCK_FAVORITES), 500);
    }, []);

    if (favorites.length === 0) return null;

    const getIcon = (type: string) => {
        switch (type) {
            case 'PLN': return <Zap className="w-4 h-4 text-orange-400" />;
            case 'DATA': return <Wifi className="w-4 h-4 text-blue-400" />;
            default: return <Smartphone className="w-4 h-4 text-green-400" />;
        }
    };

    return (
        <div className="mb-6">
            <div className="flex items-center gap-2 mb-3 px-1">
                <History className="w-4 h-4 text-gray-400" />
                <h4 className="text-sm font-medium text-gray-300">Terakhir Dibeli</h4>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {favorites.map((item) => (
                    <Link 
                        key={item.id}
                        href={\`/ppob/checkout?product=\${item.type}&number=\${item.number}\`}
                        className="group flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-indigo-500/30 transition-all cursor-pointer"
                    >
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                            {getIcon(item.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                                {item.alias || item.provider || item.type}
                            </p>
                            <p className="text-xs text-gray-400 truncate font-mono">
                                {item.number}
                            </p>
                        </div>
                        
                        <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-indigo-400 transition-colors" />
                    </Link>
                ))}
            </div>
        </div>
    );
}
EOF
echo "   [✓] RecentNumbers component created."
echo ""

# 2. Database Schema
echo "2. Generating SQL Schema..."
cat <<EOF > ppob_favorites_schema.sql
CREATE TABLE IF NOT EXISTS public.user_favorites (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    type text NOT NULL, -- PLN, PULSA, PDAM, etc.
    destination_number text NOT NULL,
    provider_name text, -- Telkomsel, XL, etc.
    alias text,
    count_trx integer DEFAULT 1,
    last_used_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, type, destination_number)
);

-- Function to auto-save/update favorites after transaction
CREATE OR REPLACE FUNCTION public.upsert_favorite()
RETURNS TRIGGER AS \$\$
BEGIN
    IF NEW.status = 'SUCCESS' THEN
        INSERT INTO public.user_favorites (user_id, type, destination_number, provider_name, last_used_at, count_trx)
        VALUES (NEW.user_id, NEW.product_type, NEW.customer_number, NEW.provider, now(), 1)
        ON CONFLICT (user_id, type, destination_number)
        DO UPDATE SET 
            last_used_at = now(),
            count_trx = user_favorites.count_trx + 1;
    END IF;
    RETURN NEW;
END;
\$\$ LANGUAGE plpgsql;

-- Trigger (Assuming 'transactions' table exists)
DROP TRIGGER IF EXISTS trg_save_favorite ON public.transactions;
CREATE TRIGGER trg_save_favorite
AFTER UPDATE ON public.transactions
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'SUCCESS')
EXECUTE FUNCTION public.upsert_favorite();
EOF
echo "   [✓] ppob_favorites_schema.sql created."
echo ""

# Instructions
echo "================================================="
echo "Setup Complete!"
echo "1. Run ppob_favorites_schema.sql in Supabase."
echo "2. Add <RecentNumbers /> to your PPOB Dashboard page."
echo "3. Ensure your checkout page handles ?product=X&number=Y query params."
