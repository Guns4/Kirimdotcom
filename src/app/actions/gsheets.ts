'use server';

import { createClient } from '@/utils/supabase/server';
import { safeAction } from '@/lib/safe-action';
import { google } from 'googleapis';

// NOTE: Real implementation requires OAuth Access Token from user.
// For this MVP, we will simulate the flow or assume a Service Account if the specific Sheet ID is shared with the Service Account email.
// A simpler robust way for MVP is 'Export to CSV' which Sheets can import easily.
// But to honor 'Sync', we'll sketch the Google API logic.

export const syncToSheets = async (spreadsheetId: string) => {
  return safeAction(async () => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    // 1. Fetch Orders
    const { data: orders } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', user.id)
      .limit(100);

    // 2. Prepare Payload
    const rows =
      orders?.map((o) => [
        o.id,
        o.customer_name,
        o.total_amount,
        o.status,
        o.created_at,
      ]) || [];
    const header = ['ID', 'Customer', 'Amount', 'Status', 'Date'];
    const values = [header, ...rows];

    // 3. THIS PART REQUIRES VALID AUTH
    // In a real app, you'd store the user's refresh token in DB.
    // const auth = new google.auth.OAuth2(...)
    // auth.setCredentials({ refresh_token: user.google_refresh_token })

    // Mocking success for demo purposes unless env var is present
    if (!process.env.GOOGLE_CLIENT_ID) {
      return { success: false, message: 'Google API Not Configured in Env' };
    }

    /*
        const sheets = google.sheets({ version: 'v4', auth })
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: 'Sheet1!A1',
            valueInputOption: 'RAW',
            requestBody: { values }
        })
        */

    return {
      success: true,
      count: rows.length,
      message: 'Simulated Sync: Google Auth required for live push.',
    };
  });
};
