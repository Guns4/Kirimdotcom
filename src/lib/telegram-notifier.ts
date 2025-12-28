const TELEGRAM_API = 'https://api.telegram.org/bot';

export async function notifyChannel(title: string, slug: string) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const channelId = process.env.TELEGRAM_CHANNEL_ID;

    if (!token || !channelId) {
        console.warn('Telegram credentials missing. Skipping notification.');
        return { success: false, error: 'Missing credentials' };
    }

    // Construct Message
    const url = `https://cekkirim.com/blog/${slug}`; // Adjust base URL as needed
    const text = `
📢 *ARTIKEL BARU TAYANG!*

*_${title}_*

👉 Baca selengkapnya di sini:
${url}

#CekKirim #Logistik #Tips
`.trim();

    try {
        const res = await fetch(`${TELEGRAM_API}${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: channelId,
                text: text,
                parse_mode: 'Markdown'
            })
        });

        const data = await res.json();

        if (!data.ok) {
            console.error('Telegram API Error:', data);
            return { success: false, error: data.description };
        }

        console.log('[Telegram] Notification sent for:', title);
        return { success: true, data };
    } catch (error) {
        console.error('Telegram Network Error:', error);
        return { success: false, error: 'Network error' };
    }
}
