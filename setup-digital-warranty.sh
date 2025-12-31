#!/bin/bash

# setup-digital-warranty.sh
# Value Added Service (Phase 1951-1960)
# features: Camera UI, Storage Upload, Expiry Tracking

echo ">>> Setting up Digital Warranty Infrastructure..."

# 1. Install Dependencies
npm install @capacitor/camera
# Assume @supabase/supabase-js is already installed

# 2. Database Migration (SQL)
mkdir -p supabase/migrations
cat > supabase/migrations/20251231_warranty_table.sql <<EOF
-- 1. Create Warranties Table
CREATE TABLE IF NOT EXISTS public.warranties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    receipt_number VARCHAR(255),
    item_name VARCHAR(255),
    purchase_date DATE,
    expiry_date DATE,
    photo_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.warranties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own warranties" ON public.warranties
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own warranties" ON public.warranties
    FOR SELECT USING (auth.uid() = user_id);

-- 3. Storage Bucket for Warranty Photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('warranty-docs', 'warranty-docs', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload warranty photos" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'warranty-docs' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view own warranty photos" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'warranty-docs' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );
EOF

# 3. Create Backend Service
mkdir -p src/lib
cat > src/lib/warranty-service.ts <<EOF
import { createClient } from '@/utils/supabase/client';

export interface WarrantyItem {
  receipt_number: string;
  item_name: string;
  expiry_date: string; // YYYY-MM-DD
  photo_base64?: string; // For upload
}

export const WarrantyService = {
  async uploadWarranty(data: WarrantyItem, userId: string) {
    const supabase = createClient();
    
    let photoUrl = '';

    // 1. Upload Photo if exists
    if (data.photo_base64) {
      const fileName = \`\${userId}/\${Date.now()}-warranty.jpg\`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('warranty-docs')
        .upload(fileName, decode(data.photo_base64), {
          contentType: 'image/jpeg'
        });

      if (uploadError) throw uploadError;
      
      // Get signed URL (since bucket is private) or public path
      // Assuming we store relative path for private access via signed url component later
      photoUrl = fileName; 
    }

    // 2. Insert Record
    const { error: dbError } = await supabase
      .from('warranties')
      .insert({
        user_id: userId,
        receipt_number: data.receipt_number,
        item_name: data.item_name,
        expiry_date: data.expiry_date,
        photo_url: photoUrl
      });

    if (dbError) throw dbError;

    return { success: true };
  }
};

// Helper for base64 decode (simple version for brevity)
function decode(base64: string) {
    const byteString = atob(base64.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab]);
}
EOF

# 4. Create Camera UI Component
mkdir -p src/components/features/warranty
cat > src/components/features/warranty/WarrantyCamera.tsx <<EOF
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
EOF

# 5. Create Test Page (Optional, for demo)
mkdir -p src/app/dashboard/warranty
cat > src/app/dashboard/warranty/page.tsx <<EOF
import { WarrantyCamera } from '@/components/features/warranty/WarrantyCamera';

export default function WarrantyPage() {
  return (
    <div className="p-4 space-y-4">
        <h1 className="text-lg font-bold">Simpan Garansi Digital</h1>
        <WarrantyCamera onCapture={() => {}} />
        <p className="text-xs text-gray-400">
            *Fitur ini akan menyimpan foto ke Cloud aman kami.
        </p>
    </div>
  );
}
EOF

echo ">>> Digital Warranty Setup Complete."
