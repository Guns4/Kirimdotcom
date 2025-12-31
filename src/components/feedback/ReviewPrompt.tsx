'use client';

import React from 'react';

interface ReviewPromptProps {
    isOpen: boolean;
    onPositive: () => void;
    onNegative: () => void;
    onClose: () => void;
}

export function ReviewPrompt({ isOpen, onPositive, onNegative, onClose }: ReviewPromptProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 text-center">
                    <div className="mx-auto w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                        Puas dengan CekKirim?
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Bantu kami berkembang dengan memberikan penilaian Anda.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col border-t border-zinc-100 dark:border-zinc-800">
                    <button
                        onClick={onPositive}
                        className="p-4 text-blue-600 font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                        Ya, Suka Sekali! 😍
                    </button>
                    <div className="h-[1px] bg-zinc-100 dark:bg-zinc-800"></div>
                    <button
                        onClick={onNegative}
                        className="p-4 text-zinc-600 font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                        Kurang Puas 😐
                    </button>
                </div>

                {/* Close (Subtle) */}
                <button
                    onClick={onClose}
                    className="w-full p-2 text-xs text-zinc-400 hover:text-zinc-500 pb-4"
                >
                    Nanti Saja
                </button>
            </div>
        </div>
    );
}
