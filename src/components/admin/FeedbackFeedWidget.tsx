'use client';

import { useEffect, useState } from 'react';
import { getNPSStats, getRecentFeedback } from '@/app/actions/feedback';
import { MessageSquare, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function FeedbackFeedWidget() {
  const [nps, setNps] = useState<any>(null);
  const [feed, setFeed] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const n = await getNPSStats();
      const f = await getRecentFeedback(5);
      setNps(n);
      setFeed(f);
    }
    load();
  }, []);

  if (!nps)
    return (
      <div className="p-6 bg-white rounded-xl border animate-pulse h-48"></div>
    );

  const npsColor =
    nps.score > 50
      ? 'text-green-600'
      : nps.score > 0
        ? 'text-blue-600'
        : 'text-red-600';

  return (
    <div className="bg-white border rounded-xl p-0 overflow-hidden flex flex-col h-full">
      {/* NPS Header */}
      <div className="p-6 border-b flex items-center justify-between bg-gray-50">
        <div>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">
            Net Promoter Score
          </h3>
          <div
            className={`text-3xl font-black ${npsColor} flex items-center gap-2`}
          >
            {nps.score > 0 && '+'}
            {nps.score}
            <span className="text-sm font-normal text-gray-400 bg-white px-2 py-0.5 rounded border">
              {nps.total} Responses
            </span>
          </div>
        </div>
        {/* Mini Graph/Icon */}
        <div className="flex gap-2 text-xs">
          <div className="text-green-600 text-center">
            <div className="h-8 w-2 bg-green-200 rounded-t mx-auto relative">
              <div
                className="absolute bottom-0 w-full bg-green-500 rounded-t"
                style={{
                  height: `${(nps.breakdown.promoters / nps.total) * 100}%`,
                }}
              ></div>
            </div>
            P
          </div>
          <div className="text-yellow-600 text-center">
            <div className="h-8 w-2 bg-yellow-200 rounded-t mx-auto relative">
              <div
                className="absolute bottom-0 w-full bg-yellow-500 rounded-t"
                style={{
                  height: `${(nps.breakdown.passives / nps.total) * 100}%`,
                }}
              ></div>
            </div>
            N
          </div>
          <div className="text-red-600 text-center">
            <div className="h-8 w-2 bg-red-200 rounded-t mx-auto relative">
              <div
                className="absolute bottom-0 w-full bg-red-500 rounded-t"
                style={{
                  height: `${(nps.breakdown.detractors / nps.total) * 100}%`,
                }}
              ></div>
            </div>
            D
          </div>
        </div>
      </div>

      {/* Live Feed */}
      <div className="flex-1 overflow-auto p-0">
        <div className="px-6 py-3 text-xs font-bold text-gray-400 bg-white sticky top-0 border-b">
          LATEST FEEDBACK
        </div>
        {feed.map((item, i) => (
          <div
            key={i}
            className="px-6 py-4 border-b last:border-0 hover:bg-gray-50 transition flex gap-3"
          >
            <div
              className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                item.type === 'nps'
                  ? item.rating >= 9
                    ? 'bg-green-100 text-green-700'
                    : item.rating <= 6
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {item.type === 'nps' ? (
                item.rating
              ) : (
                <MessageSquare className="w-3 h-3" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 line-clamp-2">
                {item.message ||
                  (item.type === 'nps'
                    ? 'User submitted a rating'
                    : 'No message')}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-indigo-500 font-medium">
                  {item.profiles?.full_name || 'Anonymous'}
                </span>
                <span className="text-[10px] text-gray-400">
                  • {new Date(item.created_at).toLocaleDateString()}
                </span>
                <span className="text-[10px] bg-gray-100 px-1.5 rounded text-gray-500 uppercase">
                  {item.type}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
