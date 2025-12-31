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
