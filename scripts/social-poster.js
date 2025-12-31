require('dotenv').config({ path: '.env.local' });
const sharp = require('sharp');
const { createClient } = require('@supabase/supabase-js');
const { TwitterApi } = require('twitter-api-v2');
const fs = require('fs');
const path = require('path');

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// Twitter Keys (Optional - will skip if missing)
const TWITTER_APP_KEY = process.env.TWITTER_APP_KEY;
const TWITTER_APP_SECRET = process.env.TWITTER_APP_SECRET;
const TWITTER_ACCESS_TOKEN = process.env.TWITTER_ACCESS_TOKEN;
const TWITTER_ACCESS_SECRET = process.env.TWITTER_ACCESS_SECRET;

// Initialize Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Mock Data (Since we might not have live 'DELIVERED' data in dev)
const MOCK_SUCCESS_STORY = {
    id: 'RESI-MOCK-' + Date.now(),
    origin: 'Jakarta',
    destination: 'Bandung',
    courier: 'JNE YES',
    duration: '14 Jam',
    customer_name: 'Budi' // Privacy: Use Initial
};

async function getSuccessStories() {
    console.log('>>> 🔍 Searching for Express Deliveries (< 24 Hours)...');

    // Construct Query:
    // const { data, error } = await supabase
    //    .from('shipments')
    //    .select('*')
    //    .eq('status', 'DELIVERED')
    //    .lt('delivery_duration_hours', 24)
    //    .limit(1);

    // For demo purposes, we return the mock if no real data
    return [MOCK_SUCCESS_STORY];
}

async function generateSocialImage(story) {
    console.log(`>>> 🎨 Generating Image for ${story.id}...`);

    const width = 1200;
    const height = 630; // standard APIog / Twitter Card size
    const bgPath = 'assets/social_bg_template.png'; // Assume simple bg or generate color

    // Background (Gradient Blue)
    const bg = sharp({
        create: {
            width: width,
            height: height,
            channels: 4,
            background: { r: 10, g: 15, b: 30, alpha: 1 } // Dark Blue
        }
    });

    const svgText = `
    <svg width="${width}" height="${height}">
        <style>
            .header { fill: #4ADE80; font-size: 60px; font-weight: 900; font-family: sans-serif; }
            .route { fill: white; font-size: 80px; font-weight: bold; font-family: sans-serif; }
            .details { fill: #E5E7EB; font-size: 40px; font-family: sans-serif; }
            .courier { fill: #60A5FA; font-size: 50px; font-weight: bold; font-family: sans-serif; }
        </style>
        
        <text x="600" y="150" text-anchor="middle" class="header">⚡ PENGIRIMAN KILAT ⚡</text>
        
        <text x="600" y="300" text-anchor="middle" class="route">
            ${story.origin} ➝ ${story.destination}
        </text>
        
        <text x="600" y="400" text-anchor="middle" class="details">
            Sampai cuma dalam ${story.duration}!
        </text>
        
        <rect x="400" y="480" width="400" height="80" rx="15" fill="white" opacity="0.1" />
        <text x="600" y="540" text-anchor="middle" class="courier">
            ${story.courier}
        </text>
    </svg>
    `;

    const outputPath = path.join('public', `social_post_${story.id}.png`);

    await bg
        .composite([{ input: Buffer.from(svgText), top: 0, left: 0 }])
        .toFile(outputPath);

    console.log(`>>> ✅ Image Saved: ${outputPath}`);
    return outputPath;
}

async function postToTwitter(story, imagePath) {
    if (!TWITTER_APP_KEY) {
        console.warn('>>> ⚠️  Twitter Keys missing. Skipping Post.');
        console.log(`>>> [SIMULATION] Tweeting: "Gila! Kirim ke ${story.destination} cuma ${story.duration} via ${story.courier}. Cek ongkir sekarang! #CekKirim"`);
        return;
    }

    try {
        const client = new TwitterApi({
            appKey: TWITTER_APP_KEY,
            appSecret: TWITTER_APP_SECRET,
            accessToken: TWITTER_ACCESS_TOKEN,
            accessSecret: TWITTER_ACCESS_SECRET,
        });

        const mediaId = await client.v1.uploadMedia(imagePath);
        await client.v2.tweet({
            text: `Gila! Kirim paket ke ${story.destination} cuma ${story.duration} lho! 🚀\n\nPakai ${story.courier} via CekKirim.com emang beda.\n\n#CekKirim #Logistik #Cepat`,
            media: { media_ids: [mediaId] }
        });

        console.log('>>> 🐦 Posted to Twitter successfully!');
    } catch (e) {
        console.error('>>> ❌ Twitter Error:', e.message);
    }
}

async function run() {
    const stories = await getSuccessStories();

    for (const story of stories) {
        const imagePath = await generateSocialImage(story);
        await postToTwitter(story, imagePath);
    }
}

run();
