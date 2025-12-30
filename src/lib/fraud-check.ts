export async function isUserFlagged(userId: string): Promise<boolean> {
    // In production, check 'profiles.is_fraud' or similar in database
    console.log(`[FRAUD_CHECK] Auditing user: ${userId}`);
    return false; // Default safe for demo
}
