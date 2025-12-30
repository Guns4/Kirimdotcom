'use client';

import { useState, useRef } from 'react';
import {
    Upload, Send, Users, Clock, AlertTriangle,
    PlayCircle, PauseCircle, CheckCircle, XCircle,
    FileSpreadsheet, Loader2, Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
    parseContactsFromCSV,
    validateContacts,
    estimateBroadcastTime,
    calculateCost,
    QUOTA_PRICING,
    type BroadcastContact
} from '@/lib/wa-broadcast';

export default function WABroadcastComposer() {
    const [contacts, setContacts] = useState<BroadcastContact[]>([]);
    const [invalidContacts, setInvalidContacts] = useState<string[]>([]);
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState<'idle' | 'uploading' | 'ready' | 'sending' | 'paused' | 'complete'>('idle');
    const [progress, setProgress] = useState({ sent: 0, failed: 0, total: 0 });
    const [quota] = useState(5000);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setStatus('uploading');

        try {
            const content = await file.text();
            const parsed = parseContactsFromCSV(content);
            const { valid, invalid } = validateContacts(parsed);

            setContacts(valid);
            setInvalidContacts(invalid);
            setStatus('ready');

            toast.success(`${valid.length} kontak valid diimport`, {
                description: invalid.length > 0 ? `${invalid.length} kontak tidak valid` : undefined
            });
        } catch (error: any) {
            toast.error('Gagal import kontak', { description: error.message });
            setStatus('idle');
        }
    };

    const handleStartBroadcast = async () => {
        if (!message.trim()) {
            toast.error('Tulis pesan terlebih dahulu');
            return;
        }

        if (contacts.length === 0) {
            toast.error('Upload kontak terlebih dahulu');
            return;
        }

        if (contacts.length > quota) {
            toast.error('Kuota tidak cukup', {
                description: `Butuh ${contacts.length} kuota, tersedia ${quota}`
            });
            return;
        }

        setStatus('sending');
        setProgress({ sent: 0, failed: 0, total: contacts.length });

        // Simulate broadcast (in production: call actual API)
        for (let i = 0; i < Math.min(contacts.length, 10); i++) {
            await new Promise(r => setTimeout(r, 1000));
            setProgress(prev => ({
                ...prev,
                sent: prev.sent + 1
            }));
        }

        setStatus('complete');
        toast.success('Broadcast selesai!');
    };

    const estimatedTime = estimateBroadcastTime(contacts.length);
    const estimatedCost = calculateCost(contacts.length);

    return (
        <div className="space-y-6">
            {/* Quota Display */}
            <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
                <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-sm text-purple-700">Kuota Broadcast</span>
                            <div className="text-2xl font-bold text-purple-900">{quota.toLocaleString()}</div>
                        </div>
                        <Button variant="outline" className="border-purple-300 text-purple-700">
                            <Zap className="w-4 h-4 mr-2" />
                            Beli Kuota
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Contact Upload */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-500" />
                        Upload Kontak
                    </CardTitle>
                    <CardDescription>
                        Upload file Excel/CSV dengan kolom Nama dan No HP
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileUpload}
                        className="hidden"
                    />

                    {contacts.length === 0 ? (
                        <div
                            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {status === 'uploading' ? (
                                <Loader2 className="w-12 h-12 text-gray-400 mx-auto animate-spin" />
                            ) : (
                                <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            )}
                            <p className="text-gray-600 mb-1">Klik untuk upload file</p>
                            <p className="text-sm text-gray-400">CSV atau Excel (Nama, No HP)</p>
                        </div>
                    ) : (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="w-6 h-6 text-green-500" />
                                    <div>
                                        <p className="font-medium text-green-800">{contacts.length} kontak siap</p>
                                        {invalidContacts.length > 0 && (
                                            <p className="text-sm text-orange-600">{invalidContacts.length} tidak valid</p>
                                        )}
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setContacts([]);
                                        setStatus('idle');
                                    }}
                                >
                                    Ganti File
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Message Composer */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Send className="w-5 h-5 text-green-500" />
                        Tulis Pesan
                    </CardTitle>
                    <CardDescription>
                        Gunakan {'{nama}'} untuk personalisasi
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Halo {nama}, terima kasih sudah berbelanja di toko kami! 🛍️"
                        rows={5}
                        className="mb-3"
                    />
                    <div className="text-sm text-gray-500">
                        {message.length} karakter
                    </div>
                </CardContent>
            </Card>

            {/* Broadcast Info & Start */}
            {contacts.length > 0 && message.trim() && (
                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="py-4">
                        <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                            <div>
                                <Users className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                                <div className="text-lg font-bold">{contacts.length}</div>
                                <div className="text-xs text-gray-500">Penerima</div>
                            </div>
                            <div>
                                <Clock className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                                <div className="text-lg font-bold">{estimatedTime}</div>
                                <div className="text-xs text-gray-500">Estimasi</div>
                            </div>
                            <div>
                                <Zap className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                                <div className="text-lg font-bold">{contacts.length}</div>
                                <div className="text-xs text-gray-500">Kuota dipakai</div>
                            </div>
                        </div>

                        {/* Warning */}
                        <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 mb-4 text-sm text-yellow-800">
                            <AlertTriangle className="w-4 h-4 inline mr-2" />
                            Pesan akan dikirim dengan jeda 3-10 detik per pesan untuk keamanan
                        </div>

                        {/* Progress */}
                        {status === 'sending' && (
                            <div className="mb-4">
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Progress</span>
                                    <span>{progress.sent}/{progress.total}</span>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-green-500 transition-all"
                                        style={{ width: `${(progress.sent / progress.total) * 100}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <Button
                            className="w-full bg-green-600 hover:bg-green-700"
                            onClick={handleStartBroadcast}
                            disabled={status === 'sending'}
                        >
                            {status === 'sending' ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Mengirim...
                                </>
                            ) : status === 'complete' ? (
                                <>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Selesai!
                                </>
                            ) : (
                                <>
                                    <PlayCircle className="w-4 h-4 mr-2" />
                                    Mulai Broadcast
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Pricing Packages */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Paket Kuota Broadcast</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {QUOTA_PRICING.PACKAGES.map(pkg => (
                            <div key={pkg.messages} className="border rounded-lg p-3 text-center hover:border-purple-400 cursor-pointer transition-colors">
                                <div className="text-xl font-bold text-purple-600">{pkg.label}</div>
                                <div className="text-sm text-gray-600">Rp {pkg.price.toLocaleString()}</div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
