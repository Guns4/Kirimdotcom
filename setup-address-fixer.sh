#!/bin/bash

# =============================================================================
# Setup Address Fixer (Phase 112)
# Smart Input with Fuse.js
# =============================================================================

echo "Setting up Smart Address Input..."
echo "================================================="
echo ""

# 0. Install Dependency
echo "0. Installing Fuse.js..."
echo "   > npm install fuse.js"
echo "   (Please run this command manually if the script doesn't)"
# In a real shell script, we might uncomment this, but for this setup we just instruct.

# 1. Fuzzy Logic (Fuse.js Wrapper)
echo "1. Creating Library: src/lib/fuzzy-search.ts"

cat <<EOF > src/lib/fuzzy-search.ts
import Fuse from 'fuse.js';
import { regions } from '@/data/indonesia-regions'; // Ensure this data exists

// Fallback data if regions file is missing or empty
const MOCK_DATA = [
    { name: 'Jakarta Selatan' }, { name: 'Jakarta Barat' }, { name: 'Jakarta Pusat' },
    { name: 'Jakarta Timur' }, { name: 'Jakarta Utara' }, { name: 'Bandung' },
    { name: 'Surabaya' }, { name: 'Semarang' }, { name: 'Medan' },
    { name: 'Makassar' }, { name: 'Denpasar' }, { name: 'Tangerang' },
    { name: 'Tangerang Selatan' }, { name: 'Depok' }, { name: 'Bekasi' },
    { name: 'Bogor' }
];

export function findBestMatch(keyword: string) {
    const data = regions && regions.length > 0 ? regions : MOCK_DATA;
    
    const options = {
        includeScore: true,
        threshold: 0.4, // 0.0 = perfect match, 1.0 = match anything
        keys: ['name']
    };

    const fuse = new Fuse(data, options);
    const result = fuse.search(keyword);

    // Return the top result if score is good (indicating a likely typo fix)
    // but not perfect (score 0 means exact match, we don't need to "fix" it)
    if (result.length > 0) {
        const top = result[0];
        // If score is close to 0 (exact), return null (no fix needed)
        // If score is between 0.1 and 0.4, it's a likely typo
        if (top.score && top.score > 0.01 && top.score < 0.4) {
             return top.item.name;
        }
    }
    
    return null;
}
EOF
echo "   [✓] Fuse.js wrapper created."
echo ""

# 2. Server Action
echo "2. Creating Action: src/app/actions/addressActions.ts"

cat <<EOF > src/app/actions/addressActions.ts
'use server'

import { findBestMatch } from '@/lib/fuzzy-search';

export async function checkAddressTypo(input: string) {
    if (!input || input.length < 3) return null;
    
    // Simulate slight search delay
    // await new Promise(r => setTimeout(r, 100));

    const suggestion = findBestMatch(input);
    return suggestion;
}
EOF
echo "   [✓] Server Action created."
echo ""

# 3. UI Component
echo "3. Creating UI: src/components/ui/AddressInput.tsx"

cat <<EOF > src/components/ui/AddressInput.tsx
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
            const fix = await checkAddressTypo(text);
            setSuggestion(fix);
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
EOF
echo "   [✓] UI Component created."
echo ""

echo "================================================="
echo "Setup Complete!"
echo "1. Run 'npm install fuse.js'"
echo "2. Use <AddressInput /> in your project."
