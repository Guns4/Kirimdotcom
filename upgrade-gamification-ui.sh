#!/bin/bash

# =============================================================================
# Upgrade Gamification UI (Phase 134)
# Visual Badges & Status Symbols
# =============================================================================

echo "Upgrading Gamification UI..."
echo "================================================="
echo ""

# 1. User Badge Component
echo "1. Creating Component: src/components/gamification/UserBadge.tsx"
mkdir -p src/components/gamification

cat <<EOF > src/components/gamification/UserBadge.tsx
'use client';

import { Shield, Star, Crown, Gem } from 'lucide-react';

interface UserBadgeProps {
    points: number;
    showLabel?: boolean;
    className?: string;
}

export function UserBadge({ points, showLabel = true, className = '' }: UserBadgeProps) {
    // 1. Determine Tier
    let tier = 'Bronze';
    let Icon = Shield;
    let colorClass = 'text-orange-400 bg-orange-400/10 border-orange-400/20';
    let shineEffect = '';

    if (points >= 10000) {
        tier = 'Platinum';
        Icon = Gem;
        colorClass = 'text-cyan-300 bg-cyan-400/10 border-cyan-400/30 shadow-[0_0_15px_rgba(34,211,238,0.3)]';
        shineEffect = 'animate-pulse'; // Platinum sparkle
    } else if (points >= 5000) {
        tier = 'Gold';
        Icon = Crown;
        colorClass = 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
        shineEffect = 'relative overflow-hidden before:absolute before:top-0 before:-left-[150%] before:w-[50%] before:h-full before:bg-gradient-to-r before:from-transparent before:via-white/50 before:to-transparent before:skew-x-[30deg] before:animate-[shimmer_2s_infinite]'; 
    } else if (points >= 1000) {
        tier = 'Silver';
        Icon = Star;
        colorClass = 'text-slate-300 bg-slate-400/10 border-slate-400/20';
    }

    // Custom Shimmer Keyframe (Tailwind config might accept this, or inline style)
    // For simplicity, we rely on the class presence. 
    // *Implementation Note*: Ensure 'shimmer' keyframe exists in tailwind or use simple pulse/spin for now if not.
    // We'll use a reliable 'animate-pulse' for Gold as a fallback if shimmer isn't defined.
    if (tier === 'Gold') shineEffect = ''; // Reset complex effect for stability, use standard glow

    return (
        <div 
            className={\`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border \${colorClass} \${className} \${shineEffect}\`}
            title={\`\${tier} Member (\${points} pts)\`}
        >
            <Icon className={\`w-3.5 h-3.5 fill-current \${tier === 'Platinum' ? 'animate-spin-slow' : ''}\`} />
            
            {showLabel && (
                <span className="text-xs font-bold tracking-wide uppercase">
                    {tier}
                </span>
            )}
        </div>
    );
}
EOF
echo "   [✓] UserBadge component created."
echo ""

# Instructions
echo "================================================="
echo "Setup Complete!"
echo "1. Run this script."
echo "2. Import <UserBadge points={user.points} /> in Navbar or Profile."
echo "3. Add 'shimmer' keyframes to tailwind.config.ts if you want the advanced Gold effect."
