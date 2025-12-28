#!/bin/bash

# =============================================================================
# Inventory Lite Setup Script
# Simple stock management for sellers
# =============================================================================

echo "Setting up Inventory Lite..."
echo "============================"
echo ""

# Files created
echo "Files created:"
echo "  - src/components/inventory/InventoryGrid.tsx"
echo "  - src/app/actions/inventoryActions.ts"
echo "  - inventory_schema.sql"
echo "  - setup-inventory-lite.sh"
echo ""

# =============================================================================
# Database Schema
# =============================================================================
echo "DATABASE SCHEMA"
echo "---------------"
echo "Please run the contents of 'inventory_schema.sql' in your Supabase SQL Editor."
echo ""

# =============================================================================
# Features
# =============================================================================
echo "FEATURES"
echo "--------"
echo ""
echo "  1. Stock Card Grid"
echo "     - Product image/icon"
echo "     - Name and SKU"
echo "     - Large stock number display"
echo "     - Quick +1/-1 buttons for packing"
echo ""
echo "  2. Low Stock Alert"
echo "     - Stock < 5: Orange warning 'Stok Menipis!'"
echo "     - Stock = 0: Red alert 'HABIS!'"
echo "     - Summary badges at top"
echo ""
echo "  3. Price Tracking"
echo "     - Cost price (modal)"
echo "     - Sell price (jual)"
echo ""

echo "============================"
echo "Inventory Lite Setup Complete!"
echo ""
echo "Next Steps:"
echo "  1. Run SQL schema in Supabase"
echo "  2. Create/Update /dashboard/inventory page to use InventoryGrid"
echo ""

exit 0
