import Link from 'next/link';

/**
 * Too Many Requests Page (429)
 * Displayed when rate limit is exceeded
 */

export default function TooManyRequests() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-warning-50 to-white">
      {/* Illustration */}
      <div className="relative mb-8">
        <svg className="w-48 h-48" viewBox="0 0 300 300" fill="none">
          {/* Background */}
          <circle cx="150" cy="150" r="120" fill="#FEF3C7" />

          {/* Traffic light pole */}
          <rect x="140" y="180" width="20" height="80" fill="#9CA3AF" />
          <rect x="130" y="250" width="40" height="10" rx="2" fill="#6B7280" />

          {/* Traffic light box */}
          <rect x="115" y="60" width="70" height="130" rx="10" fill="#374151" />

          {/* Red light (active) */}
          <circle cx="150" cy="95" r="22" fill="#FEE2E2" />
          <circle cx="150" cy="95" r="18" fill="#EF4444">
            <animate
              attributeName="opacity"
              values="1;0.5;1"
              dur="1s"
              repeatCount="indefinite"
            />
          </circle>

          {/* Yellow light */}
          <circle cx="150" cy="140" r="18" fill="#4B5563" />

          {/* Green light */}
          <circle cx="150" cy="185" r="18" fill="#4B5563" />

          {/* STOP hand */}
          <g transform="translate(200, 80)">
            <circle cx="30" cy="30" r="30" fill="#FEE2E2" />
            <text
              x="30"
              y="38"
              fontSize="24"
              textAnchor="middle"
              fill="#EF4444"
            >
              ✋
            </text>
          </g>

          {/* Clock */}
          <g transform="translate(40, 100)">
            <circle
              cx="25"
              cy="25"
              r="25"
              fill="white"
              stroke="#F59E0B"
              strokeWidth="3"
            />
            <line
              x1="25"
              y1="25"
              x2="25"
              y2="12"
              stroke="#F59E0B"
              strokeWidth="3"
              strokeLinecap="round"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 25 25"
                to="360 25 25"
                dur="4s"
                repeatCount="indefinite"
              />
            </line>
            <circle cx="25" cy="25" r="3" fill="#F59E0B" />
          </g>
        </svg>

        {/* 429 Badge */}
        <div className="absolute top-0 right-0 bg-warning-500 text-white text-xl font-bold px-3 py-1 rounded-lg shadow-lg">
          429
        </div>
      </div>

      {/* Text */}
      <h1 className="text-2xl font-bold text-surface-900 mb-3 text-center">
        Wah, Terlalu Cepat! 🏃💨
      </h1>
      <p className="text-surface-500 text-center max-w-md mb-6">
        Anda mengirim terlalu banyak request dalam waktu singkat. Sistem kami
        perlu istirahat sebentar. Silakan tunggu beberapa saat.
      </p>

      {/* Timer */}
      <div className="bg-surface-100 rounded-2xl p-6 mb-8 text-center">
        <p className="text-sm text-surface-500 mb-2">Coba lagi dalam</p>
        <div
          className="text-4xl font-bold text-primary-600 font-mono"
          id="countdown"
        >
          00:60
        </div>
        <p className="text-xs text-surface-400 mt-2">detik</p>
      </div>

      {/* Tips */}
      <div className="bg-primary-50 rounded-xl p-4 max-w-md text-center mb-8">
        <p className="text-sm text-primary-700">
          💡 <strong>Tips:</strong> Gunakan fitur Bulk Tracking untuk cek banyak
          resi sekaligus tanpa limit!
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          Kembali ke Home
        </Link>
        <Link
          href="/bulk-tracking"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-surface-200 hover:border-surface-300 text-surface-700 font-semibold rounded-xl transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          Bulk Tracking
        </Link>
      </div>
    </div>
  );
}
