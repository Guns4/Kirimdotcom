'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export interface SearchHistoryItem {
  resi: string;
  courier: string;
  last_status: string;
  timestamp: number;
}

const HISTORY_KEY = 'cek_kirim_history';
const MAX_ITEMS = 20;

export function useSearchHistory() {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadHistory();
  }, []);

  const loadHistory = () => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load history', e);
    }
  };

  const saveToHistory = async (item: Omit<SearchHistoryItem, 'timestamp'>) => {
    try {
      const newItem = { ...item, timestamp: Date.now() };

      // Remove duplicates (same resi and courier)
      const filtered = history.filter(
        (h) => !(h.resi === item.resi && h.courier === item.courier)
      );

      // Add new item to front, limit to MAX_ITEMS
      const newHistory = [newItem, ...filtered].slice(0, MAX_ITEMS);

      setHistory(newHistory);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));

      // Optional: Sync to Supabase if logged in
      // We can do this silently
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        // Sync logic to Supabase 'search_history' table
        // Format: query = "RESI (COURIER)"
        await supabase.from('search_history').insert({
          user_id: session.user.id,
          type: 'resi',
          query: `${item.resi} (${item.courier.toUpperCase()})`,
        });
      }
    } catch (e) {
      console.error('Failed to save history', e);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  };

  const removeItem = (resi: string) => {
    const newHistory = history.filter((h) => h.resi !== resi);
    setHistory(newHistory);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
  };

  return {
    history,
    saveToHistory,
    clearHistory,
    removeItem,
    mounted,
  };
}
