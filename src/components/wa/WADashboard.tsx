'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { QrCode, RefreshCw, MessageSquare } from 'lucide-react';
import { connectWAAction } from '@/app/actions/wa-actions';
import { toast } from 'sonner';

export function WADashboard() {
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [status, setStatus] = useState('disconnected'); // disconnected, scanning, connected
    const [loading, setLoading] = useState(false);

    const handleConnect = async () => {
        setLoading(true);
        setQrCode(null);
        try {
            const res = await connectWAAction();
            if (res.error) {
                toast.error(res.error);
                setStatus('disconnected');
            } else {
                if (res.qr) {
                    setQrCode(res.qr);
                    setStatus('scanning');
                    toast.info('Please scan the QR Code');
                } else if (res.status === 'connected') {
                    setStatus('connected');
                    toast.success('WhatsApp Connected!');
                }
            }
        } catch (e) {
            toast.error('Failed to initiate connection');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-md mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-green-100 rounded-lg text-green-600">
                    <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="font-bold text-lg text-gray-800">WhatsApp Bot</h2>
                    <p className="text-sm text-gray-500">Connect your number to enable automation</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Status Card */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Status</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize
                        ${status === 'connected' ? 'bg-green-100 text-green-700' :
                            status === 'scanning' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'}`}>
                        {status}
                    </span>
                </div>

                {/* QR Display */}
                {status === 'scanning' && qrCode && (
                    <div className="flex flex-col items-center justify-center p-6 bg-white border-2 border-dashed border-gray-200 rounded-xl relative">
                        <img src={qrCode} alt="WA QR Code" className="w-48 h-48" />
                        <p className="text-xs text-gray-500 mt-4 text-center">
                            Open WhatsApp on your phone {'>'} Linked Devices {'>'} Link a Device
                        </p>
                        {/* overlay refresh */}
                        <button
                            onClick={handleConnect}
                            className="absolute top-2 right-2 p-2 bg-white shadow rounded-full text-gray-500 hover:text-blue-500"
                            title="Refresh QR"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Actions */}
                {status !== 'connected' && (
                    <Button
                        onClick={handleConnect}
                        disabled={loading}
                        className="w-full bg-[#25D366] hover:bg-[#1db954] text-white py-6 text-lg shadow-lg shadow-green-200"
                    >
                        {loading ? 'Initializing...' : (status === 'scanning' ? 'Refresh QR Code' : 'Connect WhatsApp')}
                    </Button>
                )}

                {status === 'connected' && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-100 text-green-800 text-sm text-center">
                        ✅ Your WhatsApp is connected and ready to send messages.
                    </div>
                )}
            </div>
        </div>
    );
}
