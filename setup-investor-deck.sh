#!/bin/bash

# setup-investor-deck.sh
# Valuation & Investment - Investor Metrics Dashboard

echo ">>> Setting up Investor Deck Dashboard..."

# Components Created:
# 1. src/lib/investor-metrics.ts
# 2. src/components/investor/InvestorGate.tsx
# 3. src/components/investor/InvestorDashboard.tsx
# 4. src/app/investor/live-data/page.tsx

echo ">>> Features:"
echo "  🔒 Password-protected access"
echo "  📊 Live metrics (GMV, MAU, MoM, CAC/LTV)"
echo "  📈 Beautiful Recharts visualizations"
echo "  🔄 Real-time data refresh"

echo ""
echo ">>> Key Metrics Displayed:"
echo "  💰 GMV (Gross Merchandise Value)"
echo "  👥 MAU (Monthly Active Users)"
echo "  📈 MoM Growth (Revenue, Users, Transactions)"
echo "  🎯 LTV:CAC Ratio"
echo "  ⏰ Runway & Burn Rate"

echo ""
echo ">>> Charts:"
echo "  - GMV Growth (Area Chart)"
echo "  - User Growth (Line Chart)"
echo "  - Revenue (Bar Chart)"
echo "  - Acquisition Channels (Pie Chart)"

echo ""
echo ">>> Access:"
echo "  URL: /investor/live-data"
echo "  Password: cekkirimdeck2024"
echo "  (Change in src/lib/investor-metrics.ts)"

echo ""
echo ">>> Running Typecheck..."
npm run typecheck

echo ""
echo ">>> Setup Complete!"
echo "Investor Portal: http://localhost:3000/investor/live-data"
