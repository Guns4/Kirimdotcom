'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ReferenceLine,
} from 'recharts';
import { motion } from 'framer-motion';
import { Zap, Trophy } from 'lucide-react';

// Define data type based on our DB table
type CourierStat = {
  courier: string;
  avg_duration_days: number;
  sample_size: number;
};

interface CourierPerformanceChartProps {
  data: CourierStat[];
}

const COLORS = {
  fast: '#22c55e', // Green-500
  medium: '#eab308', // Yellow-500
  slow: '#f97316', // Orange-500
};

export function CourierPerformanceChart({
  data,
}: CourierPerformanceChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="h-[400px] flex items-center justify-center border-dashed">
        <div className="text-center text-muted-foreground">
          <p>Belum ada cukup data untuk hari ini.</p>
        </div>
      </Card>
    );
  }

  // Find winner
  const winner = data[0];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
      >
        <Card className="bg-gradient-to-br from-green-50 to-white border-green-100">
          <CardHeader className="pb-2">
            <CardDescription>Kurir Tercepat Hari Ini</CardDescription>
            <CardTitle className="text-3xl font-bold flex items-center gap-2 text-green-700">
              <Trophy className="h-6 w-6 text-yellow-500" />
              {winner.courier.toUpperCase()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-green-600 font-medium">
              Rata-rata {winner.avg_duration_days} Hari
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Kecepatan Pengiriman Rata-rata
          </CardTitle>
          <CardDescription>
            Data dikumpulkan dari {data.reduce((a, b) => a + b.sample_size, 0)}{' '}
            paket yang berhasil terkirim.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  dataKey="courier"
                  type="category"
                  tickFormatter={(value) => value.toUpperCase()}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  width={80}
                />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                  formatter={(value: number) => [`${value} Hari`, 'Rata-rata']}
                />
                <ReferenceLine
                  x={3}
                  stroke="#9ca3af"
                  strokeDasharray="3 3"
                  label={{ position: 'top', value: '3 Hari (Batang Standar)' }}
                />
                <Bar
                  dataKey="avg_duration_days"
                  radius={[0, 4, 4, 0]}
                  barSize={32}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.avg_duration_days < 2.5
                          ? COLORS.fast
                          : entry.avg_duration_days < 4
                            ? COLORS.medium
                            : COLORS.slow
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ background: COLORS.fast }}
          />
          <span>Cepat (&lt; 2.5 Hari)</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ background: COLORS.medium }}
          />
          <span>Standar (2.5 - 4 Hari)</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ background: COLORS.slow }}
          />
          <span>Lambat (&gt; 4 Hari)</span>
        </div>
      </div>
    </div>
  );
}
