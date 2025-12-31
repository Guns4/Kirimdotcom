import React from 'react';
import RouteOptimizer from '@/components/business/RouteOptimizer';

export const metadata = {
  title: 'B2B Route Optimizer | CekKirim.com Business',
  description: 'Optimize bulk shipping routes to save costs.',
};

export default function RouteOptimizerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Smart Route Optimizer</h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-2">
          Upload your bulk shipment manifest and let our AI find the best courier combination for maximum savings.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <RouteOptimizer />
        </div>
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
            <strong>How it works:</strong>
            <ol className="list-decimal ml-4 mt-2 space-y-1">
              <li>Prepare CSV with: Origin, Destination, Weight</li>
              <li>Upload file</li>
              <li>Select Strategy (Cheapest/Fastest)</li>
              <li>Get actionable report</li>
            </ol>
          </div>

          <a href="#" className="block text-center p-2 border border-dashed border-zinc-300 rounded text-zinc-500 text-sm hover:bg-zinc-50">
            Download CSV Template
          </a>
        </div>
      </div>
    </div>
  );
}
