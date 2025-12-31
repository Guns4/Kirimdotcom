// CekKirim Price Compare
// Detected competitor products and offers cheaper rates.

const COMPETITOR_DOMAINS = [
    'tokopedia.com',
    'shopee.co.id',
    'bukalapak.com'
];

function checkAndInject() {
    const hostname = window.location.hostname;
    const isCompetitor = COMPETITOR_DOMAINS.some(d => hostname.includes(d));

    if (isCompetitor) {
        // Mock Product Detection Logic
        // In reality: Scrape product title from DOM
        const productTitle = document.title;
        console.log('[CekKirim] Competitor Detected on:', productTitle);

        // Inject Notification Bar
        const bar = document.createElement('div');
        bar.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0;
            background: linear-gradient(90deg, #f59e0b, #d97706);
            color: white; padding: 10px; text-align: center;
            z-index: 999999; font-family: sans-serif;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;
        bar.innerHTML = `
            <strong>⚡ CekKirim Alert:</strong> 
            Hemat ongkir hingga Rp 50.000 untuk barang serupa di platform kami! 
            <a href="https://cekkirim.com/search?q=${encodeURIComponent(productTitle)}" 
               style="color: white; text-decoration: underline; font-weight: bold; margin-left: 10px;">
               Cek Sekarang
            </a>
            <span style="float: right; cursor: pointer;" onclick="this.parentElement.remove()">✖</span>
        `;

        document.body.prepend(bar);
    }
}

// Run logic
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAndInject);
} else {
    checkAndInject();
}
