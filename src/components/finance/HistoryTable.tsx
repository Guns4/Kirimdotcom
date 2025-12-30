'use client';

import { useState, useEffect } from 'react';
import { getTransactionHistory, TransactionFilter } from '@/app/actions/history';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface LedgerEntry {
    id: string;
    created_at: string;
    entry_type: 'CREDIT' | 'DEBIT';
    description: string;
    reference_id: string | null;
    amount: number;
}

export function HistoryTable() {
    const [filter, setFilter] = useState<TransactionFilter>('ALL');
    const [data, setData] = useState<LedgerEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [filter]);

    async function loadData() {
        setLoading(true);
        const res = await getTransactionHistory(filter);
        setData(res as LedgerEntry[]);
        setLoading(false);
    }

    const handleExport = () => {
        // Simple CSV Export
        const headers = ['Tanggal', 'Tipe', 'Deskripsi', 'Ref ID', 'Nominal'];
        const rows = data.map(item => [
            format(new Date(item.created_at), 'yyyy-MM-dd HH:mm:ss'),
            item.entry_type,
            `"${item.description}"`, // Quote to handle commas
            item.reference_id || '-',
            item.amount
        ]);

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `transaksi_${filter}_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Riwayat Transaksi</h2>
                <div className="flex gap-2">
                    <Select value={filter} onValueChange={(v) => setFilter(v as TransactionFilter)}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Pilih Periode" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Semua</SelectItem>
                            <SelectItem value="THIS_MONTH">Bulan Ini</SelectItem>
                            <SelectItem value="LAST_MONTH">Bulan Lalu</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button variant="outline" onClick={handleExport} disabled={data.length === 0}>
                        <Download className="w-4 h-4 mr-2" /> Export CSV
                    </Button>
                </div>
            </div>

            <div className="border rounded-xl bg-card overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Waktu</TableHead>
                            <TableHead>Deskripsi</TableHead>
                            <TableHead>Tipe</TableHead>
                            <TableHead className="text-right">Nominal</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={4} className="text-center h-24">Memuat data...</TableCell></TableRow>
                        ) : data.length === 0 ? (
                            <TableRow><TableCell colSpan={4} className="text-center h-24 text-muted-foreground">Tidak ada transaksi.</TableCell></TableRow>
                        ) : (
                            data.map((tx) => (
                                <TableRow key={tx.id}>
                                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                        {format(new Date(tx.created_at), 'dd MMM yyyy HH:mm', { locale: id })}
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">{tx.description}</div>
                                        <div className="text-[10px] text-muted-foreground">Ref: {tx.reference_id || '-'}</div>
                                    </TableCell>
                                    <TableCell>
                                        {tx.entry_type === 'CREDIT' ? (
                                            <span className="inline-flex items-center text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                                <ArrowDownLeft className="w-3 h-3 mr-1" /> Masuk
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full">
                                                <ArrowUpRight className="w-3 h-3 mr-1" /> Keluar
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className={`text-right font-mono font-bold ${tx.entry_type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}>
                                        {tx.entry_type === 'CREDIT' ? '+' : '-'} Rp {tx.amount.toLocaleString('id-ID')}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
