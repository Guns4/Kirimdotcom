import React from 'react';
import LocalLeaderboard from '@/components/community/LocalLeaderboard';

// Example Area Page that includes the leaderboard
export default function AreaPage({ params }: { params: { slug: string[] } }) {
    const areaName = params.slug.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
                    Logistic Hub: {areaName}
                </h1>
                <p className="text-zinc-600 dark:text-zinc-400 mt-2">
                    Find the best shipping rates and top-rated agents in {areaName}.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content (Rates, etc.) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="p-6 bg-zinc-100 dark:bg-zinc-800 rounded-lg h-64 flex items-center justify-center text-zinc-500">
                        [Rate Calculator & Listings Placeholder]
                    </div>
                    <div className="p-6 bg-zinc-100 dark:bg-zinc-800 rounded-lg h-64 flex items-center justify-center text-zinc-500">
                        [Map Visualizer Placeholder]
                    </div>
                </div>

                {/* Sidebar (Leaderboard) */}
                <div className="space-y-6">
                    <LocalLeaderboard area={areaName} />

                    <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg">
                        <h4 className="font-bold text-blue-800 dark:text-blue-200 mb-2">Become an Agent</h4>
                        <p className="text-sm text-blue-600 dark:text-blue-300 mb-4">
                            Join the network in {areaName} and earn points for every shipment.
                        </p>
                        <button className="w-full py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                            Register Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
