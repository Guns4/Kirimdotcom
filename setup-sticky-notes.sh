#!/bin/bash

# =============================================================================
# Sticky Notes Widget Setup Script
# Admin workspace quick notes with auto-save
# =============================================================================

echo "Setting up Sticky Notes Widget..."
echo "================================="
echo ""

# Files created
echo "Files created:"
echo "  - src/components/dashboard/StickyNotes.tsx"
echo "  - setup-sticky-notes.sh"
echo ""

# =============================================================================
# Features
# =============================================================================
echo "FEATURES"
echo "--------"
echo ""
echo "  1. Notes Mode"
echo "     - Free-form text area"
echo "     - Placeholder with examples"
echo "     - Yellow 'sticky note' design"
echo ""
echo "  2. To-Do Mode"
echo "     - Add tasks with Enter key"
echo "     - Click to toggle complete"
echo "     - Strikethrough completed items"
echo "     - Delete button"
echo "     - Progress counter (X/Y selesai)"
echo ""
echo "  3. Auto-Save"
echo "     - Debounced (1 second delay)"
echo "     - Saves to localStorage"
echo "     - Optional server callback"
echo "     - Shows 'Menyimpan...' status"
echo "     - Shows last saved time"
echo ""

# =============================================================================
# Usage
# =============================================================================
echo "USAGE"
echo "-----"
echo ""
cat << 'EOF'

// In dashboard page

import { StickyNotesWidget } from '@/components/dashboard/StickyNotes';

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Other widgets */}
      
      <div className="col-span-1">
        <StickyNotesWidget />
      </div>
    </div>
  );
}

// With server save callback
<StickyNotesWidget 
  storageKey="admin-notes"
  onSave={async (notes, todos) => {
    await saveNotesToServer({ notes, todos });
  }}
/>

EOF

echo ""

# =============================================================================
# Design
# =============================================================================
echo "DESIGN"
echo "------"
echo ""
echo "  Colors: Yellow theme (sticky note style)"
echo "    - Background: yellow-100"
echo "    - Header: yellow-200"
echo "    - Border: yellow-300"
echo "    - Text: yellow-800/900"
echo ""
echo "  Layout:"
echo "    - Header with mode toggle"
echo "    - Content area (notes/todos)"
echo "    - Footer with save status"
echo ""

# =============================================================================
# Database (Optional)
# =============================================================================
echo "DATABASE (Optional)"
echo "-------------------"
echo ""
cat << 'EOF'

-- For server-side persistence

CREATE TABLE user_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  notes TEXT DEFAULT '',
  todos JSONB DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- RLS
ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own notes"
  ON user_notes FOR ALL USING (auth.uid() = user_id);

EOF

echo ""

echo "================================="
echo "Sticky Notes Widget Setup Complete!"
echo ""
echo "Features:"
echo "  - Quick notes for admin"
echo "  - To-do checklist mode"
echo "  - Auto-save with debounce"
echo "  - LocalStorage persistence"
echo ""

exit 0
