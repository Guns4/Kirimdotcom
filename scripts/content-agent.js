require('dotenv').config({ path: '.env.local' });
const googleTrends = require('google-trends-api');
const OpenAI = require('openai');
const { createClient } = require('@supabase/supabase-js');
const slugify = require('slugify');

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Initialize Clients
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Seed Keywords (Fallback/Mix)
const SEED_KEYWORDS = ["Kiriman Lebaran", "Ongkir Naik", "Tips Packing Aman", "Bisnis Online Pemula"];

async function getTrendingTopic() {
    console.log('>>> 🔍 Scanning Google Trends (Indonesia)...');
    try {
        const results = await googleTrends.dailyTrends({
            geo: 'ID',
        });
        const parsed = JSON.parse(results);
        const trendingSearches = parsed.default.trendingSearchesDays[0].trendingSearches;

        // Pick top 1 unrelated to specific celebrities if possible, or just mix with seeds
        if (trendingSearches.length > 0) {
            const trend = trendingSearches[0].title.query;
            console.log(`>>> 🔥 Trend Found: "${trend}"`);
            return trend;
        }
    } catch (e) {
        console.warn('>>> ⚠️ Trends API Error/RateLimit, using seed keyword.');
    }

    // Fallback
    const randomSeed = SEED_KEYWORDS[Math.floor(Math.random() * SEED_KEYWORDS.length)];
    console.log(`>>> 🌱 Using Seed: "${randomSeed}"`);
    return randomSeed;
}

async function generateArticle(topic) {
    console.log(`>>> ✍️  Writing Article about: "${topic}"... (Please wait)`);

    const prompt = `
    Write a high-quality SEO-optimized blog post about "${topic}" in Indonesian (Bahasa Indonesia).
    Target audience: SME owners and Online Sellers.
    Length: ~800-1000 words.
    Format: Markdown.
    
    Structure:
    1. Catchy Title (H1)
    2. Introduction (Hook)
    3. 3-4 Subheadings (H2) discussing the impact/tips related to "${topic}" for logistics/delivery.
    4. Conclusion.
    5. Meta Description (max 160 chars).
    6. Tags (comma separated).
    
    Output strictly as JSON:
    {
        "title": "...",
        "content_md": "...",
        "meta_desc": "...",
        "tags": ["..."]
    }
    `;

    try {
        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "gpt-4-turbo-preview", // Or gpt-3.5-turbo if cost concern
            response_format: { type: "json_object" }
        });

        return JSON.parse(completion.choices[0].message.content);
    } catch (e) {
        console.error('>>> ❌ OpenAI Error:', e.message);
        return null;
    }
}

async function publishArticle(article) {
    if (!article) return;

    const slug = slugify(article.title, { lower: true, strict: true });

    console.log(`>>> 🚀 Publishing: ${article.title}`);

    const { data, error } = await supabase
        .from('articles')
        .insert([
            {
                title: article.title,
                slug: slug + '-' + Date.now(), // Ensure uniqueness
                content_md: article.content_md,
                meta_desc: article.meta_desc,
                keywords: article.tags,
                status: 'published', // Auto-publish
                category: 'News',
                read_time_minutes: 5
            }
        ])
        .select();

    if (error) {
        console.error('>>> ❌ Publish Error:', error.message);
    } else {
        console.log('>>> ✅ Published Successfully! ID:', data[0].id);
    }
}

async function run() {
    if (!OPENAI_API_KEY) {
        console.error('>>> ❌ ERROR: OPENAI_API_KEY is missing in .env.local');
        return;
    }

    const topic = await getTrendingTopic();
    const article = await generateArticle(topic);
    await publishArticle(article);
}

run();
