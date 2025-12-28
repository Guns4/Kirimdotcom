#!/bin/bash

# =============================================================================
# Upgrade Blacklist Scoring (Phase 135)
# Risk Intelligence & Speedometer UI
# =============================================================================

echo "Upgrading Blacklist Scoring System..."
echo "================================================="
echo ""

# 1. Scoring Logic Utility
echo "1. Creating Utility: src/lib/risk-scoring.ts"
mkdir -p src/lib

cat <<EOF > src/lib/risk-scoring.ts
export interface Report {
    id: string;
    description: string;
    has_evidence: boolean;
    created_at: string;
}

export interface RiskScore {
    score: number; // 0-100
    level: 'AMAN' | 'WASPADA' | 'BAHAYA';
    color: string;
    factors: string[];
}

export function calculateRiskScore(reports: Report[]): RiskScore {
    let score = 100;
    const factors: string[] = [];
    const now = new Date();

    if (reports.length === 0) {
        return { score: 100, level: 'AMAN', color: '#10B981', factors: ['Tidak ada laporan'] };
    }

    reports.forEach(report => {
        // Base deduction
        let deduction = 20;

        // Evidence penalty
        if (report.has_evidence) {
            deduction += 10; // Total 30
        }

        // Recency penalty (< 30 days)
        const reportDate = new Date(report.created_at);
        const daysDiff = (now.getTime() - reportDate.getTime()) / (1000 * 3600 * 24);
        
        if (daysDiff < 30) {
            deduction += 10;
        }

        score -= deduction;
    });

    // Clamp score 0-100
    score = Math.max(0, Math.min(100, score));

    // Determine Level
    let level: RiskScore['level'] = 'AMAN';
    let color = '#10B981'; // Green

    if (score < 40) {
        level = 'BAHAYA';
        color = '#EF4444'; // Red
    } else if (score < 80) {
        level = 'WASPADA';
        color = '#F59E0B'; // Yellow
    }

    return { score, level, color, factors };
}
EOF
echo "   [✓] risk-scoring.ts created."
echo ""

# 2. Speedometer Component
echo "2. Creating Component: src/components/blacklist/TrustSpeedometer.tsx"
mkdir -p src/components/blacklist

cat <<EOF > src/components/blacklist/TrustSpeedometer.tsx
'use client';

import { motion } from 'framer-motion';

interface TrustSpeedometerProps {
    score: number; // 0 - 100
    level: string;
    color: string;
}

export function TrustSpeedometer({ score, level, color }: TrustSpeedometerProps) {
    // Map score (0-100) to rotation (-90deg to 90deg)
    // 0 -> -90deg (Red)
    // 100 -> 90deg (Green)
    const rotation = (score / 100) * 180 - 90;

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-48 h-24 overflow-hidden mb-2">
                {/* Background Arc */}
                <div className="absolute w-44 h-44 rounded-full border-[12px] border-gray-700 top-0 left-2 box-border border-b-0 border-l-0 border-r-0" style={{ clipPath: 'inset(0 0 50% 0)' }}></div>
                
                {/* Colored Zones (Simplified as gradient) */}
                <div 
                     className="absolute w-44 h-44 rounded-full top-0 left-2 opacity-30"
                     style={{ 
                         background: \`conic-gradient(from 270deg, #EF4444 0deg, #F59E0B 90deg, #10B981 180deg)\`,
                         clipPath: 'inset(0 0 50% 0)',
                         maskImage: 'radial-gradient(transparent 55%, black 56%)'
                     }}
                />

                {/* Needle */}
                <motion.div 
                    initial={{ rotate: -90 }}
                    animate={{ rotate: rotation }}
                    transition={{ type: 'spring', damping: 12, stiffness: 50 }}
                    className="absolute bottom-0 left-1/2 w-1 h-20 bg-white origin-bottom -ml-0.5 rounded-full z-10"
                />
                
                {/* Pivot */}
                <div className="absolute bottom-0 left-1/2 w-4 h-4 bg-white rounded-full -ml-2 -mb-2 z-20 shadow-lg" />
            </div>

            <div className="text-center">
                <p className="text-3xl font-black" style={{ color }}>{score}</p>
                <p className="text-xs text-gray-400 font-medium tracking-wider uppercase">TRUST SCORE</p>
                
                <div className="mt-2 text-sm font-bold px-3 py-1 rounded-full bg-white/5 border border-white/10 inline-block" style={{ color }}>
                    {level}
                </div>
            </div>
        </div>
    );
}
EOF
echo "   [✓] TrustSpeedometer component created."
echo ""

# Instructions
echo "================================================="
echo "Setup Complete!"
echo "1. Run this script."
echo "2. Update your Blacklist Result UI:"
echo "   - Import calculateRiskScore & TrustSpeedometer."
echo "   - Calculate risks from report data."
echo "   - Render <TrustSpeedometer />."
