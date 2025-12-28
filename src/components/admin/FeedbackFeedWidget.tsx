'use client';

import { useEffect, useState } from 'react';
import { getFeedbackFeed, getNPSStats } from '@/app/actions/feedback';
import { MessageSquare, Bug, Lightbulb, Star, Smile, Frown, Meh, Loader2 } from 'lucide-react';

export default function FeedbackFeedWidget() {
    const [feed, setFeed] = useState<any[]>([]);
    const [nps, setNps] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [feedData, npsData] = await Promise.all([
                    getFeedbackFeed(5),
                    getNPSStats()
                ]);
                setFeed(feedData.data);
                setNps(npsData);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'bug': return <Bug className="w-4 h-4 text-red-500" />;
            case 'feature': return <Lightbulb className="w-4 h-4 text-yellow-500" />;
            case 'nps': return <Star className="w-4 h-4 text-indigo-500" />;
            default: return <MessageSquare className="w-4 h-4 text-gray-400" />;
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm col-span-3 lg:col-span-1 flex flex-col h-full">
            <h3 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                User Feedback
            </h3>

            {/* NPS Card */}
            {nps && (
                <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-gray-600">Net Promoter Score</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${nps.score > 50 ? 'bg-green-100 text-green-700' : nps.score > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                            {nps.score > 0 ? '+' : ''}{nps.score}
                        </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                            <Smile className="w-3 h-3 text-green-500" /> {nps.promoters}
                        </div>
                        <div className="flex items-center gap-1">
                            <Meh className="w-3 h-3 text-gray-400" /> {nps.passives}
                        </div>
                        <div className="flex items-center gap-1">
                            <Frown className="w-3 h-3 text-red-500" /> {nps.detractors}
                        </div>
                    </div>
                </div>
            )}

            {/* Feed List */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-gray-200">
                {loading ? (
                    <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-gray-300" /></div>
                ) : feed.length === 0 ? (
                    <p className="text-center text-gray-400 text-sm py-4">Belum ada feedback</p>
                ) : (
                    feed.map((item) => (
                        <div key={item.id} className="text-sm border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                            <div className="flex justify-between items-center mb-1">
                                <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-gray-50 border border-gray-100`}>
                                    {getTypeIcon(item.type)}
                                    {item.type}
                                </span>
                                <span className="text-xs text-gray-400">
                                    {new Date(item.created_at).toLocaleDateString('id-ID')}
                                </span>
                            </div>

                            {item.rating > 0 && item.type !== 'nps' && (
                                <div className="flex mb-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-3 h-3 ${i < item.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                                    ))}
                                </div>
                            )}

                            {item.type === 'nps' && (
                                <div className="flex items-center gap-1 mb-1">
                                    <span className="font-bold text-indigo-600">{item.rating}/10</span>
                                </div>
                            )}

                            {item.message && (
                                <p className="text-gray-600 mt-1 line-clamp-3 leading-relaxed">
                                    "{item.message}"
                                </p>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
