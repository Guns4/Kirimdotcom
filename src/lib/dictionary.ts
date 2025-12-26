import dictionary from '@/data/dictionary.json'

export interface DictionaryTerm {
    term: string
    slug: string
    definition: string
    courier: string
    related_terms: string[]
    solution: string
}

export const terms: DictionaryTerm[] = dictionary

export function getTermBySlug(slug: string) {
    return terms.find(t => t.slug === slug)
}

// Function to find terms in a text and replace them with links
// Simple implementation: Replace first occurrence of known terms
export function linkifyLogisticsTerms(text: string): string {
    let result = text

    // Sort terms by length desc to avoid replacing substrings (e.g. "On Process" vs "Process")
    const sortedTerms = [...terms].sort((a, b) => b.term.length - a.term.length)

    sortedTerms.forEach(item => {
        const regex = new RegExp(`\\b(${item.term})\\b`, 'gi')
        // We actually want to return JSX usually, but for string manipulation let's use a specialized component or dangerousHTML.
        // Better strategy: Return the string and let a Component handle the parsing? 
        // Or simple regex replace for now if we use dangerouslySetInnerHTML or a parser.

        // Since we want to use Next.js Links, string replacement is tricky without a parser like 'html-react-parser' or custom splitter.
        // Let's keep this function returning string with <a href> for simplicity if we trust content, 
        // OR better: Create a React Component "SmartText" that renders children.
    })

    return result
}
