'use client';

import { useState, useEffect } from 'react';

/**
 * Debug Panel Component
 * Visual debugging tools for development
 */

export function DebugPanel() {
    const [isVisible, setIsVisible] = useState(false);
    const [modes, setModes] = useState({
        clickable: false,
        layout: false,
        zindex: false,
        spacing: false,
        responsive: false,
        a11y: false,
    });

    // Toggle debug classes on body
    useEffect(() => {
        if (process.env.NODE_ENV !== 'development') return;
        const body = document.body;
        Object.entries(modes).forEach(([mode, enabled]) => {
            const className = `debug-${mode}`;
            if (enabled) {
                body.classList.add(className);
            } else {
                body.classList.remove(className);
            }
        });
    }, [modes]);

    // Only show in development
    if (process.env.NODE_ENV !== 'development') {
        return null;
    }

    const toggleMode = (mode: keyof typeof modes) => {
        setModes((prev) => ({ ...prev, [mode]: !prev[mode] }));
    };

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => setIsVisible(!isVisible)}
                className="fixed bottom-4 right-4 w-12 h-12 bg-surface-900 text-white rounded-full shadow-lg z-[999999] flex items-center justify-center hover:bg-surface-800 transition-colors"
                title="Debug Panel"
            >
                🔧
            </button>

            {/* Panel */}
            {isVisible && (
                <div className="fixed bottom-20 right-4 bg-surface-900 text-white p-4 rounded-xl shadow-2xl z-[999998] min-w-[200px]">
                    <h3 className="font-bold mb-3 text-sm">Debug Tools</h3>

                    <div className="space-y-2 text-sm">
                        <label className="flex items-center gap-3 cursor-pointer hover:bg-surface-800 p-1 rounded">
                            <input
                                type="checkbox"
                                checked={modes.clickable}
                                onChange={() => toggleMode('clickable')}
                                className="w-4 h-4"
                            />
                            <span>🔴 Clickable Areas</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer hover:bg-surface-800 p-1 rounded">
                            <input
                                type="checkbox"
                                checked={modes.layout}
                                onChange={() => toggleMode('layout')}
                                className="w-4 h-4"
                            />
                            <span>🟢 Layout Borders</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer hover:bg-surface-800 p-1 rounded">
                            <input
                                type="checkbox"
                                checked={modes.zindex}
                                onChange={() => toggleMode('zindex')}
                                className="w-4 h-4"
                            />
                            <span>🔵 Z-Index</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer hover:bg-surface-800 p-1 rounded">
                            <input
                                type="checkbox"
                                checked={modes.spacing}
                                onChange={() => toggleMode('spacing')}
                                className="w-4 h-4"
                            />
                            <span>🟡 Spacing</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer hover:bg-surface-800 p-1 rounded">
                            <input
                                type="checkbox"
                                checked={modes.responsive}
                                onChange={() => toggleMode('responsive')}
                                className="w-4 h-4"
                            />
                            <span>📱 Breakpoint</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer hover:bg-surface-800 p-1 rounded">
                            <input
                                type="checkbox"
                                checked={modes.a11y}
                                onChange={() => toggleMode('a11y')}
                                className="w-4 h-4"
                            />
                            <span>♿ Accessibility</span>
                        </label>
                    </div>

                    <hr className="my-3 border-surface-700" />

                    <div className="text-xs text-surface-400">
                        <p>Touch target: 44×44px min</p>
                        <p>Current: {typeof window !== 'undefined' ? window.innerWidth : 0}×{typeof window !== 'undefined' ? window.innerHeight : 0}</p>
                    </div>
                </div>
            )}
        </>
    );
}

export default DebugPanel;
