'use client';
import React, { useState, useEffect } from 'react';
import { Scale, Users2, DollarSign, Shield } from 'lucide-react';

export default function EcosystemGovernance({ adminKey }: { adminKey: string }) {
    const [disputes, setDisputes] = useState<any[]>([]);
    const [affiliates, setAffiliates] = useState<any[]>([]);
    const [margins, setMargins] = useState<any[]>([]);

    return (
        <div className="space-y-6">
            {/* DIGITAL COURTROOM */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-6 rounded-xl text-white">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Scale size={20} />
                    Digital Courtroom - Dispute Resolution
                </h3>
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white/10 p-4 rounded">
                        <div className="text-2xl font-black">12</div>
                        <div className="text-xs">Open Cases</div>
                    </div>
                    <div className="bg-white/10 p-4 rounded">
                        <div className="text-2xl font-black">45</div>
                        <div className="text-xs">Resolved This Month</div>
                    </div>
                    <div className="bg-white/10 p-4 rounded">
                        <div className="text-2xl font-black">Rp 15M</div>
                        <div className="text-xs">In Escrow</div>
                    </div>
                </div>
            </div>

            {/* AFFILIATE NETWORK */}
            <div className="bg-white rounded-xl shadow border p-6">
                <h4 className="font-bold mb-4 flex items-center gap-2">
                    <Users2 size={20} className="text-purple-600" />
                    Affiliate Network Manager
                </h4>
                <div className="text center p-8">
                    <div className="text-6xl mb-4">🌳</div>
                    <div className="font-bold">Referral Tree Visualization</div>
                    <div className="text-sm text-slate-600">Top 10 Affiliates earned Rp 50M this month</div>
                </div>
            </div>

            {/* PPOB PRICING ENGINE */}
            <div className="bg-gradient-to-br from-green-600 to-emerald-600 p-6 rounded-xl text-white">
                <h4 className="font-bold mb-4 flex items-center gap-2">
                    <DollarSign size={20} />
                    PPOB Bulk Pricing Engine
                </h4>
                <div className="bg-white/20 p-4 rounded">
                    <div className="text-sm mb-2">Active Margin Rules: 5</div>
                    <div className="text-xs">Last bulk update: Applied +Rp 500 to 1,245 Telkomsel products</div>
                </div>
            </div>
        </div>
    );
}
