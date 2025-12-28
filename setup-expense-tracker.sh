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
echo "  - src/app/actions/expenseActions.ts"
echo "  - expense_tracker_schema.sql"
echo ""

# =============================================================================
# Usage
# =============================================================================
echo "USAGE EXAMPLE"
echo "-------------"
echo ""
echo "// In dashboard/expenses/page.tsx"
echo ""
echo "'use client';"
echo "import { useState } from 'react';"
echo "import { ExpenseForm, ExpenseFAB, NetProfitReport } from '@/components/finance/ExpenseTracker';"
echo "import { addExpense } from '@/app/actions/expenseActions';"
echo ""
echo "export default function ExpensesPage() {"
echo "  const [showForm, setShowForm] = useState(false);"
echo "  // ... fetch data ..."
echo "  return ("
echo "    <div className='p-6'>"
echo "      <NetProfitReport ... />"
echo "      <ExpenseFAB onClick={() => setShowForm(true)} />"
echo "      {showForm && <ExpenseForm onSubmit={addExpense} onClose={() => setShowForm(false)} />}"
echo "    </div>"
echo "  );"
echo "}"
echo ""

echo "============================="
echo "Expense Tracker Setup Complete!"
echo "Please run 'expense_tracker_schema.sql' in Supabase SQL Editor."
