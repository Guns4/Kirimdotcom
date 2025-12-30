'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Search, Loader2, X } from 'lucide-react';
import {
  searchRegions,
  getRegionLabel,
  type Region,
} from '@/data/indonesia-regions';

interface RegionSelectProps {
  value: Region | null;
  onChange: (region: Region | null) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function RegionSelect({
  value,
  onChange,
  placeholder = 'Ketik nama kecamatan atau kota...',
  label,
  disabled = false,
  className = '',
}: RegionSelectProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Region[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced search
  const handleSearch = useCallback((searchQuery: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (searchQuery.length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    debounceRef.current = setTimeout(() => {
      // Search from static data (fast)
      const searchResults = searchRegions(searchQuery, 15);
      setResults(searchResults);
      setHighlightedIndex(0);
      setIsLoading(false);
    }, 150); // Small debounce for responsiveness
  }, []);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setIsOpen(true);
    handleSearch(newQuery);
  };

  // Handle selection
  const handleSelect = (region: Region) => {
    onChange(region);
    setQuery('');
    setIsOpen(false);
    setResults([]);
  };

  // Handle clear
  const handleClear = () => {
    onChange(null);
    setQuery('');
    setResults([]);
    inputRef.current?.focus();
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : results.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (results[highlightedIndex]) {
          handleSelect(results[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
      )}

      {/* Selected Value Display */}
      {value ? (
        <div className="flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-xl text-white">
          <MapPin className="w-5 h-5 text-indigo-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{value.district}</p>
            <p className="text-xs text-gray-400 truncate">
              {value.cityType} {value.city}, {value.province}
            </p>
          </div>
          {!disabled && (
            <button
              onClick={handleClear}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              type="button"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      ) : (
        /* Search Input */
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => query.length >= 2 && setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 text-sm"
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400 animate-spin" />
          )}
        </div>
      )}

      {/* Dropdown Results */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-slate-800 border border-white/10 rounded-xl shadow-xl max-h-64 overflow-y-auto">
          {results.map((region, index) => (
            <button
              key={region.id}
              onClick={() => handleSelect(region)}
              className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors ${
                index === highlightedIndex
                  ? 'bg-indigo-600/20 text-indigo-300'
                  : 'hover:bg-white/5 text-white'
              }`}
              type="button"
            >
              <MapPin
                className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                  index === highlightedIndex
                    ? 'text-indigo-400'
                    : 'text-gray-500'
                }`}
              />
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">
                  {region.district}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {region.cityType} {region.city}, {region.province}
                </p>
                {region.postalCode && (
                  <p className="text-xs text-gray-500">{region.postalCode}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {isOpen && query.length >= 2 && !isLoading && results.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-slate-800 border border-white/10 rounded-xl shadow-xl p-4 text-center">
          <p className="text-gray-400 text-sm">Tidak menemukan "{query}"</p>
          <p className="text-gray-500 text-xs mt-1">Coba kata kunci lain</p>
        </div>
      )}

      {/* Hint */}
      {!value && !isOpen && (
        <p className="mt-1 text-xs text-gray-500">
          Contoh: Menteng, Coblong, Gubeng
        </p>
      )}
    </div>
  );
}
