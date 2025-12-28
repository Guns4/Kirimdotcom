#!/bin/bash

# =============================================================================
# Web Push Notifications Setup Script
# Retention engineering with VAPID keys
# =============================================================================

echo "Setting up Web Push Notifications..."
echo "===================================="
echo ""

# Files created
echo "Files created:"
echo "  - src/components/notifications/PushNotificationBell.tsx"
echo "  - setup-web-push.sh"
echo ""

# =============================================================================
# VAPID Keys Generation
# =============================================================================
echo "VAPID KEYS"
echo "----------"
echo ""
echo "Generate VAPID keys using web-push:"
echo ""
cat << 'EOF'

# Install web-push globally
npm install -g web-push

# Generate VAPID keys
npx web-push generate-vapid-keys

# Output example:
# =======================================
# Public Key:
# BNxQbfXY2k...long-base64-string
#
# Private Key:
# YourPrivate...short-base64-string
# =======================================

# Add to .env.local:
NEXT_PUBLIC_VAPID_PUBLIC_KEY="BNxQbfXY2k..."
VAPID_PRIVATE_KEY="YourPrivate..."
VAPID_EMAIL="mailto:admin@cekkirim.com"

EOF

echo ""

# =============================================================================
# Service Worker
# =============================================================================
echo "SERVICE WORKER"
echo "--------------"
echo ""
echo "Add push handler to public/sw.js:"
echo ""
cat << 'EOF'

// In public/sw.js

// Handle push events
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {
    title: 'Update Paket',
    body: 'Ada update status pengiriman Anda',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
  };

  const options = {
    body: data.body,
    icon: data.icon || '/icon-192.png',
    badge: data.badge || '/badge-72.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
      resi: data.resi,
    },
    actions: [
      { action: 'view', title: 'Lihat Detail' },
      { action: 'dismiss', title: 'Tutup' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view' || !event.action) {
    const url = event.notification.data?.url || '/';
    event.waitUntil(clients.openWindow(url));
  }
});

EOF

echo ""

# =============================================================================
# Server API
# =============================================================================
echo "SERVER API"
echo "----------"
echo ""
cat << 'EOF'

// src/app/api/push/subscribe/route.ts

import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@/utils/supabase/server';

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const subscription = await request.json();
  
  // Save subscription to database
  await supabase.from('push_subscriptions').upsert({
    user_id: user?.id,
    endpoint: subscription.endpoint,
    keys: subscription.keys,
    created_at: new Date().toISOString(),
  }, { onConflict: 'endpoint' });
  
  return NextResponse.json({ success: true });
}

// src/app/api/push/send/route.ts (webhook)

export async function POST(request: Request) {
  const { resi, status, message } = await request.json();
  
  const supabase = await createClient();
  
  // Get subscribers watching this resi
  const { data: watchers } = await supabase
    .from('resi_watchers')
    .select('user_id')
    .eq('resi', resi);
    
  // Get push subscriptions
  const userIds = watchers?.map(w => w.user_id) || [];
  const { data: subscriptions } = await supabase
    .from('push_subscriptions')
    .select('*')
    .in('user_id', userIds);
    
  // Send push to all subscribers
  const notifications = subscriptions?.map(sub => 
    webpush.sendNotification(
      { endpoint: sub.endpoint, keys: sub.keys },
      JSON.stringify({
        title: `Update Resi ${resi}`,
        body: message || `Status: ${status}`,
        url: `/cek-resi/${resi}`,
        resi,
      })
    )
  ) || [];
  
  await Promise.allSettled(notifications);
  
  return NextResponse.json({ sent: notifications.length });
}

EOF

echo ""

# =============================================================================
# Database Schema
# =============================================================================
echo "DATABASE SCHEMA"
echo "---------------"
echo ""
cat << 'EOF'

-- Push subscriptions
CREATE TABLE push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT UNIQUE NOT NULL,
  keys JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resi watchers (who wants notifications)
CREATE TABLE resi_watchers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  resi VARCHAR(100) NOT NULL,
  courier VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, resi)
);

-- RLS policies
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE resi_watchers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own subscriptions"
  ON push_subscriptions FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own watchers"
  ON resi_watchers FOR ALL USING (auth.uid() = user_id);

EOF

echo ""

# =============================================================================
# Usage
# =============================================================================
echo "USAGE"
echo "-----"
echo ""
cat << 'EOF'

// In Navbar or header

import { PushNotificationBell } from '@/components/notifications/PushNotificationBell';

<PushNotificationBell
  vapidPublicKey={process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!}
  onSubscribe={async (subscription) => {
    await fetch('/api/push/subscribe', {
      method: 'POST',
      body: JSON.stringify(subscription),
    });
  }}
/>

EOF

echo ""

echo "===================================="
echo "Web Push Notifications Setup Complete!"
echo ""
echo "Features:"
echo "  - Non-intrusive bell button UI"
echo "  - VAPID key authentication"
echo "  - Service worker push handler"
echo "  - Resi tracking webhook integration"
echo ""
echo "Next Steps:"
echo "  1. Generate VAPID keys"
echo "  2. Add env variables"
echo "  3. Update public/sw.js"
echo "  4. Create API routes"
echo "  5. Run SQL schema"
echo ""

exit 0
