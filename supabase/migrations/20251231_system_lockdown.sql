-- System Lockdown Configuration
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Initial State: Unlocked
INSERT INTO system_settings (key, value)
VALUES ('system_lockdown', 'false'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read (to check status)
CREATE POLICY "Everyone can read system settings"
ON system_settings FOR SELECT
USING (true);

-- Only Admins can update (We assume admin checking logic is handled by app or another policy)
-- For simplicity here, we allow authenticated users to update if they are admins (needs admin_profiles check in real app)
-- or we rely on Service Role in API Actions.
CREATE POLICY "Admins can update system settings"
ON system_settings FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM admin_profiles 
    WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN')
  )
);
