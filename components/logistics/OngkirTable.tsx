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
import { ArrowUpDown, Trophy, Clock, Truck } from 'lucide-react';

// Type definition
export interface OngkirRate {
    id: string;
    courier: string;
    courierCode: string;
    service: string;
    description: string;
    estimatedDays: string;
    price: number;
}

interface OngkirTableProps {
    data: OngkirRate[];
}

const columnHelper = createColumnHelper<OngkirRate>();

// Utility function
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
};

export function OngkirTable({ data }: OngkirTableProps) {
    const [sorting, setSorting] = useState<SortingState>([{ id: 'price', desc: false }]);

    // Analyze Data for Badges
    const analysis = useMemo(() => {
        if (data.length === 0) return { cheapestId: null, fastestId: null };

        const sortedPrice = [...data].sort((a, b) => a.price - b.price);
        const sortedSpeed = [...data].sort((a, b) => {
            const getAvg = (s: string) => {
                const parts = s.split('-').map(p => parseInt(p.replace(/\D/g, '')));
                if (parts.length === 0 || isNaN(parts[0])) return 999;
                return parts.length > 1 ? (parts[0] + parts[1]) / 2 : parts[0];
            };
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
                );
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
                );
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
        columnHelper.display({
            id: 'actions',
            header: 'Aksi',
            cell: info => (
                <button
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                    Pilih
                </button>
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
