#!/bin/bash

# setup-ssl-pinning.sh
# --------------------
# Configures SSL Pinning for Capacitor to prevent MITM attacks.
# Uses @capacitor-community/http

echo "🔒 Setting up SSL Pinning..."

# 1. Install Plugin
echo "📦 Installing @capacitor-community/http..."
npm install @capacitor-community/http
npx cap sync

# 2. Instructions to get Public Key
echo "ℹ️  To get your SHA-256 Public Key Hash, run this command:"
echo "openssl s_client -connect cekkirim.com:443 -servername cekkirim.com < /dev/null | openssl x509 -pubkey -noout | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | openssl enc -base64"

# 3. Update capacitor.config.ts (Instructional)
# Ideally, we would parse and update the TS file, but here we provide the config block to insert.

cat > capacitor-ssl-config-snippet.txt << 'EOF'
import { CapacitorConfig } from '@capacitor/cli';

// Add this to your capacitor.config.ts 'plugins' object:
const plugins = {
  Http: {
    enabled: true,
    certificates: [
      {
        url: 'https://cekkirim.com',
        signingCert: 'YOUR_SHA256_HASH_HERE', // Replace with output from openssl
        errorCert: 'YOUR_BACKUP_HASH_HERE'     // Optional backup
      }
    ]
  }
};
EOF

echo "✅ SSL Pinning Setup Script Done."
echo "👉 Copy code from capacitor-ssl-config-snippet.txt to your capacitor.config.ts"
