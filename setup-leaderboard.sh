#!/bin/bash

# =============================================================================
# Social Competition: Leaderboard System
# =============================================================================

echo "Initializing Leaderboard System..."
echo "================================================="

# 1. SQL Schema
echo "1. Generating SQL Schema: leaderboard_schema.sql"
cat <<EOF > leaderboard_schema.sql
-- Function: Get Weekly Leaderboard
-- Aggregates positive point history in the last 7 days
CREATE OR REPLACE FUNCTION get_weekly_leaderboard(limit_count int DEFAULT 10)
RETURNS TABLE (
    user_id UUID,
    full_name TEXT,
    avatar_url TEXT,
    weekly_score BIGINT
) AS \$\$
BEGIN
    RETURN QUERY
    SELECT 
        ph.user_id,
        p.full_name,
        p.avatar_url,
        SUM(ph.points_change) as weekly_score
    FROM 
        public.point_history ph
    JOIN 
        public.profiles p ON ph.user_id = p.id
    WHERE 
        ph.points_change > 0 
        AND ph.created_at >= (NOW() - INTERVAL '7 days')
    GROUP BY 
        ph.user_id, p.full_name, p.avatar_url
    ORDER BY 
        weekly_score DESC
    LIMIT 
        limit_count;
END;
\$\$ LANGUAGE plpgsql;

-- Function: Award Weekly Winner
-- Can be called by cron every Monday
CREATE OR REPLACE FUNCTION process_weekly_champion_reward()
RETURNS JSONB AS \$\$
DECLARE
    v_winner_id UUID;
    v_score BIGINT;
    v_reward_amount INT := 1000; -- 1000 Points for #1
BEGIN
    -- Find Winner
    SELECT user_id, weekly_score INTO v_winner_id, v_score
    FROM get_weekly_leaderboard(1);
    
    IF v_winner_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'No winner found');
    END IF;

    -- Award Points (Reusing existing award_points if available, or manual insert)
    -- Assuming award_points(user_id, points, type, description) exists from previous step
    PERFORM award_points(
        v_winner_id, 
        v_reward_amount, 
        'weekly_champion', 
        'Winner of Weekly Leaderboard (' || v_score || ' pts)'
    );

    RETURN jsonb_build_object(
        'success', true, 
        'winner_id', v_winner_id, 
        'reward', v_reward_amount
    );
END;
\$\$ LANGUAGE plpgsql;
EOF

# 2. UI Component
echo "2. Creating UI Component: src/components/social/LeaderboardWidget.tsx"
mkdir -p src/components/social
cat <<EOF > src/components/social/LeaderboardWidget.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Crown, Trophy, Medal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface LeaderboardEntry {
    user_id: string;
    full_name: string;
    avatar_url: string;
    weekly_score: number;
}

export function LeaderboardWidget() {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      const supabase = createClient();
      const { data, error } = await supabase.rpc('get_weekly_leaderboard');
      
      if (!error && data) {
         setData(data);
      }
      setLoading(false);
    }
    fetchLeaderboard();
  }, []);

  if (loading) {
     return <Skeleton className="h-64 w-full rounded-xl" />;
  }

  if (data.length === 0) {
     return (
        <div className="bg-card p-6 rounded-xl border text-center text-muted-foreground">
           <Trophy className="w-10 h-10 mx-auto mb-2 opacity-50" />
           <p>Belum ada aktivitas minggu ini.</p>
        </div>
     );
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-xl overflow-hidden border border-white/10 shadow-2xl">
       {/* Header */}
       <div className="p-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <Crown className="w-5 h-5 text-yellow-500 fill-yellow-500" />
             <h3 className="font-bold">Top Sultan Minggu Ini</h3>
          </div>
          <span className="text-xs text-slate-400 bg-white/10 px-2 py-1 rounded-full">Weekly</span>
       </div>

       {/* List */}
       <div className="divide-y divide-white/5">
          {data.map((user, idx) => {
             const rank = idx + 1;
             
             let RankIcon = <span className="font-mono font-bold text-slate-500 w-6 text-center">{rank}</span>;
             
             if (rank === 1) RankIcon = <Trophy className="w-6 h-6 text-yellow-400 fill-yellow-400 animate-bounce" />;
             if (rank === 2) RankIcon = <Medal className="w-6 h-6 text-gray-300 fill-gray-300" />;
             if (rank === 3) RankIcon = <Medal className="w-6 h-6 text-amber-600 fill-amber-600" />;

             return (
               <div key={user.user_id} className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors group">
                  <div className="flex-shrink-0 flex items-center justify-center w-8">
                     {RankIcon}
                  </div>
                  
                  <Avatar className="h-10 w-10 border-2 border-transparent group-hover:border-primary transition-all">
                     <AvatarImage src={user.avatar_url} />
                     <AvatarFallback className="text-black">{user.full_name?.substring(0,2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                     <p className="font-bold truncate text-sm">{user.full_name || 'Anonymous'}</p>
                     <p className="text-xs text-slate-400">Level {Math.floor(user.weekly_score / 100) + 1}</p>
                  </div>

                  <div className="text-right">
                     <p className="font-mono font-bold text-green-400">+{user.weekly_score}</p>
                     <p className="text-[10px] text-slate-500">POIN</p>
                  </div>
               </div>
             );
          })}
       </div>
    </div>
  );
}
EOF

echo ""
echo "================================================="
echo "Leaderboard System Ready!"
echo "1. Run 'leaderboard_schema.sql' in Supabase."
echo "2. Import <LeaderboardWidget /> on your Dashboard or Landing Page."
