#!/bin/bash

# =============================================================================
# Setup Restricted Goods Checker V2 (Phase 111)
# Data-Driven Rules (JSON)
# =============================================================================

echo "Setting up Data-Driven Goods Checker..."
echo "================================================="
echo ""

# 1. Data Source
echo "1. Creating Data Source: src/data/restricted-items.json"
mkdir -p src/data

cat <<EOF > src/data/restricted-items.json
[
  {
    "keywords": ["powerbank", "baterai", "battery", "accu", "aki"],
    "status": "danger",
    "message": "❌ DILARANG via Udara! Powerbank/Baterai berisiko meledak. Wajib gunakan jalur Darat/Laut (Cargo).",
    "couriers": ["JNE Trucking", "J&T Cargo", "SiCepat Gokil"]
  },
  {
    "keywords": ["aerosol", "gas", "parfum", "spray", "pilox"],
    "status": "danger",
    "message": "❌ DILARANG via Udara! Barang mudah meledak/terbakar (Flammable Gas). Gunakan jalur Darat.",
    "couriers": ["JNE Trucking", "SiCepat Gokil"]
  },
  {
    "keywords": ["cair", "minyak", "oli", "madu", "sirup", "liquid"],
    "status": "warning",
    "message": "⚠️ Cairan berisiko bocor/ditolak bandara. Disarankan jalur Darat & Packing Kayu.",
    "couriers": ["JNE Trucking", "J&T Cargo", "Wahana"]
  },
  {
    "keywords": ["makanan", "kue", "basah", "frozen", "durian", "buah"],
    "status": "warning",
    "message": "⚠️ Makanan mudah basi wajib layanan Kilat/Next Day (1 Hari Sampai) atau Frozen Friendly.",
    "couriers": ["JNE YES", "SiCepat BEST", "PAXEL (Frozen Friendly)"]
  },
  {
    "keywords": ["tanaman", "hewan", "ikan"],
    "status": "warning",
    "message": "⚠️ Kirim makhluk hidup butuh surat karantina & layanan khusus. Cek kebijakan kurir.",
    "couriers": ["JNE (with Permit)", "Kalog (Kereta Api)"]
  }
]
EOF
echo "   [✓] JSON Data created."
echo ""

# 2. Refactor Logic
echo "2. Refactoring Logic: src/lib/goods-rules.ts"

cat <<EOF > src/lib/goods-rules.ts
import restrictedItems from '@/data/restricted-items.json';

export type ShippingMode = 'air' | 'land' | 'sea';

export interface ValidationResult {
    status: 'safe' | 'warning' | 'danger';
    message: string;
    couriers: string[];
}

interface Rule {
    keywords: string[];
    status: string;
    message: string;
    couriers: string[];
}

export function validateGoods(item: string, mode: ShippingMode = 'air'): ValidationResult {
    const lowerItem = item.toLowerCase();
    const rules = restrictedItems as Rule[];

    // Iterate through JSON configuration
    for (const rule of rules) {
        // Check if any keyword matches
        if (rule.keywords.some(keyword => lowerItem.includes(keyword))) {
            
            // Contextual override: Danger items might be okay via LAND
            if (rule.status === 'danger' && mode !== 'air') {
                 return {
                    status: 'warning',
                    message: \`⚠️ Boleh via \${mode === 'land' ? 'Darat' : 'Laut'}, tapi wajib packing extra aman.\`,
                    couriers: rule.couriers
                };
            }

            return {
                status: rule.status as 'safe' | 'warning' | 'danger',
                message: rule.message,
                couriers: rule.couriers
            };
        }
    }

    // Default Safe
    return {
        status: 'safe',
        message: '✅ Barang ini aman dikirim via semua jalur (selama packing standar).',
        couriers: ['JNE', 'J&T', 'SiCepat', 'Anteraja', 'ID Express']
    };
}
EOF
echo "   [✓] Logic refactored to use JSON."
echo ""

echo "================================================="
echo "Setup Complete!"
echo "Server Actions & UI will automatically use the new logic."
