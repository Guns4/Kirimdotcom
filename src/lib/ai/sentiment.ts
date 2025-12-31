import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeSentiment(text: string, userId: string): Promise<{ score: number; isAngry: boolean }> {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo", // Cost efficient for simple tasks
            messages: [
                {
                    role: "system",
                    content: "You are an emotion analyzer. Rate the anger level of the user's message on a scale of 1-10 (10=Very Angry/Abusive). Return JSON only: { score: number }."
                },
                { role: "user", content: text }
            ],
            response_format: { type: "json_object" }
        });

        const result = JSON.parse(response.choices[0].message.content || '{}');
        const score = result.score || 0;
        const isAngry = score >= 8;

        if (isAngry) {
            console.warn(`[SENTIMENT] Angry User Detected (${score}/10): ${userId}`);
            await notifyCSAdmin(userId, text, score);
        }

        return { score, isAngry };

    } catch (error) {
        console.error('Sentiment Analysis Error:', error);
        return { score: 0, isAngry: false };
    }
}

async function notifyCSAdmin(userId: string, text: string, score: number) {
    // Simulated WA Notification
    // In real app: Call Twilio or WhatsApp API
    console.log(`
    🚨 **URGENT CS ALERT** 🚨
    User: ${userId}
    Anger Score: ${score}/10
    Message: "${text}"
    Action: Please handle immediately!
    `);
}
