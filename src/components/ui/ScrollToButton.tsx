'use client';

export function ScrollToButton({ targetY = 200, children = 'Mulai Buat Label →' }: { targetY?: number; children?: React.ReactNode }) {
    return (
        <button
            onClick={() => window.scrollTo({ top: targetY, behavior: 'smooth' })}
            className="bg-white text-purple-600 font-bold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
        >
            {children}
        </button>
    );
}
