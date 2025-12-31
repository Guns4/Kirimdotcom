import { google } from 'googleapis';
// import { TelegramBot } from './telegram'; // Assuming existing telegram service from previous tasks

// Configuration
const KEY_FILE = process.env.GOOGLE_PLAY_KEY_FILE || 'service-account.json';
const PACKAGE_NAME = 'com.cekkirim.app';

export const PlayStoreBot = {

    /**
     * Authenticate with Google Play API
     */
    async getClient() {
        const auth = new google.auth.GoogleAuth({
            keyFile: KEY_FILE,
            scopes: ['https://www.googleapis.com/auth/androidpublisher'],
        });
        return google.androidpublisher({ version: 'v3', auth });
    },

    /**
     * Scan and Reply to Reviews
     */
    async scanAndReply() {
        try {
            const android = await this.getClient();

            const res = await android.reviews.list({
                packageName: PACKAGE_NAME,
                maxResults: 50, // Process last 50
            });

            const reviews = res.data.reviews || [];

            for (const review of reviews) {
                const comment = review.comments?.[0]?.userComment;
                const starRating = comment?.starRating || 0;
                const reviewId = review.reviewId;

                // Skip if already replied (implied logic: look for developerComment)
                // Note: The API response structure needs checking for existing replies, 
                // typically 'comments' array has developerComment if replied.
                const hasReplied = review.comments?.some(c => c.developerComment);

                if (!reviewId || hasReplied || !comment) continue;

                let replyText = '';

                if (starRating >= 5) {
                    replyText = "Terima kasih kak! Semangat cuan bareng CekKirim. 🚀";
                } else if (starRating <= 3) {
                    replyText = "Halo kak, mohon maaf atas kendalanya. Bisa hubungi CS kami di WA 0812-3456-7890 agar kami bantu segera? 🙏";

                    // Alert Admin Logic
                    if (comment.text) {
                        console.log(`[ALERT] Low Review (${starRating}*): ${comment.text}`);
                        // TelegramBot.sendAlert(`🚨 Low Review (${starRating}*): ${comment.text}`);
                    }
                } else {
                    // 4 stars
                    replyText = "Terima kasih feedbacknya kak! Kami akan terus tingkatkan performa aplikasi.";
                }

                if (replyText) {
                    await android.reviews.reply({
                        packageName: PACKAGE_NAME,
                        reviewId: reviewId,
                        requestBody: {
                            replyText: replyText
                        }
                    });
                    console.log(`Replied to ${reviewId}: ${replyText}`);
                }
            }

            return { success: true, processed: reviews.length };

        } catch (error) {
            console.error('Play Store Bot Error:', error);
            return { success: false, error };
        }
    }
};
