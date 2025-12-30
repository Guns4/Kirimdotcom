'use client';

import { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle } from 'lucide-react';
import DropoffScanner from '@/components/agent/DropoffScanner';
import HandoverSignature from '@/components/agent/HandoverSignature';
import { getAgentInventory } from '@/lib/dropoff-service';

export default function AgentDropoffPage() {
    const [activeTab, setActiveTab] = useState<'INBOUND' | 'OUTBOUND'>('INBOUND');
    const [inventory, setInventory] = useState<any[]>([]);

    // Selection for handover
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Refresh inventory
    const loadInventory = async () => {
        const items = await getAgentInventory();
        setInventory(items);
        // Reset selection if item gone
        setSelectedIds([]);
    };

    useEffect(() => {
        loadInventory();
    }, []);

    const toggleSelection = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(x => x !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const selectAll = () => {
        if (selectedIds.length === inventory.length) setSelectedIds([]);
        else setSelectedIds(inventory.map(x => x.id));
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 pb-20 pt-8">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">Manajemen Paket</h1>
                    <p className="text-gray-500">Scan paket masuk dari pelanggan & serah terima ke kurir.</p>
                </header>

                <div className="flex bg-white rounded-xl p-1 mb-6 shadow-sm border border-gray-200">
                    <button
                        onClick={() => setActiveTab('INBOUND')}
                        className={`flex-1 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 ${activeTab === 'INBOUND' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-50'
                            }`}
                    >
                        <Package className="w-4 h-4" /> Terima Paket (Scan)
                    </button>
                    <button
                        onClick={() => setActiveTab('OUTBOUND')}
                        className={`flex-1 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 ${activeTab === 'OUTBOUND' ? 'bg-orange-100 text-orange-700' : 'text-gray-500 hover:bg-gray-50'
                            }`}
                    >
                        <Truck className="w-4 h-4" /> Serah Terima Kurir
                    </button>
                </div>

                {activeTab === 'INBOUND' && (
                    <div className="space-y-6">
                        <DropoffScanner onScanSuccess={loadInventory} />

                        <div>
                            <h3 className="font-bold text-gray-700 mb-3 flex justify-between">
                                Paket Menunggu ({inventory.length})
                                <span className="text-xs font-normal text-gray-500 bg-gray-200 px-2 py-1 rounded">Real-time</span>
                            </h3>
                            {inventory.length === 0 ? (
                                <div className="text-center py-10 text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
                                    Belum ada paket menumpuk.
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
                                    {inventory.map(item => (
                                        <div key={item.id} className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                                    <Package className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-mono font-bold text-gray-800">{item.receipt_number}</p>
                                                    <p className="text-xs text-gray-500">{new Date(item.created_at).toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-bold">
                                                Siap Pick Up
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'OUTBOUND' && (
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-gray-700">Pilih Paket ({selectedIds.length})</h3>
                                <button onClick={selectAll} className="text-blue-600 text-sm font-medium">
                                    Pilih Semua
                                </button>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100 max-h-[60vh] overflow-y-auto">
                                {inventory.map(item => (
                                    <div
                                        key={item.id}
                                        onClick={() => toggleSelection(item.id)}
                                        className={`p-4 flex items-center gap-3 cursor-pointer transition-colors ${selectedIds.includes(item.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                                    >
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${selectedIds.includes(item.id) ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                                            {selectedIds.includes(item.id) && <CheckCircle className="w-3 h-3 text-white" />}
                                        </div>
                                        <div>
                                            <p className="font-mono font-bold text-gray-800">{item.receipt_number}</p>
                                        </div>
                                    </div>
                                ))}
                                {inventory.length === 0 && (
                                    <div className="p-8 text-center text-gray-400">Tidak ada paket untuk diserahkan.</div>
                                )}
                            </div>
                        </div>

                        <div>
                            {selectedIds.length > 0 ? (
                                <HandoverSignature
                                    packageIds={selectedIds}
                                    onComplete={() => {
                                        alert('Berhasil diserahkan!');
                                        loadInventory();
                                    }}
                                />
                            ) : (
                                <div className="bg-gray-100 rounded-xl p-8 text-center text-gray-500 h-full flex items-center justify-center border-2 border-dashed border-gray-200">
                                    Pilih paket di kiri untuk memulai serah terima.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
