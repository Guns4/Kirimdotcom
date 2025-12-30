'use client';

import { Scanner } from '@yudiel/react-qr-scanner';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function AdminQRScanner() {
  const router = useRouter();

  const handleScan = (text: string) => {
    if (text) {
      // Assuming QR contains just the User ID
      // Validation: Check if it's a UUID
      // Note: The library passes an array of objects for multi-scan, but text works for single usually.
      // Adjust based on version: if (Array.isArray(text)) text = text[0].rawValue;

      // Simple check
      if (text.length > 10) {
        toast.success('User Found!');
        router.push(`/admin/mobile/users/${text}`);
      } else {
        // toast.error('Invalid QR Code'); // Too noisy if triggered on partial detection
      }
    }
  };

  // Wrapper for library specific type requirements
  const onScanWrapper = (result: any) => {
    if (result && result.length > 0) {
      handleScan(result[0].rawValue);
    }
  };

  const handleError = (error: unknown) => {
    console.error(error);
    toast.error('Camera access failed');
  };

  return (
    <div className="w-full max-w-sm mx-auto aspect-square rounded-xl overflow-hidden border-2 border-white shadow-xl relative">
      <Scanner
        onScan={onScanWrapper}
        onError={handleError}
        components={{
          audio: false,
          torch: true,
          count: false,
          onOff: false,
          tracker: false,
        }}
        styles={{
          container: { width: '100%', height: '100%' },
        }}
      />
      <div className="absolute inset-0 border-2 border-transparent pointer-events-none">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-green-400 rounded-lg opacity-50"></div>
      </div>
    </div>
  );
}
