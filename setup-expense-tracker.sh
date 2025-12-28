#!/bin/bash

# =============================================================================
# Expense Tracker Setup Script
# Financial tool for tracking small expenses
# =============================================================================

echo "Setting up Expense Tracker..."
echo "============================="
echo ""

# Files created
echo "Files created:"
echo "  - src/components/finance/ExpenseTracker.tsx"
echo "  - setup-expense-tracker.sh"
echo ""

# =============================================================================
# Database Schema
# =============================================================================
echo "DATABASE SCHEMA"
echo "---------------"
echo ""
cat << 'EOF'

-- Run in Supabase SQL Editor

CREATE TABLE expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own expenses"
  ON expenses FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses"
  ON expenses FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses"
  ON expenses FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses"
  ON expenses FOR DELETE USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX idx_expenses_user_date ON expenses(user_id, date);
CREATE INDEX idx_expenses_category ON expenses(category);

-- View for monthly summary
CREATE VIEW monthly_expense_summary AS
SELECT 
  user_id,
  DATE_TRUNC('month', date) as month,
  category,
  SUM(amount) as total,
  COUNT(*) as count
FROM expenses
GROUP BY user_id, DATE_TRUNC('month', date), category;

EOF

echo ""

# =============================================================================
# Categories
# =============================================================================
echo "EXPENSE CATEGORIES"
echo "------------------"
echo ""
echo "  1. Operasional  - Bensin, Parkir, Pulsa"
echo "  2. Bahan        - Lakban, Kardus, Bubble wrap"
echo "  3. Marketing    - Iklan, Promo, Endorse"
echo "  4. Lainnya      - Pengeluaran lain"
echo ""

# =============================================================================
# Components
# =============================================================================
echo "COMPONENTS"
echo "----------"
echo ""
echo "  1. ExpenseForm - Modal input cepat"
echo "     - Input nominal besar"
echo "     - Pilih kategori dengan grid"
echo "     - Keterangan opsional"
echo ""
echo "  2. ExpenseFAB - Tombol mengambang"
echo "     - Posisi: bottom-right (atas FAB utama)"
echo "     - Warna merah (expense)"
echo ""
echo "  3. NetProfitReport - Laporan laba bersih"
echo "     - Total penjualan (dari Phase 456)"
echo "     - Total pengeluaran"
echo "     - Laba bersih sejati"
echo "     - Margin percentage"
echo "     - Export PDF button"
echo ""

# =============================================================================
# Usage
# =============================================================================
echo "USAGE EXAMPLE"
echo "-------------"
echo ""
cat << 'EOF'

// In dashboard/expenses/page.tsx

'use client';

import { useState } from 'react';
import { ExpenseForm, ExpenseFAB, NetProfitReport } from '@/components/finance/ExpenseTracker';
import { addExpense } from '@/app/actions/expenseActions';

export default function ExpensesPage() {
  const [showForm, setShowForm] = useState(false);

  // Get data from server
  const totalSales = 15000000;   // From Phase 456
  const totalExpenses = 2500000; // Sum of expenses

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Laporan Keuangan</h1>
      
      <NetProfitReport
        totalSales={totalSales}
        totalExpenses={totalExpenses}
        period="Desember 2024"
        onExportPDF={() => {/* PDF logic */}}
      />
      
      <ExpenseFAB onClick={() => setShowForm(true)} />
      
      {showForm && (
        <ExpenseForm
          onSubmit={addExpense}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}

EOF

echo ""

# =============================================================================
# Server Action
# =============================================================================
echo "SERVER ACTION"
echo "-------------"
echo ""
cat << 'EOF'

// src/app/actions/expenseActions.ts

'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addExpense(data: {
  amount: number;
  category: string;
  description: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Unauthorized');
  
  await supabase.from('expenses').insert({
    user_id: user.id,
    amount: data.amount,
    category: data.category,
    description: data.description,
    date: new Date().toISOString().split('T')[0],
  });
  
  revalidatePath('/dashboard/expenses');
}

export async function getMonthlyReport(month: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const startDate = `${month}-01`;
  const endDate = `${month}-31`;
  
  const { data: expenses } = await supabase
    .from('expenses')
    .select('amount, category')
    .eq('user_id', user?.id)
    .gte('date', startDate)
    .lte('date', endDate);
    
  return expenses;
}

EOF

echo ""

echo "============================="
echo "Expense Tracker Setup Complete!"
echo ""
echo "Features:"
echo "  - Quick expense input via FAB"
echo "  - 4 expense categories"
echo "  - Net profit calculation"
echo "  - Monthly PDF export"
echo ""
echo "Next Steps:"
echo "  1. Run SQL schema in Supabase"
echo "  2. Create expenseActions.ts"
echo "  3. Integrate with Phase 456 profit data"
echo ""

exit 0
