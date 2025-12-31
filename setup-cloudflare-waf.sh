#!/bin/bash

# setup-cloudflare-waf.sh
# -----------------------
# Generates Cloudflare WAF Expressions & Setup Script for "Under Attack" mode.

echo "🛡️  Cloudflare WAF Configuration Generator"

# 1. Generate WAF Rules Expressions
cat > cloudflare-waf-rules.txt << 'EOF'
--- CLOUDFLARE WAF EXPRESSIONS ---

1. BLOCK High Risk Countries (Non-ID)
   (Adjust 'ID' to your target market)
   Expression: (ip.geoip.country ne "ID" and not ip.geoip.in_eu)
   Action: Managed Challenge

2. BLOCK Suspicious Bots & Tools
   Expression: (http.user_agent contains "curl") or (http.user_agent contains "python") or (http.user_agent contains "nmap")
   Action: Block

3. PROTECT Admin API (Whitelist IP)
   Expression: (http.request.uri.path starts_with "/api/admin") and (ip.src ne 202.123.45.67) 
   *(Replace 202.123.45.67 with your Office IP)*
   Action: Block
EOF

echo "✅ WAF Rules generated in 'cloudflare-waf-rules.txt'"

# 2. Create "Under Attack" Toggle Script
mkdir -p src/scripts/ops

cat > src/scripts/ops/toggle-panic-mode.sh << 'EOF'
#!/bin/bash

# Toggle Cloudflare "I'm Under Attack" Mode
# Usage: ./toggle-panic-mode.sh [on|off]

ZONE_ID="$CLOUDFLARE_ZONE_ID"
API_TOKEN="$CLOUDFLARE_API_TOKEN"

if [ -z "$ZONE_ID" ] || [ -z "$API_TOKEN" ]; then
  echo "Error: CLOUDFLARE_ZONE_ID and CLOUDFLARE_API_TOKEN env vars required."
  exit 1
fi

MODE="medium" # Default security level
if [ "$1" == "on" ]; then
  MODE="under_attack"
  echo "🚨 ACTIVATING PANIC MODE..."
else
  echo "😌 Deactivating Panic Mode..."
fi

curl -X PATCH "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/security_level" \
     -H "Authorization: Bearer $API_TOKEN" \
     -H "Content-Type: application/json" \
     --data "{\"value\":\"$MODE\"}"

echo ""
EOF

chmod +x src/scripts/ops/toggle-panic-mode.sh

echo "✅ Panic Mode Script: src/scripts/ops/toggle-panic-mode.sh"
echo "👉 Set CLOUDFLARE_ZONE_ID and CLOUDFLARE_API_TOKEN in .env to use."
