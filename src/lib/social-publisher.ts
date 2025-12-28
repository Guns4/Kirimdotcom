import { createClient } from '@/utils/supabase/server';

interface SocialResult {
    success: boolean;
    platform: 'twitter' | 'facebook';
    message?: string;
    postId?: string;
}

export async function postToTwitter(content: string, url: string): Promise<SocialResult> {
    const twitterKey = process.env.TWITTER_API_KEY;
    const twitterSecret = process.env.TWITTER_API_SECRET;

    // Check Config
    if (!twitterKey || !twitterSecret) {
        console.warn('Twitter credentials missing');
        return { success: false, platform: 'twitter', message: 'Credentials missing' };
    }

    try {
        // Pseudo-code for Twitter v2 API
        // const client = new TwitterApi({ appKey: ..., appSecret: ... });
        // const res = await client.v2.tweet(`${content} ${url}`);

        // Mock success for now
        console.log(`[Twitter] Posting: ${content} ${url}`);
        return { success: true, platform: 'twitter', postId: 'mock_tweet_123' };
    } catch (e: any) {
        return { success: false, platform: 'twitter', message: e.message };
    }
}

export async function postToFacebook(content: string, url: string): Promise<SocialResult> {
    const fbToken = process.env.FB_PAGE_TOKEN;

    if (!fbToken) {
        console.warn('Facebook credentials missing');
        return { success: false, platform: 'facebook', message: 'Credentials missing' };
    }

    try {
        // Pseudo-code for Graph API
        // const res = await axios.post(`https://graph.facebook.com/me/feed`, { message: ..., link: ... });

        console.log(`[Facebook] Posting: ${content} ${url}`);
        return { success: true, platform: 'facebook', postId: 'mock_fb_123' };
    } catch (e: any) {
        return { success: false, platform: 'facebook', message: e.message };
    }
}

export async function logSocialActivity(articleTitle: string, results: SocialResult[]) {
    const supabase = await createClient();

    // Assuming table 'social_logs' exists or using raw JSON logging for now
    // Schema: id, article_title, platform, status, details, created_at

    const logs = results.map(r => ({
        article_title: articleTitle,
        platform: r.platform,
        status: r.success ? 'success' : 'failed',
        details: r.message || r.postId,
        created_at: new Date().toISOString()
    }));

    // Insert into DB (mocked table name)
    // @ts-ignore: Table might not exist in types yet
    const { error } = await supabase.from('social_logs').insert(logs);

    if (error) console.error('Failed to log social activity:', error);
}
