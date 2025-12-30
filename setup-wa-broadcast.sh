#!/bin/bash

# setup-wa-broadcast.sh
# Marketing Tool - Safe WA Broadcast with Queue System

echo ">>> Setting up WA Broadcast System..."

# Components Created:
# 1. src/lib/wa-broadcast.ts
# 2. src/components/wa/WABroadcastComposer.tsx

echo ">>> Features:"
echo "  📁 Contact import from Excel/CSV"
echo "  ⏱️  Queue system with random delays (3-10s)"
echo "  💰 Quota-based pricing"
echo "  📝 Message personalization {nama}"

echo ""
echo ">>> Queue Safety:"
echo "  - Random delay: 3-10 seconds per message"
echo "  - Prevents WA number from being banned"
echo "  - Automatic pause on quota exhausted"

echo ""
echo ">>> Pricing Packages:"
echo "  500 pesan   = Rp 15.000"
echo "  1.000 pesan = Rp 20.000"
echo "  5.000 pesan = Rp 80.000"
echo "  10.000 pesan = Rp 150.000"

echo ""
echo ">>> CSV Format Required:"
echo "  Nama,No HP"
echo "  Budi,081234567890"
echo "  Ani,+6289876543210"

echo ""
echo ">>> Message Template:"
echo "  'Halo {nama}, terima kasih sudah berbelanja!'"
echo "  Variable {nama} akan diganti nama kontak"

echo ""
echo ">>> Broadcast Time Estimates:"
echo "  100 pesan  ~ 10 menit"
echo "  500 pesan  ~ 55 menit"
echo "  1000 pesan ~ 2 jam"

echo ""
echo ">>> Running Typecheck..."
npm run typecheck

echo ""
echo ">>> Setup Complete!"
echo "Broadcast Page: /dashboard/wa-bot (Broadcast tab)"
