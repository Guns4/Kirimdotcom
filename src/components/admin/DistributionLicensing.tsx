'use client';
import React, { useState, useEffect } from 'react';
import { Key, Smartphone, TrendingUp } from 'lucide-react';

export default function DistributionLicensing({ adminKey }: { adminKey: string }) {
    return (
        <div className="space-y-6">
            {/* LICENSE MANAGER */}
            <div className="bg-white rounded-xl shadow border p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Key size={20} className="text-blue-600" />
                    Plugin License Manager (Anti-Piracy DRM)
                </h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="p-4 bg-blue-50 rounded">
                        <div className="text-2xl font-black">347</div>
                        <div className="text-xs text-slate-600">Active Licenses</div>
                    </div>
                    <div className="p-4 bg-green-50 rounded">
                        <div className="text-2xl font-black">892</div>
                        <div className="text-xs text-slate-600">Domains Registered</div>
                    </div>
                    <div className="p-4 bg-red-50 rounded">
                        <div className="text-2xl font-black">23</div>
                        <div className="text-xs text-slate-600">Blocked Attempts</div>
                    </div>
                </div>
                <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded">
                    🛡️ DRM Protection Active | Licenses validate on each plugin activation
                </div>
            </div>

            {/* APP STORE TOWER */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white">
                    <Smartphone className="mb-2" size={32} />
                    <div className="text-sm opacity-90">Android (Play Store)</div>
                    <div className="text-3xl font-black mt-2">v1.2.0</div>
                    <div className="mt-2 px-3 py-1 bg-white/30 rounded inline-block text-xs font-bold">
                        ✅ PUBLISHED
                    </div>
                    <div className="mt-4 text-xs opacity-75">Crash-free: 99.5%</div>
                </div>

                <div className="bg-gradient-to-br from-gray-700 to-gray-800 p-6 rounded-xl text-white">
                    <Smartphone className="mb-2" size={32} />
                    <div className="text-sm opacity-90">iOS (App Store)</div>
                    <div className="text-3xl font-black mt-2">v1.2.1</div>
                    <div className="mt-2 px-3 py-1 bg-yellow-500 text-black rounded inline-block text-xs font-bold">
                        ⏳ IN REVIEW
                    </div>
                    <div className="mt-4 text-xs opacity-75">Crash-free: 99.8%</div>
                </div>
            </div>
        </div>
    );
}
