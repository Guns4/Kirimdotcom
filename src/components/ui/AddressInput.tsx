'use client';

import { useState, useRef } from 'react';
import { checkAddressTypo } from '@/app/actions/addressActions';
import { MapPin, Search, Sparkles, X } from 'lucide-react';

interface Props {
    label?: string;
    placeholder?: string;
    onSelect?: (val: string) => void;
}

export default function AddressInput({ label = "Kota / Kecamatan", placeholder = "Cari lokasi...", onSelect }: Props) {
    const [value, setValue] = useState('');
    const [suggestion, setSuggestion] = useState<string | null>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    const checkTypo = async (text: string) => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(async () => {
            if (text.length >= 3) {
                const fix = await checkAddressTypo(text);
                setSuggestion(fix);
            } else {
                setSuggestion(null);
            }
        }, 800); // Check after user stops typing
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const txt = e.target.value;
        setValue(txt);
        setSuggestion(null); // Clear previous suggestion
        checkTypo(txt);
    };

    const applyFix = () => {
        if (suggestion) {
            setValue(suggestion);
            setSuggestion(null);
            if (onSelect) onSelect(suggestion);
        }
    };

    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <div className="relative">
                <input
                    type="text"
                    value={value}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="w-full border border-gray-300 rounded-lg py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                />
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            </div>

            {/* Smart Suggestion */}
            {suggestion && (
                <div className="mt-2 bg-indigo-50 border border-indigo-100 rounded-lg p-3 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2 text-sm text-indigo-800">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        <span>
                            Maksud Anda <strong>{suggestion}</strong>?
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={applyFix}
                            className="bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-md font-medium hover:bg-indigo-700 transition"
                        >
                            Ya, Ganti
                        </button>
                        <button
                            onClick={() => setSuggestion(null)}
                            className="p-1 hover:bg-indigo-100 rounded-full text-indigo-400"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
