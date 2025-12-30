export class RedirectHinter {
    /**
     * Suggest a redirect target for a 404 path based on similarity
     * @param brokenPath The path that returned 404 (e.g. /products/ipone-12)
     * @param validPaths List of known valid paths (e.g. from sitemap or DB)
     */
    static suggest(brokenPath: string, validPaths: string[]): string | null {
        // 1. Normalize
        const cleanBroken = brokenPath.toLowerCase().replace(/\/$/, '');

        // 2. Direct Match (Case insensitive)
        const directMatch = validPaths.find(p => p.toLowerCase() === cleanBroken);
        if (directMatch) return directMatch;

        // 3. Typo Fix (Simple Fuzzy Logic - Levenshtein could be overkill, using includes/substrings)
        // e.g. /product/iphone12 -> /products/iphone-12

        // Check keywords
        const keywords = cleanBroken.split(/[-/_]/).filter(k => k.length > 3);

        let bestMatch = null;
        let maxScore = 0;

        for (const valid of validPaths) {
            let score = 0;
            const validLower = valid.toLowerCase();

            for (const keyword of keywords) {
                if (validLower.includes(keyword)) score++;
            }

            if (score > maxScore && score >= 2) { // Threshold
                maxScore = score;
                bestMatch = valid;
            }
        }

        return bestMatch;
    }
}
