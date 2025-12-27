/**
 * Extracts potential tracking numbers from a dirty text string.
 * Filters out common noise like phone numbers, prices, or short words.
 */
export function extractTrackingNumbers(text: string): string[] {
    if (!text) return []

    // 1. Regex for alphanumeric strings between 9 and 25 characters
    // This covers most couriers (JNE: 10-15 digits, J&T: 10-12, SiCepat: 10-12, Shopee: varies)
    const potentialMatches = text.match(/\b[A-Za-z0-9]{9,25}\b/g) || []

    const validResi: string[] = []

    for (const match of potentialMatches) {
        // 2. Filter Logic

        // Exclude phone numbers (indonesia usually starts with 08 and is 10-13 digits)
        if (match.startsWith('08') && !isNaN(Number(match)) && match.length >= 10 && match.length <= 14) {
            continue
        }

        // Exclude common noise words (case insensitive check)
        const lower = match.toLowerCase()
        if (['transfer', 'pembayaran', 'rekening', 'terimakasih', 'thankyou', 'shopee', 'tokopedia'].includes(lower)) {
            continue
        }

        // Exclude purely alphabetic words (courier names often get caught like "SICEPAT")
        // But actual resis usually have numbers. 
        // EXCEPTION: Some old JNE resis are letters only? No, usually mixed or digits.
        // Let's filter out if it's ONLY letters.
        if (/^[a-zA-Z]+$/.test(match)) {
            continue
        }

        // Exclude if it looks like a price (e.g. 150000) - hard to distinguish from resi sometimes
        // But usually prices in chat don't "stand alone" as 12 digits without Rp.

        // Add to list
        validResi.push(match)
    }

    // 3. Deduplicate
    return Array.from(new Set(validResi))
}
