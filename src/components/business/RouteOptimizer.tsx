'use client';

import React, { useState } from 'react';
import { OptimizationResult } from '@/lib/route-optimizer';

export default function RouteOptimizer() {
  const [file, setFile] = useState<File | null>(null);
  const [strategy, setStrategy] = useState<'CHEAPEST' | 'FASTEST' | 'BALANCED'>('CHEAPEST');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    processed: number;
    totalPrice: number;
    savings: number;
    results: OptimizationResult[];
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('strategy', strategy);

    try {
      const res = await fetch('/api/optimize-route', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error(err);
      alert('Optimization failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800">
      <h2 className="text-xl font-bold mb-4">Bulk Route Optimizer</h2>

      {!results ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Upload CSV (Origin, Destination, Weight)</label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-zinc-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            <p className="text-xs text-zinc-400 mt-1">Example: Jakarta, Bandung, 2</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Optimization Goal</label>
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value as any)}
              className="w-full p-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-transparent"
            >
              <option value="CHEAPEST">Cheapest - Maximize Savings</option>
              <option value="FASTEST">Fastest - Priority Delivery</option>
              <option value="BALANCED">Balanced - Best Value</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={!file || loading}
            className="w-full py-2 bg-blue-600 text-white rounded-md font-bold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Optimizing...' : 'Run Optimization'}
          </button>
        </form>
      ) : (
        <div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Total Savings</p>
              <p className="text-xl font-bold text-green-600">Rp {results.savings.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Total Cost</p>
              <p className="text-xl font-bold text-blue-600">Rp {results.totalPrice.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-center">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Packages</p>
              <p className="text-xl font-bold">{results.processed}</p>
            </div>
          </div>

          <h3 className="font-semibold mb-2">Optimization Breakdown</h3>
          <div className="max-h-60 overflow-y-auto border border-zinc-200 dark:border-zinc-800 rounded-md">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-800">
                <tr>
                  <th className="p-2 text-left">ID</th>
                  <th className="p-2 text-left">Courier</th>
                  <th className="p-2 text-left">Price</th>
                  <th className="p-2 text-left">ETD</th>
                </tr>
              </thead>
              <tbody>
                {results.results.map((r, i) => (
                  <tr key={i} className="border-t border-zinc-100 dark:border-zinc-800">
                    <td className="p-2">{r.shipmentId}</td>
                    <td className="p-2 font-medium">{r.courier} {r.service}</td>
                    <td className="p-2">Rp {r.price.toLocaleString()}</td>
                    <td className="p-2">{r.etd}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={() => setResults(null)}
            className="mt-4 text-sm text-blue-500 hover:underline"
          >
            Start New Optimization
          </button>
        </div>
      )}
    </div>
  );
}
