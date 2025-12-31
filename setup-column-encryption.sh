#!/bin/bash

# setup-column-encryption.sh
# --------------------------
# Generates SQL to setup PGCrypto and encrypt sensitive columns.

echo "🔐 Generating Column Encryption Script..."

mkdir -p supabase/security

cat > supabase/security/encrypt_columns.sql << 'EOF'
-- 1. Enable Extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Setup Encryption Keys
-- WARNING: In production, store this key in Vault or Environment Variable, NOT in SQL file code directly if possible.
-- For this setup, we assume a server-side secret 'MY_SUPER_SECRET_KEY'
-- ideally injected via `current_setting('app.settings.encryption_key')`

-- 3. Utility Functions
CREATE OR REPLACE FUNCTION encrypt_data(input_text text) 
RETURNS text AS $$
BEGIN
    -- Encrypt using AES, output as base64 string
    RETURN encode(pgp_sym_encrypt(input_text, current_setting('app.settings.encryption_key')), 'base64');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrypt_data(encrypted_text text) 
RETURNS text AS $$
BEGIN
    -- Decrypt base64 string
    RETURN pgp_sym_decrypt(decode(encrypted_text, 'base64'), current_setting('app.settings.encryption_key'));
END;
$$ LANGUAGE plpgsql;

-- 4. Migration Example (NIK & API Keys)
-- This assumes columns exist. If not, create them first.

-- Example: Add encrypted columns
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS nik_ktp_encrypted text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS vendor_api_key_encrypted text;

-- Data Migration (Assuming you act immediately, otherwise do this in batch)
-- UPDATE public.users SET nik_ktp_encrypted = encrypt_data(nik_ktp) WHERE nik_ktp IS NOT NULL;
-- ALTER TABLE public.users DROP COLUMN nik_ktp; 

-- NOTE: You must set the setting 'app.settings.encryption_key' in your postgresql.conf or for the session
-- ALTER DATABASE postgres SET "app.settings.encryption_key" TO 'REPLACE_WITH_SECURE_KEY';
EOF

echo "✅ Generated: supabase/security/encrypt_columns.sql"
echo "👉 Review the file. SET 'app.settings.encryption_key' securely before running!"
