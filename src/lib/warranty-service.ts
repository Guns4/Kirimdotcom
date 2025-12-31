import { createClient } from '@/utils/supabase/client';
import { StorageService } from './storage-service';

export interface WarrantyItem {
  receipt_number: string;
  item_name: string;
  expiry_date: string; // YYYY-MM-DD
  photo_base64?: string; // For upload
}

export const WarrantyService = {
  async uploadWarranty(data: WarrantyItem, userId: string) {
    const supabase: any = createClient();

    let photoUrl = '';

    // 1. Upload Photo if exists
    if (data.photo_base64) {
      // Check Quota First
      const size = Math.ceil((data.photo_base64.length * 3) / 4) - 2; // Approx Base64 size in bytes
      const allowed = await StorageService.checkQuota(size);
      if (!allowed) {
        throw new Error('Storage Full. Please upgrade your plan.');
      }

      const fileName = `${userId}/${Date.now()}-warranty.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('warranty-docs')
        .upload(fileName, decode(data.photo_base64), {
          contentType: 'image/jpeg',
        });

      if (uploadError) throw uploadError;

      // Update Usage
      await StorageService.recordUpload(size);

      // Get signed URL (since bucket is private) or public path
      // Assuming we store relative path for private access via signed url component later
      photoUrl = fileName;
    }

    // 2. Insert Record
    const { error: dbError } = await supabase.from('warranties').insert({
      user_id: userId,
      receipt_number: data.receipt_number,
      item_name: data.item_name,
      expiry_date: data.expiry_date,
      photo_url: photoUrl,
    });

    if (dbError) throw dbError;

    return { success: true };
  },
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
