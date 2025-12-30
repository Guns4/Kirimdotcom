'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Star, TrendingUp, Award, MessageCircle } from 'lucide-react';
import type { CourierStats } from '@/app/actions/reviews';

interface CourierLeaderboardProps {
  title: string;
  description: string;
  stats: CourierStats[];
  period: 'week' | 'month' | 'all';
}

export function CourierLeaderboard({
  title,
  description,
  stats,
  period,
}: CourierLeaderboardProps) {
  // Chart data
  const chartData = stats.slice(0, 10).map((stat) => ({
    name: stat.courier_name || stat.courier_code,
    rating: Number(stat.average_rating),
    reviews: Number(stat.total_reviews),
  }));

  // Colors for bars based on rating
  const getBarColor = (rating: number) => {
    if (rating >= 4.5) return '#10b981'; // Green
    if (rating >= 4.0) return '#3b82f6'; // Blue
    if (rating >= 3.5) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
  };

  return (
    <div className="glass-card p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
        <p className="text-sm text-gray-400">{description}</p>
      </div>

      {/* Chart */}
      {stats.length > 0 ? (
        <>
          <div className="mb-8 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                <YAxis
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af' }}
                  domain={[0, 5]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  formatter={(value: any, name?: string) => {
                    if (name === 'rating') return [value.toFixed(2), 'Rating'];
                    if (name === 'reviews') return [value, 'Total Review'];
                    return [value, name || ''];
                  }}
                />
                <Bar dataKey="rating" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getBarColor(entry.rating)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">
                    Rank
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">
                    Kurir
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-400">
                    Rating
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-400">
                    Review
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-400">
                    Sentiment
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.map((stat, index) => {
                  const rating = Number(stat.average_rating);
                  const total = Number(stat.total_reviews);
                  const positive = Number(stat.positive_reviews);
                  const negative = Number(stat.negative_reviews);
                  const positivePercentage =
                    total > 0 ? (positive / total) * 100 : 0;

                  return (
                    <tr
                      key={stat.courier_code}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      {/* Rank */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {index === 0 && (
                            <Award className="w-5 h-5 text-yellow-400" />
                          )}
                          {index === 1 && (
                            <Award className="w-5 h-5 text-gray-400" />
                          )}
                          {index === 2 && (
                            <Award className="w-5 h-5 text-orange-600" />
                          )}
                          <span className="text-white font-semibold">
                            #{index + 1}
                          </span>
                        </div>
                      </td>

                      {/* Courier */}
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-white font-medium">
                            {stat.courier_name || stat.courier_code}
                          </p>
                          {stat.courier_name && (
                            <p className="text-xs text-gray-500">
                              {stat.courier_code}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Rating */}
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-white font-semibold">
                            {rating.toFixed(2)}
                          </span>
                          <span className="text-gray-500 text-sm">/5</span>
                        </div>
                      </td>

                      {/* Reviews */}
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <MessageCircle className="w-4 h-4 text-blue-400" />
                          <span className="text-white">{total}</span>
                        </div>
                      </td>

                      {/* Sentiment */}
                      <td className="py-4 px-4 text-center">
                        <div className="space-y-1">
                          <div className="flex items-center justify-center gap-2 text-sm">
                            <span className="text-green-400">
                              {positive} 😊
                            </span>
                            <span className="text-red-400">{negative} 😞</span>
                          </div>
                          <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500"
                              style={{ width: `${positivePercentage}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        /* Empty State */
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-gray-500" />
          </div>
          <p className="text-gray-400">
            Belum ada data review untuk periode ini
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Jadilah yang pertama memberikan review!
          </p>
        </div>
      )}
    </div>
  );
}
