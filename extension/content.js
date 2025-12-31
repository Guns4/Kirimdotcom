// CekKirim Resi Highlighter
// Finds text matching receipt patterns and wraps them in a link.

const PATTERNS = [
    /JP\d{10}/g,   // J&T Pattern Example
    /TKP\d{10}/g,  // Tokopedia Pattern Example
    /00\d{12}/g    // Generic Pattern Example
];

function highlightResi() {
    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );

    let node;
    const nodesToReplace = [];

    while (node = walker.nextNode()) {
        const text = node.nodeValue;
        // Skip script/style tags context
        if (node.parentElement && ['SCRIPT', 'STYLE', 'TEXTAREA', 'A'].includes(node.parentElement.tagName)) continue;

        let hasMatch = false;
        for (let pattern of PATTERNS) {
            if (pattern.test(text)) {
                hasMatch = true;
                break;
            }
        }

        if (hasMatch) {
            nodesToReplace.push(node);
        }
    }

    nodesToReplace.forEach(node => {
        const span = document.createElement('span');
        let html = node.nodeValue;

        PATTERNS.forEach(pattern => {
            html = html.replace(pattern, (match) => {
                return `<a href="https://cekkirim.com/track/${match}" target="_blank" style="background: yellow; color: black; border: 1px solid orange; padding: 0 2px; border-radius: 2px; text-decoration: none;" title="Track with CekKirim">${match}</a>`;
            });
        });

        span.innerHTML = html;
        if (node.parentNode) {
            node.parentNode.replaceChild(span, node);
        }
    });
}

// Run
highlightResi();

// Optional: Observe DOM changes for SPA support
// const observer = new MutationObserver(highlightResi);
// observer.observe(document.body, { childList: true, subtree: true });
