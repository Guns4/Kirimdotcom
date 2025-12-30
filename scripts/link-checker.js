const fs = require('fs');
const path = require('path');
const { parse } = require('url');

// Configuration
const BASE_URL = process.argv[2] || 'http://localhost:3000'; // Default to localhost
const MAX_DEPTH = 3;
const REPORT_FILE = 'BROKEN_LINKS_REPORT.txt';

const visited = new Set();
const brokenLinks = [];

console.log(`🔗 Starting SEO Link Checker`);
console.log(`TARGET: ${BASE_URL}`);
console.log(`-----------------------------------`);

async function crawl(url, depth = 0) {
    if (depth > MAX_DEPTH) return;
    if (visited.has(url)) return;

    visited.add(url);

    try {
        const res = await fetch(url);
        const status = res.status;

        process.stdout.write(`Checking: ${url} [${status}]\r`);

        if (status === 404) {
            console.log(`\n❌ BROKEN LINK: ${url} (404)`);
            brokenLinks.push(url);
            return;
        }

        if (status >= 400) {
            console.log(`\n⚠️ STATUS ${status}: ${url}`);
            return; // Don't crawl error pages further
        }

        if (depth === MAX_DEPTH) return;

        // Parse content for links only if it's internal and HTML
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
            const text = await res.text();
            // Regex to find hrefs (Simple version)
            const hrefRegex = /href=["']([^"']+)["']/g;
            let match;

            while ((match = hrefRegex.exec(text)) !== null) {
                let nextUrl = match[1];

                // Normalize URL
                if (nextUrl.startsWith('/')) {
                    nextUrl = `${BASE_URL}${nextUrl}`;
                }

                // Only follow internal links
                if (nextUrl.startsWith(BASE_URL)) {
                    // Remove hash
                    nextUrl = nextUrl.split('#')[0];
                    await crawl(nextUrl, depth + 1);
                }
            }
        }

    } catch (err) {
        console.log(`\n❌ ERROR: ${url} - ${err.message}`);
        // brokenLinks.push(`${url} (${err.message})`);
    }
}

// Start Crawl
(async () => {
    try {
        // Simple check if server is up
        await fetch(BASE_URL);
    } catch (e) {
        console.error(`\n\n⛔ Could not connect to ${BASE_URL}.`);
        console.error(`Make sure your local server is running: "npm run dev"`);
        process.exit(1);
    }

    await crawl(BASE_URL);

    console.log(`\n\n-----------------------------------`);
    console.log(`✅ Crawl Complete.`);
    console.log(`Visited: ${visited.size} pages`);
    console.log(`Broken Links: ${brokenLinks.length}`);

    if (brokenLinks.length > 0) {
        fs.writeFileSync(REPORT_FILE, brokenLinks.join('\n'));
        console.log(`📄 Report saved to ${REPORT_FILE}`);
    } else {
        console.log(`🎉 No broken links found!`);
        if (fs.existsSync(REPORT_FILE)) fs.unlinkSync(REPORT_FILE);
    }
})();
