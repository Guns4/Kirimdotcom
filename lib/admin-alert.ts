// Mock Email/Slack Notifier
export async function sendAdminAlert(subject: string, body: string) {
    console.log(`[ADMIN ALERT] ${subject}`);
    console.log(body);
    // In production: await resend.emails.send(...) or slack.post(...)
}
