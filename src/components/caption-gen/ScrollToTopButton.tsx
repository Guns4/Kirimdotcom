'use client';

export function ScrollToTopButton() {
    return (
        <button
            onClick={() => window.scroll({ top: 0, behavior: 'smooth' })}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-3 rounded-lg transition-colors"
        >
            Lihat Semua Caption
        </button>
    );
}
