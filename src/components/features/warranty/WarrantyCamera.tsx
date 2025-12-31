'use client';

import React, { useState } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Button } from '@/components/ui/button';
import { Camera as CameraIcon, Save, X } from 'lucide-react';

export function WarrantyCamera({ onCapture }: { onCapture: (base64: string) => void }) {
    const [preview, setPreview] = useState<string | null>(null);

    const takePhoto = async () => {
        try {
            const image = await Camera.getPhoto({
                quality: 90,
                allowEditing: true, // Allow user to crop/adjust
                resultType: CameraResultType.DataUrl,
                source: CameraSource.Camera
            });

            if (image.dataUrl) {
                setPreview(image.dataUrl);
                onCapture(image.dataUrl);
            }
        } catch (e) {
            console.log('User cancelled or camera failed', e);
        }
    };

    const reset = () => {
        setPreview(null);
        onCapture('');
    };

    return (
        <div className="w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 relative overflow-hidden">
            {preview ? (
                <>
                    <img src={preview} alt="Warranty Doc" className="w-full h-full object-cover" />
                    <button
                        onClick={reset}
                        className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </>
            ) : (
                <div className="text-center p-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                        <CameraIcon className="w-6 h-6 text-gray-500" />
                    </div>
                    <p className="text-xs text-gray-500 mb-3">Foto Struk / Kartu Garansi</p>
                    <Button onClick={takePhoto} size="sm" variant="outline">
                        Buka Kamera
                    </Button>
                </div>
            )}

            {/* Overlay Frame Guide */}
            {!preview && (
                <div className="absolute inset-4 border-2 border-white/30 rounded-lg pointer-events-none" />
            )}
        </div>
    );
}
