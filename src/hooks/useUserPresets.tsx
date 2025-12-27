'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * User Preferences Store
 * Local storage for user presets and history
 */

const STORAGE_KEYS = {
    RECENT_SEARCHES: 'ck_recent_searches',
    SAVED_ADDRESSES: 'ck_saved_addresses',
    USER_PREFERENCES: 'ck_user_preferences',
    TRACKING_HISTORY: 'ck_tracking_history',
};

// ============================================
// Types
// ============================================

interface RecentSearch {
    awb: string;
    courier?: string;
    timestamp: number;
}

interface SavedAddress {
    id: string;
    label: string; // "Rumah", "Kantor", etc.
    name: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    postalCode?: string;
    usageCount: number;
    lastUsed: number;
}

interface UserPreferences {
    defaultCourier?: string;
    defaultOriginCity?: string;
    theme?: 'light' | 'dark' | 'system';
    language?: string;
}

// ============================================
// Storage Helpers
// ============================================

function getFromStorage<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch {
        return defaultValue;
    }
}

function setToStorage<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error('Storage error:', e);
    }
}

// ============================================
// Recent Searches Hook
// ============================================

export function useRecentSearches(maxItems = 5) {
    const [searches, setSearches] = useState<RecentSearch[]>([]);

    useEffect(() => {
        setSearches(getFromStorage(STORAGE_KEYS.RECENT_SEARCHES, []));
    }, []);

    const addSearch = useCallback((awb: string, courier?: string) => {
        setSearches((prev) => {
            // Remove duplicate
            const filtered = prev.filter((s) => s.awb !== awb);
            // Add new at beginning
            const updated = [{ awb, courier, timestamp: Date.now() }, ...filtered].slice(0, maxItems);
            setToStorage(STORAGE_KEYS.RECENT_SEARCHES, updated);
            return updated;
        });
    }, [maxItems]);

    const clearSearches = useCallback(() => {
        setSearches([]);
        localStorage.removeItem(STORAGE_KEYS.RECENT_SEARCHES);
    }, []);

    const removeSearch = useCallback((awb: string) => {
        setSearches((prev) => {
            const updated = prev.filter((s) => s.awb !== awb);
            setToStorage(STORAGE_KEYS.RECENT_SEARCHES, updated);
            return updated;
        });
    }, []);

    return { searches, addSearch, clearSearches, removeSearch };
}

// ============================================
// Saved Addresses Hook
// ============================================

export function useSavedAddresses() {
    const [addresses, setAddresses] = useState<SavedAddress[]>([]);

    useEffect(() => {
        setAddresses(getFromStorage(STORAGE_KEYS.SAVED_ADDRESSES, []));
    }, []);

    const saveAddress = useCallback((address: Omit<SavedAddress, 'id' | 'usageCount' | 'lastUsed'>) => {
        setAddresses((prev) => {
            const newAddress: SavedAddress = {
                ...address,
                id: Date.now().toString(),
                usageCount: 0,
                lastUsed: Date.now(),
            };
            const updated = [...prev, newAddress];
            setToStorage(STORAGE_KEYS.SAVED_ADDRESSES, updated);
            return updated;
        });
    }, []);

    const updateAddress = useCallback((id: string, updates: Partial<SavedAddress>) => {
        setAddresses((prev) => {
            const updated = prev.map((a) => (a.id === id ? { ...a, ...updates } : a));
            setToStorage(STORAGE_KEYS.SAVED_ADDRESSES, updated);
            return updated;
        });
    }, []);

    const deleteAddress = useCallback((id: string) => {
        setAddresses((prev) => {
            const updated = prev.filter((a) => a.id !== id);
            setToStorage(STORAGE_KEYS.SAVED_ADDRESSES, updated);
            return updated;
        });
    }, []);

    const useAddress = useCallback((id: string) => {
        setAddresses((prev) => {
            const updated = prev.map((a) =>
                a.id === id
                    ? { ...a, usageCount: a.usageCount + 1, lastUsed: Date.now() }
                    : a
            );
            setToStorage(STORAGE_KEYS.SAVED_ADDRESSES, updated);
            return updated;
        });
    }, []);

    // Sort by usage count (most used first)
    const frequentAddresses = [...addresses].sort((a, b) => b.usageCount - a.usageCount);

    // Sort by last used
    const recentAddresses = [...addresses].sort((a, b) => b.lastUsed - a.lastUsed);

    return {
        addresses,
        frequentAddresses,
        recentAddresses,
        saveAddress,
        updateAddress,
        deleteAddress,
        useAddress,
    };
}

// ============================================
// User Preferences Hook
// ============================================

export function useUserPreferences() {
    const [preferences, setPreferences] = useState<UserPreferences>({});

    useEffect(() => {
        setPreferences(getFromStorage(STORAGE_KEYS.USER_PREFERENCES, {}));
    }, []);

    const updatePreference = useCallback(<K extends keyof UserPreferences>(
        key: K,
        value: UserPreferences[K]
    ) => {
        setPreferences((prev) => {
            const updated = { ...prev, [key]: value };
            setToStorage(STORAGE_KEYS.USER_PREFERENCES, updated);
            return updated;
        });
    }, []);

    const setDefaultCourier = useCallback((courier: string) => {
        updatePreference('defaultCourier', courier);
    }, [updatePreference]);

    const setDefaultOriginCity = useCallback((city: string) => {
        updatePreference('defaultOriginCity', city);
    }, [updatePreference]);

    return {
        preferences,
        updatePreference,
        setDefaultCourier,
        setDefaultOriginCity,
        defaultCourier: preferences.defaultCourier,
        defaultOriginCity: preferences.defaultOriginCity,
    };
}

// ============================================
// Tracking History Hook
// ============================================

interface TrackingHistoryItem {
    awb: string;
    courier: string;
    status: string;
    lastChecked: number;
    recipientName?: string;
}

export function useTrackingHistory(maxItems = 20) {
    const [history, setHistory] = useState<TrackingHistoryItem[]>([]);

    useEffect(() => {
        setHistory(getFromStorage(STORAGE_KEYS.TRACKING_HISTORY, []));
    }, []);

    const addToHistory = useCallback((item: Omit<TrackingHistoryItem, 'lastChecked'>) => {
        setHistory((prev) => {
            // Remove existing entry for same AWB
            const filtered = prev.filter((h) => h.awb !== item.awb);
            // Add new at beginning
            const updated = [{ ...item, lastChecked: Date.now() }, ...filtered].slice(0, maxItems);
            setToStorage(STORAGE_KEYS.TRACKING_HISTORY, updated);
            return updated;
        });
    }, [maxItems]);

    const clearHistory = useCallback(() => {
        setHistory([]);
        localStorage.removeItem(STORAGE_KEYS.TRACKING_HISTORY);
    }, []);

    return { history, addToHistory, clearHistory };
}

// ============================================
// Recent Searches Component
// ============================================

interface RecentSearchesProps {
    onSelect: (awb: string, courier?: string) => void;
    className?: string;
}

export function RecentSearches({ onSelect, className }: RecentSearchesProps) {
    const { searches, removeSearch, clearSearches } = useRecentSearches();

    if (searches.length === 0) return null;

    return (
        <div className={className}>
            <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-surface-600">🕐 Resi Terakhir</h4>
                <button
                    onClick={clearSearches}
                    className="text-xs text-surface-400 hover:text-surface-600"
                >
                    Hapus Semua
                </button>
            </div>
            <div className="flex flex-wrap gap-2">
                {searches.map((search) => (
                    <button
                        key={search.awb}
                        onClick={() => onSelect(search.awb, search.courier)}
                        className="group flex items-center gap-2 px-3 py-1.5 bg-surface-100 hover:bg-primary-50 
                       rounded-full text-sm transition-colors"
                    >
                        <span className="text-surface-700">{search.awb}</span>
                        {search.courier && (
                            <span className="text-xs text-surface-400">{search.courier}</span>
                        )}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                removeSearch(search.awb);
                            }}
                            className="opacity-0 group-hover:opacity-100 text-surface-400 hover:text-error-500"
                        >
                            ×
                        </button>
                    </button>
                ))}
            </div>
        </div>
    );
}

// ============================================
// Saved Addresses Component
// ============================================

interface SavedAddressesDropdownProps {
    onSelect: (address: SavedAddress) => void;
    className?: string;
}

export function SavedAddressesDropdown({ onSelect, className }: SavedAddressesDropdownProps) {
    const { frequentAddresses, useAddress } = useSavedAddresses();

    if (frequentAddresses.length === 0) return null;

    const handleSelect = (address: SavedAddress) => {
        useAddress(address.id);
        onSelect(address);
    };

    return (
        <div className={className}>
            <h4 className="text-sm font-medium text-surface-600 mb-2">📍 Alamat Tersimpan</h4>
            <div className="space-y-2">
                {frequentAddresses.slice(0, 3).map((address) => (
                    <button
                        key={address.id}
                        onClick={() => handleSelect(address)}
                        className="w-full text-left p-3 bg-surface-50 hover:bg-primary-50 rounded-xl transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-lg">
                                {address.label === 'Rumah' ? '🏠' : address.label === 'Kantor' ? '🏢' : '📍'}
                            </span>
                            <div>
                                <div className="font-medium text-surface-800">{address.label}</div>
                                <div className="text-sm text-surface-500 truncate">{address.name} • {address.city}</div>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}

export default {
    useRecentSearches,
    useSavedAddresses,
    useUserPreferences,
    useTrackingHistory,
    RecentSearches,
    SavedAddressesDropdown,
};
