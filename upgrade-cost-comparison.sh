#!/bin/bash

# =============================================================================
# Upgrade Cost Comparison (Phase 129)
# TanStack Table & Sorting
# =============================================================================

echo "Upgrading Cost Comparison UI..."
echo "================================================="
echo ""

# 1. Install Dependencies
echo "1. Installing Dependencies..."
echo "   > npm install @tanstack/react-table"
# Note: User needs to run this manually if script execution environment doesn't support npm

# 2. Create Table Component
echo "2. Creating Component: src/components/logistics/OngkirTable.tsx"

cat <<EOF > src/components/logistics/OngkirTable.tsx
'use client';

import { useState, useMemo } from 'react';
import { 
  useReactTable, 
  getCoreRowModel, 
  getSortedRowModel, 
  flexRender,
  createColumnHelper,
  SortingState
} from '@tanstack/react-table';
import { OngkirRate } from '@/app/actions/logistics';
import { formatCurrency } from '@/lib/utils';
import { ArrowUpDown, Zap, Trophy, Clock, Truck } from 'lucide-react';
import { AffiliateButton } from '@/components/affiliate/AffiliateButton';

interface OngkirTableProps {
  data: OngkirRate[];
}

const columnHelper = createColumnHelper<OngkirRate>();

export function OngkirTable({ data }: OngkirTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'price', desc: false }]); // Default sorted by Cheapest

  // Analyze Data for Badges
  const analysis = useMemo(() => {
    if (data.length === 0) return { cheapestId: null, fastestId: null };
    
    const sortedPrice = [...data].sort((a,b) => a.price - b.price);
    const sortedSpeed = [...data].sort((a,b) => {
       const getAvg = (s: string) => {
            const parts = s.split('-').map(p => parseInt(p.replace(/\D/g, '')))
            if (parts.length === 0 || isNaN(parts[0])) return 999
            return parts.length > 1 ? (parts[0] + parts[1]) / 2 : parts[0]
       }
       return getAvg(a.estimatedDays) - getAvg(b.estimatedDays);
    });

    return {
        cheapestId: sortedPrice[0].id,
        fastestId: sortedSpeed[0].id
    };
  }, [data]);

  const columns = useMemo(() => [
    columnHelper.accessor('courier', {
      header: 'Kurir',
      cell: info => (
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <Truck className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
                <div className="font-bold text-white">{info.getValue()}</div>
                <div className="text-xs text-gray-400">{info.row.original.service}</div>
            </div>
        </div>
      ),
    }),
    columnHelper.accessor('description', {
        header: 'Layanan',
        cell: info => (
            <div className="max-w-[150px] truncate text-sm text-gray-300" title={info.getValue()}>
                {info.getValue() || '-'}
            </div>
        )
    }),
    columnHelper.accessor('estimatedDays', {
        header: ({ column }) => {
            return (
              <button
                className="flex items-center gap-1 hover:text-white transition-colors"
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              >
                Estimasi
                <ArrowUpDown className="w-3 h-3" />
              </button>
            )
        },
        cell: info => (
            <div className="flex items-center gap-2 text-sm">
                <Clock className="w-3 h-3 text-gray-400" />
                <span>{info.getValue()} Hari</span>
                 {info.row.original.id === analysis.fastestId && (
                    <span className="bg-purple-500/20 text-purple-300 text-[10px] px-1.5 py-0.5 rounded ml-1 border border-purple-500/30">
                        Tercepat
                    </span>
                 )}
            </div>
        )
    }),
    columnHelper.accessor('price', {
        header: ({ column }) => {
            return (
              <button
                className="flex items-center gap-1 hover:text-white transition-colors"
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              >
                Harga
                <ArrowUpDown className="w-3 h-3" />
              </button>
            )
        },
        cell: info => (
            <div className="flex flex-col">
                <span className="font-bold text-white">{formatCurrency(info.getValue())}</span>
                {info.row.original.id === analysis.cheapestId && (
                    <span className="flex items-center gap-1 text-[10px] text-green-400 mt-0.5">
                        <Trophy className="w-3 h-3" />
                        Termurah
                    </span>
                 )}
            </div>
        )
    }),
    // Action Column for Affiliate Button
    columnHelper.display({
        id: 'actions',
        header: 'Aksi',
        cell: info => (
            <AffiliateButton 
                courier={info.row.original.courierCode}
                service={info.row.original.service}
                price={info.row.original.price}
                compact={true}
            />
        )
    })
  ], [analysis]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="w-full overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id} className="border-b border-white/10 bg-white/5">
                    {headerGroup.headers.map(header => (
                        <th key={header.id} className="p-4 text-sm font-medium text-gray-400 select-none">
                        {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                            )}
                        </th>
                    ))}
                    </tr>
                ))}
                </thead>
                <tbody className="divide-y divide-white/5">
                {table.getRowModel().rows.map(row => (
                    <tr key={row.id} className="hover:bg-white/5 transition-colors group">
                    {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="p-4 text-gray-200">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                    ))}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
        {data.length === 0 && (
            <div className="p-8 text-center text-gray-500">
                Tidak ada data ongkir tersedia.
            </div>
        )}
    </div>
  );
}
EOF
echo "   [✓] OngkirTable (TanStack) component created."
echo ""

# 3. Update OngkirResults to use Table
echo "3. Updating OngkirResults: src/components/logistics/OngkirResults.tsx"

cat <<EOF > src/components/logistics/OngkirResults.tsx
'use client'

import { motion } from 'framer-motion'
import { CheckOngkirResult, generateAIInsight } from '@/app/actions/logistics'
import { AlertCircle, Sparkles, Leaf } from 'lucide-react'
import { AdPlaceholder } from '@/components/ads/AdPlaceholder'
import { calculateCarbonFootprint } from '@/utils/carbon-calculator'
import { OngkirTable } from './OngkirTable'

interface OngkirResultsProps {
    result: CheckOngkirResult
    originId: string
    destinationId: string
    weight: number // in grams
}

export function OngkirResults({ result, originId, destinationId, weight }: OngkirResultsProps) {
    if (!result.success) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-6 border-red-500/30"
            >
                <div className="flex items-center gap-3 text-red-400">
                    <AlertCircle className="w-6 h-6" />
                    <div>
                        <p className="font-semibold">Gagal Mengecek Ongkir</p>
                        <p className="text-sm text-red-300">{result.error}</p>
                    </div>
                </div>
            </motion.div>
        )
    }

    if (!result.data || result.data.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-6"
            >
                <p className="text-center text-gray-400">Tidak ada hasil ditemukan</p>
            </motion.div>
        )
    }

    const footprint = calculateCarbonFootprint(originId, destinationId, { value: weight, isGrams: true })

    return (
        <div className="space-y-4">
            {/* Carbon Footprint */}
            {footprint && (
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/30"
                >
                    <div className="flex items-start gap-4">
                        <div className="bg-emerald-500/20 p-2 rounded-full">
                            <Leaf className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold text-emerald-300">Jejak Karbon Paketmu</p>
                                <span className="text-xs text-emerald-400/70 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                    ~{footprint.distanceKm} km
                                </span>
                            </div>
                            <p className="text-2xl font-bold text-white mt-1">
                                {footprint.emissionKg} <span className="text-sm text-gray-400 font-normal">kg CO₂</span>
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* AI Insight */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-4 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-purple-500/30"
            >
                <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-semibold text-purple-300 mb-1">AI Insight</p>
                        <p className="text-sm text-gray-300">
                            {generateAIInsight({
                                type: 'ongkir',
                                data: result.data[0],
                            })}
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Results Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                    Ditemukan {result.data.length} Layanan
                </h3>
            </div>

            {/* Ad Placement - Top */}
            <AdPlaceholder slot="top" />

            {/* TANSTACK TABLE IMPLEMENTATION */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <OngkirTable data={result.data} />
            </motion.div>

            {/* Ad Placement - Bottom */}
            <AdPlaceholder slot="bottom" />
        </div>
    )
}
EOF
echo "   [✓] OngkirResults updated to use TanStack Table."
echo ""

# Instructions
echo "================================================="
echo "Setup Complete!"
echo "1. Run: npm install @tanstack/react-table"
echo "2. Re-run your Next.js server."
echo "3. Check Ongkir to see the Sortable Table!"
