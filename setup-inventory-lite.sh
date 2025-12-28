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
echo "  - setup-inventory-lite.sh"
echo ""

# =============================================================================
# Database Schema
# =============================================================================
echo "DATABASE SCHEMA"
echo "---------------"
echo ""
cat << 'EOF'

-- Run this in Supabase SQL Editor

CREATE TABLE inventory_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) NOT NULL,
  stock INTEGER DEFAULT 0,
  cost_price INTEGER DEFAULT 0,
  sell_price INTEGER,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, sku)
);

-- RLS Policies
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own inventory"
  ON inventory_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own inventory"
  ON inventory_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own inventory"
  ON inventory_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own inventory"
  ON inventory_items FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION update_inventory_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER inventory_timestamp
  BEFORE UPDATE ON inventory_items
  FOR EACH ROW EXECUTE FUNCTION update_inventory_timestamp();

-- Index for faster queries
CREATE INDEX idx_inventory_user ON inventory_items(user_id);
CREATE INDEX idx_inventory_low_stock ON inventory_items(stock) WHERE stock < 5;

EOF

echo ""

# =============================================================================
# Server Actions
# =============================================================================
echo "SERVER ACTIONS"
echo "--------------"
echo ""
cat << 'EOF'

// src/app/actions/inventoryActions.ts

'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateStock(itemId: string, delta: number) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  
  // Get current stock
  const { data: item } = await supabase
    .from('inventory_items')
    .select('stock')
    .eq('id', itemId)
    .eq('user_id', user.id)
    .single();
    
  if (!item) throw new Error('Item not found');
  
  const newStock = Math.max(0, item.stock + delta);
  
  await supabase
    .from('inventory_items')
    .update({ stock: newStock })
    .eq('id', itemId);
    
  revalidatePath('/dashboard/inventory');
}

export async function addInventoryItem(formData: FormData) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  
  await supabase.from('inventory_items').insert({
    user_id: user.id,
    name: formData.get('name'),
    sku: formData.get('sku'),
    stock: Number(formData.get('stock')) || 0,
    cost_price: Number(formData.get('cost_price')) || 0,
    sell_price: Number(formData.get('sell_price')) || null,
  });
  
  revalidatePath('/dashboard/inventory');
}

EOF

echo ""

# =============================================================================
# Usage Example
# =============================================================================
echo "USAGE EXAMPLE"
echo "-------------"
echo ""
cat << 'EOF'

// In dashboard/inventory/page.tsx

import { InventoryGrid } from '@/components/inventory/InventoryGrid';
import { updateStock } from '@/app/actions/inventoryActions';
import { createClient } from '@/utils/supabase/server';

export default async function InventoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: items } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('user_id', user?.id)
    .order('name');
    
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Manajemen Stok</h1>
      <InventoryGrid 
        items={items || []}
        onUpdateStock={updateStock}
      />
    </div>
  );
}

EOF

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
echo "  2. Create inventoryActions.ts"
echo "  3. Add to /dashboard/inventory page"
echo ""

exit 0
