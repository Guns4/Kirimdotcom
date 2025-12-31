const puppeteer = require('puppeteer');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Configuration
const OUTPUT_DIR = 'store-assets';
const BASE_URL = 'http://localhost:3000';
const VIEWPORT = { width: 1080, height: 2340 }; // Pixel 5-ish
const ASSETS = [
    {
        name: '01_home',
        path: '/',
        title: 'Cek Resi Otomatis',
        subtitle: 'Semua ekspedisi dalam satu aplikasi',
        color: '#3B82F6' // Blue
    },
    {
        name: '02_tracking',
        path: '/dashboard', // Simulating tracking view
        title: 'Lacak Real-Time',
        subtitle: 'Notifikasi update status otomatis',
        color: '#10B981' // Green
    },
    {
        name: '03_wallet',
        path: '/dashboard', // Simulating wallet
        title: 'Cairkan COD Cepat',
        subtitle: 'Tarik dana kapan saja tanpa ribet',
        color: '#F59E0B' // Amber
    }
];

async function ensureDir(dir) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
}

async function captureScreenshots() {
    console.log('>>> Launching Browser...');
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setViewport(VIEWPORT);

    ensureDir(OUTPUT_DIR);

    for (const asset of ASSETS) {
        console.log(`>>> Capturing: ${asset.name} (${asset.path})...`);
        try {
            await page.goto(`${BASE_URL}${asset.path}`, { waitUntil: 'networkidle0' });

            // Optional: Inject some CSS to hide scrollbars or debug UI
            await page.addStyleTag({ content: 'body { overflow: hidden !important; }' });

            const screenshotPath = path.join(OUTPUT_DIR, `raw_${asset.name}.png`);
            await page.screenshot({ path: screenshotPath });

            // Process with Sharp (Add Frame & Text)
            await processImage(screenshotPath, asset);

        } catch (e) {
            console.error(`ERROR processing ${asset.name}:`, e.message);
            console.log('Make sure your Next.js app is running on port 3000!');
        }
    }

    await browser.close();
}

async function processImage(rawPath, asset) {
    console.log(`>>> Processing: ${asset.name}...`);

    const width = 1242;
    const height = 2688; // iPhone Xs Max standard for Play Store
    const frameMargin = 100;

    // Create Background
    const bg = sharp({
        create: {
            width: width,
            height: height,
            channels: 4,
            background: asset.color
        }
    });

    // Load Screenshot (Resize to fit "phone frame" area)
    const screenshot = await sharp(rawPath)
        .resize(1000, 2000, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toBuffer();

    // Create Text Overlay (SVG)
    const svgText = `
    <svg width="${width}" height="${height}">
        <style>
            .title { fill: white; font-size: 80px; font-weight: bold; font-family: sans-serif; }
            .subtitle { fill: white; font-size: 40px; font-family: sans-serif; opacity: 0.9; }
        </style>
        <text x="50%" y="200" text-anchor="middle" class="title">${asset.title}</text>
        <text x="50%" y="280" text-anchor="middle" class="subtitle">${asset.subtitle}</text>
    </svg>
    `;

    // Composite
    // 1. Background
    // 2. Screenshot (Centered, offset downwards)
    // 3. Text (Top)
    // 4. (Optional) Phone Frame Image overlay if we had one

    await bg
        .composite([
            { input: screenshot, top: 400, left: (width - 1000) / 2 }, // Screenshot position
            { input: Buffer.from(svgText), top: 0, left: 0 } // Text
        ])
        .toFile(path.join(OUTPUT_DIR, `final_${asset.name}.jpg`));

    // Cleanup raw
    fs.unlinkSync(rawPath);
}

captureScreenshots().then(() => {
    console.log('>>> Asset Generation Complete!');
});
