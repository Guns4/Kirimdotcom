# Supabase Edge Function: update-tracking

This document contains the code for the Supabase Edge Function that automatically checks tracking updates and sends email notifications.

## Setup Instructions

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Initialize functions directory:
   ```bash
   supabase init
   ```

4. Create the function:
   ```bash
   supabase functions new update-tracking
   ```

5. Copy the code below to `supabase/functions/update-tracking/index.ts`

6. Set environment variables in Supabase Dashboard:
   - `BINDERBYTE_API_KEY`
   - `RESEND_API_KEY`

7. Deploy:
   ```bash
   supabase functions deploy update-tracking
   ```

8. Set up Cron Job (in Supabase Dashboard > Edge Functions > update-tracking > Schedule):
   - Schedule: `0 */2 * * *` (every 2 hours)

---

## Edge Function Code

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Configuration
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const BINDERBYTE_API_KEY = Deno.env.get('BINDERBYTE_API_KEY')!
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TrackingSubscription {
  id: string
  email: string | null
  whatsapp: string | null
  resi: string
  courier_code: string
  last_status: string | null
  notification_count: number
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Get all active subscriptions
    const { data: subscriptions, error: fetchError } = await supabase
      .from('tracking_subscriptions')
      .select('*')
      .eq('is_active', true)
      .eq('is_delivered', false)
      .limit(50) // Process in batches

    if (fetchError) {
      throw new Error(`Failed to fetch subscriptions: ${fetchError.message}`)
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No active subscriptions to process' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Processing ${subscriptions.length} subscriptions...`)

    const results = []

    for (const sub of subscriptions as TrackingSubscription[]) {
      try {
        // Fetch current tracking status from API
        const trackingData = await fetchTrackingStatus(sub.resi, sub.courier_code)
        
        if (!trackingData || !trackingData.status) {
          continue
        }

        const newStatus = trackingData.status.status
        const isDelivered = newStatus.toLowerCase().includes('delivered') || 
                           newStatus.toLowerCase().includes('terkirim') ||
                           newStatus.toLowerCase().includes('diterima')

        // Check if status changed
        if (sub.last_status !== newStatus) {
          console.log(`Status changed for ${sub.resi}: ${sub.last_status} -> ${newStatus}`)

          // Send notification
          if (sub.email) {
            await sendEmailNotification(sub, newStatus, trackingData.status.desc, isDelivered)
          }

          // Update subscription
          await supabase
            .from('tracking_subscriptions')
            .update({
              last_status: newStatus,
              last_status_date: new Date().toISOString(),
              is_delivered: isDelivered,
              is_active: !isDelivered, // Deactivate if delivered
              notification_count: sub.notification_count + 1,
            })
            .eq('id', sub.id)

          // Log notification
          await supabase
            .from('notification_logs')
            .insert({
              subscription_id: sub.id,
              type: 'email',
              status: 'sent',
              old_status: sub.last_status,
              new_status: newStatus,
            })

          results.push({
            resi: sub.resi,
            oldStatus: sub.last_status,
            newStatus: newStatus,
            notified: true,
          })
        }
      } catch (subError) {
        console.error(`Error processing ${sub.resi}:`, subError)
        
        // Log failed notification
        await supabase
          .from('notification_logs')
          .insert({
            subscription_id: sub.id,
            type: 'email',
            status: 'failed',
            error_message: subError.message,
          })
      }
    }

    return new Response(
      JSON.stringify({
        message: `Processed ${subscriptions.length} subscriptions`,
        updates: results.length,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Fetch tracking status from BinderByte API
async function fetchTrackingStatus(resi: string, courierCode: string) {
  const url = `https://api.binderbyte.com/v1/track?api_key=${BINDERBYTE_API_KEY}&courier=${courierCode}&awb=${resi}`
  
  const response = await fetch(url)
  const data = await response.json()
  
  if (data.status !== 200) {
    return null
  }
  
  return data.data
}

// Send email notification via Resend
async function sendEmailNotification(
  sub: TrackingSubscription, 
  newStatus: string, 
  statusDescription: string,
  isDelivered: boolean
) {
  const emailHtml = isDelivered 
    ? generateDeliveredEmail(sub.resi, sub.courier_code)
    : generateUpdateEmail(sub.resi, sub.courier_code, sub.last_status || 'Unknown', newStatus, statusDescription)

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'CekKirim <notifikasi@cekkirim.com>',
      to: sub.email,
      subject: isDelivered 
        ? `🎉 Paket ${sub.resi} Telah Diterima!` 
        : `📦 Update Paket ${sub.resi}: ${newStatus}`,
      html: emailHtml,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Email failed: ${error.message}`)
  }

  return response.json()
}

// Generate update email HTML
function generateUpdateEmail(resi: string, courier: string, oldStatus: string, newStatus: string, desc: string) {
  return `
    <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; background: #1e293b; padding: 20px; border-radius: 12px;">
      <h1 style="color: #6366f1;">📦 Update Paket</h1>
      <p style="color: #94a3b8;">Resi: <strong style="color: white;">${resi}</strong></p>
      <div style="background: #0f172a; padding: 15px; border-radius: 8px; margin: 15px 0;">
        <p style="color: #f59e0b; margin: 0;">Sebelumnya: ${oldStatus}</p>
        <p style="color: #22c55e; margin: 10px 0 0 0; font-size: 18px;">Sekarang: ${newStatus}</p>
      </div>
      <p style="color: #94a3b8;">${desc}</p>
      <a href="https://www.cekkirim.com" style="display: inline-block; padding: 10px 20px; background: #6366f1; color: white; text-decoration: none; border-radius: 6px; margin-top: 15px;">Cek Detail</a>
    </div>
  `
}

// Generate delivered email HTML  
function generateDeliveredEmail(resi: string, courier: string) {
  return `
    <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; background: #1e293b; padding: 20px; border-radius: 12px; text-align: center;">
      <div style="font-size: 60px;">🎉</div>
      <h1 style="color: #22c55e;">Paket Terkirim!</h1>
      <p style="color: #94a3b8;">Resi: <strong style="color: white;">${resi}</strong></p>
      <p style="color: #22c55e; font-size: 20px;">✅ Telah Diterima</p>
      <p style="color: #64748b; font-size: 12px;">Kurir: ${courier.toUpperCase()}</p>
      <p style="color: #475569; margin-top: 20px; font-size: 12px;">Terima kasih telah menggunakan CekKirim</p>
    </div>
  `
}
```

---

## Testing

You can manually trigger the function:

```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/update-tracking \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

---

## Environment Variables Required

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Auto-provided by Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-provided by Supabase |npm
| `BINDERBYTE_API_KEY` | Your BinderByte API key |
| `RESEND_API_KEY` | Your Resend.com API key |
