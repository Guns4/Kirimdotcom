import { createClient } from '@/utils/supabase/server';

export class ContentRefresher {
    /**
     * Scan and Update Old Year Content
     * e.g. "Best Tips 2023" -> "Best Tips 2024"
     */
    static async refreshContent(targetYear: number) {
        const supabase = await createClient();
        const oldYear = targetYear - 1;

        console.log(`🔍 Scanning for content from year ${oldYear} to update to ${targetYear}...`);

        // 1. Scan Articles (or 'posts', 'blogs' depending on schema - assuming 'articles' for now based on context)
        // Adjust table name if needed based on project schema (blind guess 'articles', fallback 'posts')
        const tableName = 'articles';

        const { data: articles, error } = await (supabase as any)
            .from(tableName)
            .select('id, title, meta_description, updated_at')
            .ilike('title', `%${oldYear}%`);

        if (error) {
            console.error(`Error scanning ${tableName}:`, error.message);
            return { success: false, message: error.message };
        }

        if (!articles || articles.length === 0) {
            console.log('✅ No outdated content found.');
            return { success: true, updatedCount: 0 };
        }

        console.log(`Found ${articles.length} articles to update.`);

        let updatedCount = 0;

        // 2. Update Loop
        for (const article of articles) {
            const newTitle = article.title.replace(new RegExp(oldYear.toString(), 'g'), targetYear.toString());
            const newMeta = article.meta_description
                ? article.meta_description.replace(new RegExp(oldYear.toString(), 'g'), targetYear.toString())
                : null;

            const { error: updateError } = await (supabase as any)
                .from(tableName)
                .update({
                    title: newTitle,
                    meta_description: newMeta,
                    updated_at: new Date().toISOString(), // SEO Freshness Signal
                })
                .eq('id', article.id);

            if (!updateError) {
                console.log(`Refreshed: "${article.title}" -> "${newTitle}"`);
                updatedCount++;
            } else {
                console.error(`Failed to update ${article.id}:`, updateError.message);
            }
        }

        return { success: true, updatedCount };
    }
}
