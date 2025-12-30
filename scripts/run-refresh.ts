import { ContentRefresher } from '../src/lib/content-refresher';

// Get current year
const currentYear = new Date().getFullYear();

// Allow manual override via args
const targetYear = process.argv[2] ? parseInt(process.argv[2]) : currentYear;

(async () => {
    console.log(`🚀 Starting Content Refresh Bot (Target: ${targetYear})`);

    // Note: specific execution might depend on Supabase environment variables being loaded
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        console.error("❌ Environment variables missing. Make sure to run with dotenv loaded.");
        // In a real local run, you'd load .env.local here
    }

    const result = await ContentRefresher.refreshContent(targetYear);

    if (result.success) {
        console.log("--------------------------------");
        console.log(`✅ Job Complete. Updated ${result.updatedCount || 0} items.`);
    } else {
        console.error("❌ Job Failed.");
    }
})();
