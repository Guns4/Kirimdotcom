'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

/**
 * Smart Address Input
 * Parses pasted address and auto-fills form fields
 */

interface ParsedAddress {
    name?: string;
    phone?: string;
    street?: string;
    rt?: string;
    rw?: string;
    kelurahan?: string;
    kecamatan?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    raw: string;
}

interface SmartAddressInputProps {
    onParsed: (address: ParsedAddress) => void;
    placeholder?: string;
    className?: string;
}

// Indonesian provinces for matching
const PROVINCES = [
    'Aceh', 'Sumatera Utara', 'Sumatera Barat', 'Riau', 'Kepulauan Riau',
    'Jambi', 'Bengkulu', 'Sumatera Selatan', 'Kepulauan Bangka Belitung',
    'Lampung', 'Banten', 'DKI Jakarta', 'Jawa Barat', 'Jawa Tengah',
    'DI Yogyakarta', 'Jawa Timur', 'Bali', 'Nusa Tenggara Barat',
    'Nusa Tenggara Timur', 'Kalimantan Barat', 'Kalimantan Tengah',
    'Kalimantan Selatan', 'Kalimantan Timur', 'Kalimantan Utara',
    'Sulawesi Utara', 'Gorontalo', 'Sulawesi Tengah', 'Sulawesi Barat',
    'Sulawesi Selatan', 'Sulawesi Tenggara', 'Maluku', 'Maluku Utara',
    'Papua', 'Papua Barat', 'Papua Selatan', 'Papua Tengah', 'Papua Pegunungan',
];

// Common city prefixes
const CITY_PREFIXES = ['Kota', 'Kabupaten', 'Kab.', 'Kab'];

/**
 * Parse Indonesian address
 */
export function parseAddress(text: string): ParsedAddress {
    const result: ParsedAddress = { raw: text };
    const lines = text.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
    const fullText = text.toLowerCase();

    // Extract phone number
    const phoneMatch = text.match(/(\+62|62|0)[0-9\s-]{9,14}/);
    if (phoneMatch) {
        result.phone = phoneMatch[0].replace(/[\s-]/g, '');
    }

    // Extract postal code (5 digits)
    const postalMatch = text.match(/\b(\d{5})\b/);
    if (postalMatch) {
        result.postalCode = postalMatch[1];
    }

    // Extract RT/RW
    const rtMatch = text.match(/RT\s*[.:\/]?\s*(\d{1,3})/i);
    const rwMatch = text.match(/RW\s*[.:\/]?\s*(\d{1,3})/i);
    if (rtMatch) result.rt = rtMatch[1].padStart(3, '0');
    if (rwMatch) result.rw = rwMatch[1].padStart(3, '0');

    // Extract Province
    for (const prov of PROVINCES) {
        if (fullText.includes(prov.toLowerCase())) {
            result.province = prov;
            break;
        }
    }

    // Extract Kecamatan
    const kecMatch = text.match(/(?:Kec(?:amatan)?\.?\s*)([A-Za-z\s]+?)(?:,|\n|Kel|Kota|Kab|$)/i);
    if (kecMatch) {
        result.kecamatan = kecMatch[1].trim();
    }

    // Extract Kelurahan/Desa
    const kelMatch = text.match(/(?:Kel(?:urahan)?\.?\s*|Desa\s*)([A-Za-z\s]+?)(?:,|\n|Kec|RT|$)/i);
    if (kelMatch) {
        result.kelurahan = kelMatch[1].trim();
    }

    // Extract City
    for (const prefix of CITY_PREFIXES) {
        const cityRegex = new RegExp(`${prefix}\\.?\\s*([A-Za-z\\s]+?)(?:,|\\n|Prov|${PROVINCES.join('|')}|$)`, 'i');
        const cityMatch = text.match(cityRegex);
        if (cityMatch) {
            result.city = cityMatch[1].trim();
            break;
        }
    }

    // If no city found, look for common city names
    if (!result.city) {
        const commonCities = ['Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang', 'Makassar', 'Palembang', 'Tangerang', 'Depok', 'Bekasi', 'Bogor'];
        for (const city of commonCities) {
            if (fullText.includes(city.toLowerCase())) {
                result.city = city;
                break;
            }
        }
    }

    // Extract name (usually first line without numbers)
    if (lines[0] && !/\d/.test(lines[0]) && lines[0].length < 50) {
        const firstLine = lines[0];
        // Check if it's not an address component
        const isAddress = /jl\.|jalan|gg\.|gang|blok|no\.|rt|rw/i.test(firstLine);
        if (!isAddress) {
            result.name = firstLine;
        }
    }

    // Extract street (Jl., Jalan, Gg., Gang, etc.)
    const streetMatch = text.match(/(?:Jl\.?|Jalan|Gg\.?|Gang|Komp\.?|Komplek|Blok)\s*[A-Za-z0-9\s.-]+/i);
    if (streetMatch) {
        result.street = streetMatch[0].trim();
    }

    return result;
}

export function SmartAddressInput({
    onParsed,
    placeholder = 'Paste alamat lengkap di sini...\n\nContoh:\nBudi Santoso\n081234567890\nJl. Merdeka No. 123, RT 01/RW 02\nKel. Sukamaju, Kec. Cilandak\nJakarta Selatan 12345',
    className,
}: SmartAddressInputProps) {
    const [text, setText] = useState('');
    const [parsed, setParsed] = useState<ParsedAddress | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleParse = useCallback(() => {
        if (!text.trim()) return;

        setIsProcessing(true);

        // Simulate processing delay for UX
        setTimeout(() => {
            const result = parseAddress(text);
            setParsed(result);
            onParsed(result);
            setIsProcessing(false);
        }, 300);
    }, [text, onParsed]);

    const handlePaste = useCallback((e: React.ClipboardEvent) => {
        const pastedText = e.clipboardData.getData('text');
        setText(pastedText);

        // Auto-parse after paste
        setTimeout(() => {
            const result = parseAddress(pastedText);
            setParsed(result);
            onParsed(result);
        }, 100);
    }, [onParsed]);

    return (
        <div className={cn('space-y-4', className)}>
            {/* Magic Textarea */}
            <div className="relative">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onPaste={handlePaste}
                    placeholder={placeholder}
                    className="w-full h-40 p-4 border-2 border-dashed border-primary-300 rounded-xl 
                     bg-primary-50/50 focus:border-primary-500 focus:bg-white
                     resize-none transition-colors outline-none"
                />

                {/* Magic wand indicator */}
                <div className="absolute top-3 right-3 text-2xl">✨</div>

                {isProcessing && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl">
                        <div className="flex items-center gap-2 text-primary-600">
                            <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                            Menganalisis alamat...
                        </div>
                    </div>
                )}
            </div>

            {/* Parse Button */}
            <button
                onClick={handleParse}
                disabled={!text.trim() || isProcessing}
                className="w-full py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-surface-300
                   text-white font-semibold rounded-xl transition-colors"
            >
                🪄 Parse Alamat Otomatis
            </button>

            {/* Parsed Result Preview */}
            {parsed && (
                <div className="p-4 bg-surface-50 rounded-xl border border-surface-200">
                    <h4 className="font-semibold text-surface-700 mb-3 flex items-center gap-2">
                        <span>📍</span> Hasil Deteksi
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        {parsed.name && (
                            <ParsedField label="Nama" value={parsed.name} icon="👤" />
                        )}
                        {parsed.phone && (
                            <ParsedField label="Telepon" value={parsed.phone} icon="📱" />
                        )}
                        {parsed.street && (
                            <ParsedField label="Alamat Jalan" value={parsed.street} icon="🏠" className="col-span-2" />
                        )}
                        {(parsed.rt || parsed.rw) && (
                            <ParsedField label="RT/RW" value={`${parsed.rt || '-'}/${parsed.rw || '-'}`} icon="📍" />
                        )}
                        {parsed.kelurahan && (
                            <ParsedField label="Kelurahan" value={parsed.kelurahan} icon="🏘️" />
                        )}
                        {parsed.kecamatan && (
                            <ParsedField label="Kecamatan" value={parsed.kecamatan} icon="🗺️" />
                        )}
                        {parsed.city && (
                            <ParsedField label="Kota/Kabupaten" value={parsed.city} icon="🏙️" />
                        )}
                        {parsed.province && (
                            <ParsedField label="Provinsi" value={parsed.province} icon="🌏" />
                        )}
                        {parsed.postalCode && (
                            <ParsedField label="Kode Pos" value={parsed.postalCode} icon="📮" />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function ParsedField({
    label,
    value,
    icon,
    className
}: {
    label: string;
    value: string;
    icon: string;
    className?: string;
}) {
    return (
        <div className={cn('flex items-start gap-2', className)}>
            <span className="text-lg">{icon}</span>
            <div>
                <div className="text-xs text-surface-500">{label}</div>
                <div className="font-medium text-surface-800">{value}</div>
            </div>
        </div>
    );
}

export default SmartAddressInput;
