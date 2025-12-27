'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

/**
 * Command Palette Component
 * Cmd+K / Ctrl+K to open
 */

// Command types
interface Command {
    id: string;
    icon: string;
    title: string;
    subtitle?: string;
    category: 'navigation' | 'action' | 'search' | 'settings';
    action: () => void;
    keywords?: string[];
}

interface CommandPaletteProps {
    customCommands?: Command[];
}

export function CommandPalette({ customCommands = [] }: CommandPaletteProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Default commands
    const defaultCommands: Command[] = [
        // Navigation
        { id: 'home', icon: '🏠', title: 'Home', category: 'navigation', action: () => router.push('/'), keywords: ['beranda'] },
        { id: 'dashboard', icon: '📊', title: 'Dashboard', category: 'navigation', action: () => router.push('/dashboard'), keywords: ['panel'] },
        { id: 'orders', icon: '📦', title: 'Pesanan', category: 'navigation', action: () => router.push('/dashboard/orders'), keywords: ['order'] },
        { id: 'wallet', icon: '💰', title: 'Wallet', category: 'navigation', action: () => router.push('/dashboard/wallet'), keywords: ['saldo', 'dompet'] },
        { id: 'settings', icon: '⚙️', title: 'Pengaturan', category: 'navigation', action: () => router.push('/dashboard/settings'), keywords: ['setting'] },
        { id: 'profile', icon: '👤', title: 'Profil', category: 'navigation', action: () => router.push('/dashboard/profile'), keywords: ['user'] },
        { id: 'invoices', icon: '📄', title: 'Invoice', category: 'navigation', action: () => router.push('/dashboard/invoices'), keywords: ['faktur'] },
        { id: 'products', icon: '🛍️', title: 'Produk', category: 'navigation', action: () => router.push('/dashboard/inventory'), keywords: ['barang'] },
        { id: 'customers', icon: '👥', title: 'Pelanggan', category: 'navigation', action: () => router.push('/dashboard/customers'), keywords: ['customer'] },

        // Actions
        { id: 'new-order', icon: '➕', title: 'Buat Pesanan Baru', category: 'action', action: () => router.push('/dashboard/orders/new'), keywords: ['add', 'tambah'] },
        { id: 'new-product', icon: '➕', title: 'Tambah Produk', category: 'action', action: () => router.push('/dashboard/inventory/new'), keywords: ['add product'] },
        { id: 'new-invoice', icon: '📝', title: 'Buat Invoice', category: 'action', action: () => router.push('/dashboard/invoices/new'), keywords: ['create invoice'] },
        { id: 'topup', icon: '💳', title: 'Top Up Wallet', category: 'action', action: () => router.push('/dashboard/wallet?action=topup'), keywords: ['isi saldo'] },
        { id: 'track', icon: '🔍', title: 'Cek Resi', category: 'action', action: () => router.push('/'), keywords: ['lacak', 'tracking'] },
        { id: 'bulk-track', icon: '📋', title: 'Bulk Tracking', category: 'action', action: () => router.push('/bulk-tracking'), keywords: ['banyak resi'] },

        // Settings
        { id: 'dark-mode', icon: '🌙', title: 'Toggle Dark Mode', category: 'settings', action: () => toggleDarkMode(), keywords: ['theme', 'gelap'] },
        { id: 'logout', icon: '🚪', title: 'Logout', category: 'settings', action: () => router.push('/auth/logout'), keywords: ['keluar', 'signout'] },
        { id: 'help', icon: '❓', title: 'Bantuan', category: 'settings', action: () => router.push('/help'), keywords: ['support', 'faq'] },
    ];

    const allCommands = [...defaultCommands, ...customCommands];

    // Filter commands based on query
    const filteredCommands = query.trim()
        ? allCommands.filter((cmd) => {
            const searchStr = `${cmd.title} ${cmd.subtitle || ''} ${cmd.keywords?.join(' ') || ''}`.toLowerCase();
            return searchStr.includes(query.toLowerCase());
        })
        : allCommands;

    // Toggle dark mode
    function toggleDarkMode() {
        document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    }

    // Keyboard shortcuts
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            // Open with Cmd+K or Ctrl+K
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(true);
            }

            // Close with Escape
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        }

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
        if (!isOpen) {
            setQuery('');
            setSelectedIndex(0);
        }
    }, [isOpen]);

    // Navigation with arrow keys
    const handleKeyNavigation = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex((i) => Math.min(i + 1, filteredCommands.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredCommands[selectedIndex]) {
                executeCommand(filteredCommands[selectedIndex]);
            }
        }
    }, [filteredCommands, selectedIndex]);

    // Execute command
    const executeCommand = (cmd: Command) => {
        setIsOpen(false);
        cmd.action();
    };

    // Group commands by category
    const groupedCommands = filteredCommands.reduce((acc, cmd) => {
        if (!acc[cmd.category]) acc[cmd.category] = [];
        acc[cmd.category].push(cmd);
        return acc;
    }, {} as Record<string, Command[]>);

    const categoryLabels: Record<string, string> = {
        navigation: 'Navigasi',
        action: 'Aksi',
        search: 'Pencarian',
        settings: 'Pengaturan',
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                onClick={() => setIsOpen(false)}
            />

            {/* Modal */}
            <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-xl z-50">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-surface-200">
                    {/* Search Input */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-100">
                        <svg className="w-5 h-5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setSelectedIndex(0);
                            }}
                            onKeyDown={handleKeyNavigation}
                            placeholder="Ketik perintah atau cari..."
                            className="flex-1 bg-transparent outline-none text-surface-900 placeholder-surface-400"
                        />
                        <kbd className="hidden sm:inline-flex px-2 py-1 text-xs bg-surface-100 text-surface-500 rounded">
                            ESC
                        </kbd>
                    </div>

                    {/* Results */}
                    <div className="max-h-80 overflow-y-auto p-2">
                        {filteredCommands.length === 0 ? (
                            <div className="py-8 text-center text-surface-400">
                                <p>Tidak ada hasil untuk "{query}"</p>
                            </div>
                        ) : (
                            Object.entries(groupedCommands).map(([category, commands]) => (
                                <div key={category} className="mb-2">
                                    <div className="px-3 py-1 text-xs font-medium text-surface-400 uppercase">
                                        {categoryLabels[category] || category}
                                    </div>
                                    {commands.map((cmd, idx) => {
                                        const globalIdx = filteredCommands.indexOf(cmd);
                                        return (
                                            <button
                                                key={cmd.id}
                                                onClick={() => executeCommand(cmd)}
                                                onMouseEnter={() => setSelectedIndex(globalIdx)}
                                                className={cn(
                                                    'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors',
                                                    globalIdx === selectedIndex
                                                        ? 'bg-primary-50 text-primary-700'
                                                        : 'hover:bg-surface-50 text-surface-700'
                                                )}
                                            >
                                                <span className="text-lg">{cmd.icon}</span>
                                                <div className="flex-1">
                                                    <div className="font-medium">{cmd.title}</div>
                                                    {cmd.subtitle && (
                                                        <div className="text-xs text-surface-400">{cmd.subtitle}</div>
                                                    )}
                                                </div>
                                                {globalIdx === selectedIndex && (
                                                    <kbd className="px-2 py-0.5 text-xs bg-surface-100 text-surface-500 rounded">
                                                        ↵
                                                    </kbd>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-2 border-t border-surface-100 text-xs text-surface-400 flex items-center gap-4">
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-surface-100 rounded">↑↓</kbd> navigasi
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-surface-100 rounded">↵</kbd> pilih
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-surface-100 rounded">esc</kbd> tutup
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
}

/**
 * Hook to open command palette programmatically
 */
export function useCommandPalette() {
    const open = useCallback(() => {
        // Simulate Cmd+K keypress
        const event = new KeyboardEvent('keydown', {
            key: 'k',
            metaKey: true,
            bubbles: true,
        });
        document.dispatchEvent(event);
    }, []);

    return { open };
}

export default CommandPalette;
