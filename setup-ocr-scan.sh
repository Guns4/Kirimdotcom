#!/bin/bash

# =============================================================================
# Setup OCR Scanner V2 (Phase 113)
# Mobile Convenience (Camera + File Upload)
# =============================================================================

echo "Setting up OCR Scanner V2..."
echo "================================================="
echo ""

# 0. Install Dependency
echo "0. Installing Tesseract.js..."
echo "   > npm install tesseract.js"
echo "   (Please run this manually if needed)"

# 1. Component
echo "1. Creating Component: src/components/tools/ReceiptScanner.tsx"
mkdir -p src/components/tools

cat <<EOF > src/components/tools/ReceiptScanner.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { createWorker } from 'tesseract.js';
import { Camera, Upload, X, Loader2, ScanLine, Image as ImageIcon } from 'lucide-react';

interface Props {
    onScan: (text: string) => void;
    onClose: () => void;
}

export default function ReceiptScanner({ onScan, onClose }: Props) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [mode, setMode] = useState<'camera' | 'upload'>('camera');
    const [scanning, setScanning] = useState(false);
    const [status, setStatus] = useState('Initializing...');
    const [cameraActive, setCameraActive] = useState(false);

    useEffect(() => {
        if (mode === 'camera') startCamera();
        return () => stopCamera();
    }, [mode]);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setCameraActive(true);
                setStatus('Ready to Scan');
            }
        } catch (err) {
            console.error(err);
            setStatus('Camera Error. Try Upload Mode.');
            setMode('upload');
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            setCameraActive(false);
        }
    };

    const processImage = async (imageSource: CanvasImageSource) => {
        if (!canvasRef.current) return;

        setScanning(true);
        setStatus('Reading Text...');

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        // Resize canvas to match image
        if (imageSource instanceof HTMLVideoElement) {
            canvas.width = imageSource.videoWidth;
            canvas.height = imageSource.videoHeight;
        } else if (imageSource instanceof HTMLImageElement) {
            canvas.width = imageSource.naturalWidth;
            canvas.height = imageSource.naturalHeight;
        }

        ctx?.drawImage(imageSource as any, 0, 0, canvas.width, canvas.height);

        try {
            const worker = await createWorker('eng');
            const ret = await worker.recognize(canvas.toDataURL('image/jpeg'));
            await worker.terminate();

            const text = ret.data.text;
            console.log('OCR Raw:', text);
            
            const potentialResi = extractResi(text);
            
            if (potentialResi) {
                onScan(potentialResi);
                onClose();
            } else {
                setStatus('No tracking number found.');
                setScanning(false);
            }
        } catch (err) {
            console.error(err);
            setStatus('OCR Failed.');
            setScanning(false);
        }
    };

    const handleCameraCapture = () => {
        if (videoRef.current) processImage(videoRef.current);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const img = new Image();
        img.onload = () => processImage(img);
        img.src = URL.createObjectURL(file);
    };

    const extractResi = (text: string): string | null => {
        const lines = text.split('\n');
        // Simple regex for 8-20 alphanumeric chars
        const resiPattern = /[A-Z0-9]{8,20}/g;
        
        for (const line of lines) {
            const clean = line.replace(/[^A-Z0-9]/g, '');
            const match = clean.match(resiPattern);
            if (match) {
                const candidate = match[0];
                if (['INVOICE', 'TOTAL', 'JL', 'PENGIRIM', 'PENERIMA'].some(w => candidate.includes(w))) continue;
                return candidate;
            }
        }
        return null;
    };

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
            {/* Header */}
            <div className="absolute top-0 w-full p-4 flex justify-between items-center z-10">
                <span className="text-white font-medium drop-shadow-md">Scan Resi</span>
                <button onClick={onClose} className="p-2 bg-black/40 rounded-full text-white backdrop-blur-md">
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Viewport */}
            <div className="relative w-full h-full bg-black flex flex-col">
                {mode === 'camera' ? (
                    <div className="flex-1 relative overflow-hidden">
                        <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 border-2 border-indigo-500/50 m-12 rounded-lg flex items-center justify-center pointer-events-none">
                            <ScanLine className="w-full h-2 text-indigo-400 animate-pulse opacity-50" />
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center bg-gray-900 text-white p-6 text-center">
                        <ImageIcon className="w-16 h-16 text-gray-700 mb-4" />
                        <p className="text-gray-400 mb-6">Upload foto resi dari galeri</p>
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-indigo-600 px-6 py-3 rounded-xl font-semibold flex items-center gap-2"
                        >
                            <Upload className="w-5 h-5" />
                            Pilih Foto
                        </button>
                    </div>
                )}
            </div>

            {/* Hidden stuff */}
            <canvas ref={canvasRef} className="hidden" />
            <input 
                type="file" 
                ref={fileInputRef} 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileUpload}
            />

            {/* Controls */}
            <div className="absolute bottom-0 w-full bg-gradient-to-t from-black via-black/80 to-transparent pb-10 pt-20 px-6 flex flex-col items-center gap-6">
                
                {/* Status Pill */}
                <div className="bg-white/10 px-4 py-1.5 rounded-full text-white text-xs font-medium backdrop-blur-md border border-white/10">
                    {status}
                </div>

                {/* Buttons Row */}
                <div className="flex items-center gap-8">
                    {/* Switch Mode */}
                    <button 
                         onClick={() => setMode(mode === 'camera' ? 'upload' : 'camera')}
                         className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition"
                    >
                        {mode === 'camera' ? <Upload className="w-6 h-6" /> : <Camera className="w-6 h-6" />}
                        <span className="text-[10px] uppercase tracking-wide font-bold">
                            {mode === 'camera' ? 'Upload' : 'Camera'}
                        </span>
                    </button>

                    {/* Shutter */}
                    {mode === 'camera' && (
                        <button 
                            onClick={handleCameraCapture}
                            disabled={!cameraActive || scanning}
                            className="w-20 h-20 rounded-full bg-white border-4 border-indigo-500 flex items-center justify-center active:scale-95 transition-transform shadow-lg shadow-indigo-500/20"
                        >
                            {scanning ? (
                                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                            ) : (
                                <div className="w-16 h-16 bg-white rounded-full border-2 border-black/10" />
                            )}
                        </button>
                    )}
                     
                     {/* Placeholder for symmetry / settings */}
                     <div className="w-10 opacity-0" />
                </div>
            </div>
        </div>
    );
}
EOF
echo "   [✓] Component logic created."
echo ""

echo "================================================="
echo "Setup Complete!"
