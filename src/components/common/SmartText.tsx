import { terms } from '@/lib/dictionary';

interface SmartTextProps {
  text: string;
  className?: string;
}

export function SmartText({ text, className = '' }: SmartTextProps) {
  if (!text) return null;

  // Find all terms that appear in the text
  // Sort by length desc so we match "On Process" before "Process"
  const sortedTerms = [...terms].sort((a, b) => b.term.length - a.term.length);

  // Create a regex pattern: all terms joined by OR
  // Escape special regex chars if any
  const pattern = sortedTerms
    .map((t) => t.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  const regex = new RegExp(`(${pattern})`, 'gi');

  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, i) => {
        // Check if this part matches a term (case insensitive)
        const matchedTerm = sortedTerms.find(
          (t) => t.term.toLowerCase() === part.toLowerCase()
        );

        if (matchedTerm) {
          return (
            <a
              key={i}
              href={`/kamus/${matchedTerm.slug}`}
              className="text-indigo-400 hover:text-indigo-300 hover:underline decoration-indigo-400/50 underline-offset-2 transition-colors font-medium relative group"
              title={`Apa arti ${matchedTerm.term}?`}
              onClick={(e) => e.stopPropagation()} // Prevent triggering parent clicks if any
            >
              {part}
            </a>
          );
        }

        return part;
      })}
    </span>
  );
}
