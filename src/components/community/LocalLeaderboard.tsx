import React from 'react';
import { getLeaderboardByArea } from '@/lib/community-ranking';
import Image from 'next/image';

export default function LocalLeaderboard({ area }: { area: string }) {
    const rankings = getLeaderboardByArea(area);

    return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                🏆 Top Agents in {area}
            </h3>
            <div className="space-y-4">
                {rankings.map((agent, index) => (
                    <div key={agent.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                        <div className="flex-shrink-0 w-8 text-center font-bold text-zinc-400">
                            #{index + 1}
                        </div>
                        <div className="relative w-10 h-10">
                            <Image
                                src={agent.avatar}
                                alt={agent.name}
                                fill
                                className="rounded-full object-cover"
                            />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">{agent.name}</h4>
                            <div className="flex gap-1 mt-1">
                                {agent.badges.map(badge => (
                                    <span key={badge} className="text-[10px] px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full border border-yellow-200">
                                        {badge}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="block font-bold text-blue-600">{agent.points}</span>
                            <span className="text-xs text-zinc-500">pts</span>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-6 text-center">
                <button className="text-sm text-blue-500 hover:underline">
                    View Full Leaderboard &rarr;
                </button>
            </div>
        </div>
    );
}
