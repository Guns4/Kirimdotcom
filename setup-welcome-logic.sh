#!/bin/bash

# =============================================================================
# Personalized Welcome Setup Script
# Dashboard personalization for better retention
# =============================================================================

echo "Setting up Personalized Welcome..."
echo "=================================="
echo ""

# Files created
echo "Files created:"
echo "  - src/components/dashboard/PersonalizedWelcome.tsx"
echo "  - setup-welcome-logic.sh"
echo ""

# =============================================================================
# Features
# =============================================================================
echo "FEATURES"
echo "--------"
echo ""
echo "  1. Time-Based Greeting"
echo "     - Selamat Pagi (05:00-11:59)"
echo "     - Selamat Siang (12:00-14:59)"
echo "     - Selamat Sore (15:00-17:59)"
echo "     - Selamat Malam (18:00-04:59)"
echo ""
echo "  2. Shop Name Personalization"
echo "     - 'Selamat Pagi, [Nama Toko]!'"
echo "     - Pending packages counter"
echo ""
echo "  3. Quick Resume"
echo "     - Show last tracked resi"
echo "     - One-click to continue tracking"
echo ""
echo "  4. Daily Tips"
echo "     - 12 rotating business tips"
echo "     - Changes daily based on day of year"
echo ""

# =============================================================================
# Components
# =============================================================================
echo "COMPONENTS"
echo "----------"
echo ""
cat << 'EOF'

// Available exports:
import {
  getGreeting,           // Returns {text, emoji}
  getDailyTip,          // Returns {tip, category}
  WelcomeHeader,        // Greeting + pending count
  QuickResume,          // Last tracking button
  DailyTipCard,         // Tips widget
  PersonalizedDashboard // Combined all
} from '@/components/dashboard/PersonalizedWelcome';

EOF

echo ""

# =============================================================================
# Usage
# =============================================================================
echo "USAGE"
echo "-----"
echo ""
cat << 'EOF'

// In dashboard/page.tsx

import { PersonalizedDashboard } from '@/components/dashboard/PersonalizedWelcome';
import { createClient } from '@/utils/supabase/server';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Get user's shop name
  const { data: profile } = await supabase
    .from('profiles')
    .select('shop_name')
    .eq('id', user?.id)
    .single();
    
  // Get pending packages count
  const { count } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user?.id)
    .eq('status', 'pending');
    
  // Get last tracking from localStorage (client-side)
  // Or from database
  const { data: lastTracking } = await supabase
    .from('tracking_history')
    .select('resi, courier, status')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return (
    <div className="p-6">
      <PersonalizedDashboard
        shopName={profile?.shop_name}
        pendingPackages={count || 0}
        lastTracking={lastTracking}
      />
      
      {/* Other dashboard content */}
    </div>
  );
}

EOF

echo ""

# =============================================================================
# Daily Tips Content
# =============================================================================
echo "DAILY TIPS (12 Total)"
echo "---------------------"
echo ""
echo "  1. Foto produk -> +40% konversi"
echo "  2. Respon 5 menit -> 10x closing"
echo "  3. Packing rapi -> no komplain"
echo "  4. Kirim sebelum jam 2 -> pickup hari ini"
echo "  5. Follow up 3 hari -> dapat review"
echo "  6. Resi instant untuk urgent"
echo "  7. Cek 3 ekspedisi -> hemat ongkir"
echo "  8. Update stok setiap hari"
echo "  9. Bonus kecil = memorable"
echo " 10. Catat pengeluaran kecil"
echo " 11. Template chat untuk FAQ"
echo " 12. Asuransi untuk > 500rb"
echo ""

echo "=================================="
echo "Personalized Welcome Setup Complete!"
echo ""
echo "Benefits:"
echo "  - Website feels 'alive'"
echo "  - User feels recognized"
echo "  - Increased engagement"
echo "  - Daily value through tips"
echo ""

exit 0
