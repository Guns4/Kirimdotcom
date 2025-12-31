// Address normalization using pattern matching and Indonesian address rules
// For production, integrate with OpenAI GPT API for better results

interface NormalizedAddress {
    original: string
    normalized: string
    confidence: number
    corrections: string[]
}

const STREET_ABBR: Record<string, string> = {
    'jl': 'Jalan',
    'jln': 'Jalan',
    'jl.': 'Jalan',
    'gg': 'Gang',
    'gg.': 'Gang',
    'blok': 'Blok',
    'rt': 'RT',
    'rw': 'RW',
    'kel': 'Kelurahan',
    'kel.': 'Kelurahan',
    'kec': 'Kecamatan',
    'kec.': 'Kecamatan',
    'no': 'No.',
    'no.': 'No.'
}

const CITY_CORRECTIONS: Record<string, string> = {
    'jkt': 'Jakarta',
    'bdg': 'Bandung',
    'sby': 'Surabaya',
    'smg': 'Semarang',
    'mlg': 'Malang',
    'dps': 'Denpasar',
    'mdn': 'Medan',
    'plg': 'Palembang',
    'mksr': 'Makassar',
    'btm': 'Batam'
}

export class AddressNormalizer {
    normalize(address: string): NormalizedAddress {
        const corrections: string[] = []
        let normalized = address.trim()

        // 1. Capitalize properly
        normalized = this.capitalize(normalized)
        if (normalized !== address) corrections.push('Capitalization fixed')

        // 2. Expand abbreviations
        const expanded = this.expandAbbreviations(normalized)
        if (expanded !== normalized) {
            normalized = expanded
            corrections.push('Abbreviations expanded')
        }

        // 3. Fix city names
        const cityFixed = this.fixCityNames(normalized)
        if (cityFixed !== normalized) {
            normalized = cityFixed
            corrections.push('City name corrected')
        }

        // 4. Format numbers
        normalized = this.formatNumbers(normalized)

        // 5. Remove extra spaces
        normalized = normalized.replace(/\s+/g, ' ').trim()

        // Calculate confidence
        const confidence = this.calculateConfidence(address, normalized, corrections)

        return {
            original: address,
            normalized,
            confidence,
            corrections
        }
    }

    private capitalize(text: string): string {
        return text
            .toLowerCase()
            .split(' ')
            .map(word => {
                // Don't capitalize Roman numerals or abbreviations
                if (/^(rt|rw|no\.?|gg\.?)$/i.test(word)) {
                    return word.toUpperCase()
                }
                return word.charAt(0).toUpperCase() + word.slice(1)
            })
            .join(' ')
    }

    private expandAbbreviations(text: string): string {
        let result = text

        Object.entries(STREET_ABBR).forEach(([abbr, full]) => {
            const regex = new RegExp(`\\b${abbr}\\b`, 'gi')
            result = result.replace(regex, full)
        })

        return result
    }

    private fixCityNames(text: string): string {
        let result = text

        Object.entries(CITY_CORRECTIONS).forEach(([abbr, full]) => {
            const regex = new RegExp(`\\b${abbr}\\b`, 'gi')
            result = result.replace(regex, full)
        })

        // Add "Kota" or "Kabupaten" if missing for major cities
        const majorCities = ['Jakarta', 'Bandung', 'Surabaya', 'Semarang', 'Medan']
        majorCities.forEach(city => {
            const regex = new RegExp(`\\b${city}\\b(?!\\s+(Kota|Kabupaten|Selatan|Utara|Barat|Timur|Pusat))`, 'gi')
            result = result.replace(regex, `Kota ${city}`)
        })

        return result
    }

    private formatNumbers(text: string): string {
        // Format "No 5" -> "No. 5"
        return text.replace(/\bNo\s+(\d+)/gi, 'No. $1')
    }

    private calculateConfidence(original: string, normalized: string, corrections: string[]): number {
        if (original === normalized) return 1.0

        // Base confidence
        let confidence = 0.7

        // Increase confidence based on corrections made
        if (corrections.length > 0) confidence += 0.1 * Math.min(corrections.length, 3)

        // Decrease if too many changes
        const changeRatio = this.levenshteinDistance(original, normalized) / original.length
        if (changeRatio > 0.5) confidence -= 0.3

        return Math.max(0.3, Math.min(1.0, confidence))
    }

    private levenshteinDistance(str1: string, str2: string): number {
        const matrix: number[][] = []

        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i]
        }

        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j
        }

        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1]
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    )
                }
            }
        }

        return matrix[str2.length][str1.length]
    }
}

export const addressNormalizer = new AddressNormalizer()
