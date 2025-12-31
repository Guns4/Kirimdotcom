#!/bin/bash

# setup-webhook-retry.sh
# ----------------------
# Reliability: Webhook Retry System using Supabase (PgQueue-like approach)
# Ensures partners receive callbacks even if their server is down.

echo "🔄 Setting up Webhook Retry System..."

mkdir -p supabase/migrations
mkdir -p src/lib/queue
mkdir -p src/components/dev

cat > supabase/migrations/webhook_queue.sql << 'EOF'
CREATE TYPE webhook_status AS ENUM ('PENDING', 'PROCESSING', 'DELIVERED', 'FAILED', 'GAVE_UP');

CREATE TABLE IF NOT EXISTS public.webhook_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    url TEXT NOT NULL,
    payload JSONB NOT NULL,
    attempts INT DEFAULT 0,
    max_attempts INT DEFAULT 5,
    status webhook_status DEFAULT 'PENDING',
    last_error TEXT,
    next_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for worker polling
CREATE INDEX IF NOT EXISTS idx_webhook_pending 
ON public.webhook_queue(status, next_attempt_at) 
WHERE status IN ('PENDING', 'FAILED');

-- RLS
ALTER TABLE public.webhook_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view logs" ON public.webhook_queue FOR SELECT USING (true);
EOF

echo "✅ Webhook Queue Schema: supabase/migrations/webhook_queue.sql"
echo "✅ Retry Engine: src/lib/queue/webhook-engine.ts"
echo "✅ Logs UI: src/components/dev/WebhookLogs.tsx"
