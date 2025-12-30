'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    QrCode, Smartphone, Check, X, RefreshCw,
    MessageSquare, Trash2, Loader2, Wifi, WifiOff
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface WASessionStatus {
    sessionId: string;
    status: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'QR_READY' | 'NOT_FOUND';
    qrCode?: string;
    phoneNumber?: string;
}

export default function WADashboard() {
    const [sessions, setSessions] = useState<WASessionStatus[]>([]);
    const [loading, setLoading] = useState(false);
    const [creatingSession, setCreatingSession] = useState(false);
    const [activeQR, setActiveQR] = useState<string | null>(null);

    // Mock session for demo
    useEffect(() => {
        setSessions([
            {
                sessionId: 'wa_demo_1',
                status: 'CONNECTED',
                phoneNumber: '628123456789'
            }
        ]);
    }, []);

    const handleCreateSession = async () => {
        setCreatingSession(true);
        try {
            // In production: Call API to create session
            const newSession: WASessionStatus = {
                sessionId: `wa_new_${Date.now()}`,
                status: 'QR_READY',
                qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' // Placeholder
            };

            setSessions(prev => [...prev, newSession]);
            setActiveQR(newSession.sessionId);
            toast.success('Scan QR Code dengan WhatsApp Anda');
        } catch (error) {
            toast.error('Gagal membuat sesi baru');
        } finally {
            setCreatingSession(false);
        }
    };

    const handleDeleteSession = async (sessionId: string) => {
        try {
            // In production: Call API to delete session
            setSessions(prev => prev.filter(s => s.sessionId !== sessionId));
            toast.success('Sesi dihapus');
        } catch (error) {
            toast.error('Gagal menghapus sesi');
        }
    };

    const handleRefreshQR = async (sessionId: string) => {
        setLoading(true);
        try {
            // In production: Call API to refresh QR
            toast.success('QR Code di-refresh');
        } catch (error) {
            toast.error('Gagal refresh QR');
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'CONNECTED':
                return <Wifi className="w-5 h-5 text-green-500" />;
            case 'CONNECTING':
                return <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" />;
            case 'QR_READY':
                return <QrCode className="w-5 h-5 text-blue-500" />;
            default:
                return <WifiOff className="w-5 h-5 text-red-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CONNECTED': return 'bg-green-100 text-green-800 border-green-200';
            case 'CONNECTING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'QR_READY': return 'bg-blue-100 text-blue-800 border-blue-200';
            default: return 'bg-red-100 text-red-800 border-red-200';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">WhatsApp Bot Manager</h1>
                    <p className="text-gray-600">Hubungkan dan kelola bot WA Anda</p>
                </div>
                <Button
                    onClick={handleCreateSession}
                    disabled={creatingSession}
                    className="bg-green-600 hover:bg-green-700"
                >
                    {creatingSession ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Smartphone className="w-4 h-4 mr-2" />
                    )}
                    Hubungkan WA Baru
                </Button>
            </div>

            {/* Sessions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sessions.map(session => (
                    <Card key={session.sessionId} className="relative overflow-hidden">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base flex items-center gap-2">
                                    {getStatusIcon(session.status)}
                                    <span>
                                        {session.phoneNumber
                                            ? `+${session.phoneNumber}`
                                            : 'Menunggu Koneksi'}
                                    </span>
                                </CardTitle>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(session.status)}`}>
                                    {session.status}
                                </span>
                            </div>
                            <CardDescription className="text-xs">
                                ID: {session.sessionId}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* QR Code Display */}
                            {session.status === 'QR_READY' && session.qrCode && (
                                <div className="bg-white p-4 rounded-lg border-2 border-dashed border-green-300 text-center">
                                    <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                                        <QrCode className="w-24 h-24 text-gray-400" />
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">
                                        Scan dengan WhatsApp
                                    </p>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleRefreshQR(session.sessionId)}
                                        disabled={loading}
                                    >
                                        <RefreshCw className={`w-3 h-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
                                        Refresh QR
                                    </Button>
                                </div>
                            )}

                            {/* Connected Status */}
                            {session.status === 'CONNECTED' && (
                                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                    <div className="flex items-center gap-2 text-green-700 mb-2">
                                        <Check className="w-5 h-5" />
                                        <span className="font-medium">Terhubung</span>
                                    </div>
                                    <p className="text-sm text-green-600">
                                        Bot siap menerima dan mengirim pesan
                                    </p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2">
                                {session.status === 'CONNECTED' && (
                                    <Button size="sm" variant="outline" className="flex-1">
                                        <MessageSquare className="w-3 h-3 mr-1" />
                                        Test Pesan
                                    </Button>
                                )}
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDeleteSession(session.sessionId)}
                                >
                                    <Trash2 className="w-3 h-3" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {/* Empty State */}
                {sessions.length === 0 && (
                    <Card className="col-span-full border-dashed">
                        <CardContent className="py-12 text-center">
                            <Smartphone className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="font-medium text-gray-900 mb-1">
                                Belum ada WhatsApp terhubung
                            </h3>
                            <p className="text-sm text-gray-500 mb-4">
                                Klik tombol "Hubungkan WA Baru" untuk memulai
                            </p>
                            <Button onClick={handleCreateSession}>
                                <Smartphone className="w-4 h-4 mr-2" />
                                Hubungkan Sekarang
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Instructions */}
            <Card className="bg-blue-50 border-blue-200">
                <CardContent className="py-4">
                    <h3 className="font-medium text-blue-900 mb-2">Cara Menghubungkan:</h3>
                    <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                        <li>Klik "Hubungkan WA Baru"</li>
                        <li>Buka WhatsApp di HP Anda</li>
                        <li>Pilih Menu → Perangkat Tertaut → Tautkan Perangkat</li>
                        <li>Scan QR Code yang muncul</li>
                        <li>Selesai! Bot siap digunakan</li>
                    </ol>
                </CardContent>
            </Card>
        </div>
    );
}
