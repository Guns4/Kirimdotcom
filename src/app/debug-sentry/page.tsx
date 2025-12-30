'use client';

import { useState } from 'react';

export default function SentryDebugPage() {
  const [error, setError] = useState(false);

  if (error) {
    throw new Error('This is a simulated Sentry Test Error from CekKirim!');
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-6">
      <h1 className="text-2xl font-bold">Sentry Integration Debugger</h1>
      <p className="max-w-md text-center text-gray-400">
        Clicking the button below will crash this React Component intentionally.
        Check your Sentry Dashboard to see the report.
      </p>

      <button
        onClick={() => setError(true)}
        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
      >
        âš ï¸ Trigger Crash
      </button>
    </div>
  );
}
