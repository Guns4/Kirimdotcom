import { createClient } from '@/utils/supabase/server';

export async function isSystemLocked() {
  const supabase = createClient();
  const { data } = await supabase
    .from('system_settings')
    .select('value')
    .eq('key', 'finance_maintenance_mode')
    .single();

  return data?.value === true;
}

export async function sendPanicAlert(message: string) {
  console.error(`[PANIC] ${message}`);
  // Connect to WhatsApp API here
  // await whatsapp.sendText(ADMIN_PHONE, `🚨 EMERGENCY: ${message}`);
}
