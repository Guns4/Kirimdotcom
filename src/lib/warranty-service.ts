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
      const fileName = `${userId}/${Date.now()}-warranty.jpg`;
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
  const split = base64.split(',');
  const byteString = atob(split.length > 1 ? split[1] : split[0]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab]);
}
