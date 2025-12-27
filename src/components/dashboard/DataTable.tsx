'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

/**
 * Data Table - Professional Dashboard Tables
 * Features: Zebra striping, sticky header, action buttons, pagination
 */

interface Column<T> {
    key: keyof T | string;
    header: string;
    render?: (item: T) => React.ReactNode;
    className?: string;
    sortable?: boolean;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    keyField: keyof T;
    onEdit?: (item: T) => void;
    onDelete?: (item: T) => void;
    onView?: (item: T) => void;
    actions?: (item: T) => React.ReactNode;
    loading?: boolean;
    emptyMessage?: string;
    className?: string;
}

export function DataTable<T extends Record<string, any>>({
    columns,
    data,
    keyField,
    onEdit,
    onDelete,
    onView,
    actions,
    loading = false,
    emptyMessage = 'Tidak ada data',
    className,
}: DataTableProps<T>) {
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const handleSort = (key: string) => {
        if (sortKey === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortOrder('asc');
        }
    };

    const sortedData = [...data].sort((a, b) => {
        if (!sortKey) return 0;
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    const hasActions = onEdit || onDelete || onView || actions;

    return (
        <div className={cn('bg-white rounded-xl border border-surface-100 overflow-hidden', className)}>
            <div className="overflow-x-auto">
                <table className="w-full">
                    {/* Header - Sticky */}
                    <thead className="bg-surface-50 border-b border-surface-100 sticky top-0 z-10">
                        <tr>
                            {columns.map((col) => (
                                <th
                                    key={String(col.key)}
                                    className={cn(
                                        'px-4 py-3 text-left text-xs font-semibold text-surface-600 uppercase tracking-wider',
                                        col.sortable && 'cursor-pointer hover:bg-surface-100 select-none',
                                        col.className
                                    )}
                                    onClick={() => col.sortable && handleSort(String(col.key))}
                                >
                                    <div className="flex items-center gap-1">
                                        {col.header}
                                        {col.sortable && sortKey === String(col.key) && (
                                            <span className="text-primary-500">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                                        )}
                                    </div>
                                </th>
                            ))}
                            {hasActions && (
                                <th className="px-4 py-3 text-right text-xs font-semibold text-surface-600 uppercase tracking-wider w-32">
                                    Aksi
                                </th>
                            )}
                        </tr>
                    </thead>

                    {/* Body - Zebra striping */}
                    <tbody className="divide-y divide-surface-100">
                        {loading ? (
                            <tr>
                                <td colSpan={columns.length + (hasActions ? 1 : 0)} className="py-12 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                                        <p className="text-sm text-surface-500">Memuat data...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : sortedData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + (hasActions ? 1 : 0)} className="py-12 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="text-4xl">📭</span>
                                        <p className="text-sm text-surface-500">{emptyMessage}</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            sortedData.map((item, index) => (
                                <tr
                                    key={String(item[keyField])}
                                    className={cn(
                                        'hover:bg-primary-50/50 transition-colors',
                                        index % 2 === 1 && 'bg-surface-50/50' // Zebra striping
                                    )}
                                >
                                    {columns.map((col) => (
                                        <td key={String(col.key)} className={cn('px-4 py-3 text-sm text-surface-700', col.className)}>
                                            {col.render ? col.render(item) : item[col.key]}
                                        </td>
                                    ))}
                                    {hasActions && (
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {actions ? (
                                                    actions(item)
                                                ) : (
                                                    <>
                                                        {onView && (
                                                            <Button variant="ghost" size="icon-sm" onClick={() => onView(item)} title="Lihat">
                                                                👁️
                                                            </Button>
                                                        )}
                                                        {onEdit && (
                                                            <Button variant="ghost" size="icon-sm" onClick={() => onEdit(item)} title="Edit">
                                                                ✏️
                                                            </Button>
                                                        )}
                                                        {onDelete && (
                                                            <Button variant="ghost" size="icon-sm" onClick={() => onDelete(item)} title="Hapus">
                                                                🗑️
                                                            </Button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            {data.length > 0 && (
                <div className="px-4 py-3 border-t border-surface-100 flex items-center justify-between bg-surface-50/50">
                    <p className="text-xs text-surface-500">
                        Menampilkan <span className="font-medium">{data.length}</span> data
                    </p>
                    <div className="flex gap-1">
                        <Button variant="ghost" size="sm" disabled>
                            ←
                        </Button>
                        <Button variant="primary" size="sm">
                            1
                        </Button>
                        <Button variant="ghost" size="sm" disabled>
                            →
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

// Status Badge
export function StatusBadge({
    status,
    variant,
}: {
    status: string;
    variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
}) {
    const variants = {
        success: 'bg-success-100 text-success-700',
        warning: 'bg-warning-100 text-warning-700',
        error: 'bg-error-100 text-error-700',
        info: 'bg-info-100 text-info-700',
        default: 'bg-surface-100 text-surface-600',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                variants[variant || 'default']
            )}
        >
            {status}
        </span>
    );
}

export default DataTable;
