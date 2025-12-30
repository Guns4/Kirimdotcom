// Balance Guard Service
// Financial Safety & Alerting System

export interface IncidentReport {
    userId: string;
    balance: number;
    timestamp: Date;
}

// 1. Notify Admin (Telegram Integration Mock)
export async function notifyAdmin(incident: IncidentReport) {
    const message = `
🚨 **CRITICAL: SALDO NEGATIF DETECTED** 🚨

User ID: \`${incident.userId}\`
Balance: Rp ${incident.balance.toLocaleString('id-ID')}
Time: ${incident.timestamp.toLocaleString()}

⚠️ **ACTION TAKEN:** Account FROZEN automatically.
Please investigate immediately.
    `.trim();

    console.log(`[BalanceGuard] Sending Telegram Alert:\n${message}`);

    // In production:
    // await fetchWithRetry('https://api.telegram.org/bot<TOKEN>/sendMessage', { chat_id: ADMIN_ID, text: message });
}

// 2. Freeze User Logic (Application Layer Fallback)
// If DB trigger misses or for manual freezing
export async function freezeUser(userId: string, reason: string = 'Negative Balance') {
    console.log(`[BalanceGuard] Freezing User ${userId}. Reason: ${reason}`);
    // await supabase.from('profiles').update({ status: 'FROZEN' }).eq('id', userId);
    return true;
}

// 3. Safe Balance Checker (Pre-Transaction)
// Use this before deducting balance to prevent negative in the first place
export function isSafeToDeduct(currentBalance: number, amount: number): boolean {
    if (currentBalance - amount < 0) {
        console.warn(`[BalanceGuard] Blocked transaction: Insufficient funds (Curr: ${currentBalance}, Req: ${amount})`);
        return false;
    }
    return true;
}
