// CekKirim Resi Highlighter
// Scans page for logistics tracking numbers and links them to tracking page

const PATTERNS = [
    // General numeric heavy (JNE, POS, TIKI - usually 10-16 digits)
    /\b\d{12,16}\b/g,
    // J&T (starts with JP, JX, etc + digits)
    /\b(JP|JX|JS|JD)\d{10}\b/g,
    // SiCepat (000... or 001...)
    /\b00[0-2]\d{9,12}\b/g,
    // ID Express
    /\b(ID|IDE)\d+\b/g,
    // Ninja
    /\b(NINJA|NLID)\w+\b/g,
    // Anteraja
    /\b100\d{10,12}\b/g
];

function highlightText(node) {
    if (node.nodeType === 3) { // Text Node
        const text = node.nodeValue;
        if (!text.trim()) return;

        let matchFound = false;
        PATTERNS.forEach(regex => {
            if (regex.test(text)) matchFound = true;
        });

        if (matchFound) {
            const span = document.createElement('span');
            let newHtml = text;

            PATTERNS.forEach(regex => {
                newHtml = newHtml.replace(regex, (match) => {
                    return `<a href="https://cekkirim.com/tracking?resi=${match}" target="_blank" style="background-color: #e0f2fe; color: #0284c7; border: 1px border #0284c7; padding: 0 4px; border-radius: 4px; font-weight: bold; text-decoration: none; font-family: monospace;">✈️ ${match}</a>`;
                });
            });

            span.innerHTML = newHtml;
            if (node.parentNode) {
                node.parentNode.replaceChild(span, node);
            }
        }
    } else if (node.nodeType === 1 && node.childNodes && !['SCRIPT', 'STYLE', 'A', 'TEXTAREA', 'INPUT'].includes(node.tagName)) {
        // Recurse, but skip existing links and form inputs
        node.childNodes.forEach(highlightText);
    }
}

// Run after delay to allow dynamic content
setTimeout(() => {
    highlightText(document.body);
}, 1500);
