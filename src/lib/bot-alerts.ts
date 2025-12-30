import { bot } from '@/lib/telegram';
import { createClient } from '@/utils/supabase/server';

/**
 * ALERT SYSTEM
 * Handles critical system notifications to Telegram
 */

export class BotAlerts {
  private static async send(
    message: string,
    type: 'WARNING' | 'CRITICAL' | 'INFO' = 'INFO'
  ) {
    const adminId = process.env.TELEGRAM_ADMIN_ID;
    if (!adminId) {
      console.warn('TELEGRAM_ADMIN_ID not set, skipping alert.');
      return;
    }

    const icon = type === 'CRITICAL' ? '🔥' : type === 'WARNING' ? '⚠️' : 'ℹ️';
    const text = `${icon} *[${type}] System Alert*\n\n${message}`;

    try {
      // Inline Keyboard for Actions
      const extra =
        type !== 'INFO'
          ? {
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: '🚫 Ban IP',
                      callback_data: 'ban_ip_action_placeholder',
                    },
                    {
                      text: '🔄 Restart Server',
                      callback_data: 'restart_server',
                    },
                  ],
                ],
              },
              parse_mode: 'Markdown' as const,
            }
          : { parse_mode: 'Markdown' as const };

      await bot.telegram.sendMessage(adminId, text, extra);
    } catch (error) {
      console.error('Failed to send Telegram alert:', error);
    }
  }

  /**
   * Monitor Transaction Health (Called periodically or after failures)
   * Trigger: > 10 Consecutive Failed Transactions
   */
  static async checkTransactionHealth() {
    const supabase = await createClient();

    // Fetch last 15 payments to be safe
    const { data: payments } = await supabase
      .from('payment_history')
      .select('status, created_at')
      .order('created_at', { ascending: false })
      .limit(15);

    if (!payments || payments.length < 10) return;

    // Count consecutive failures from the most recent
    let consecutiveFailures = 0;
    for (const p of payments) {
      if (
        p.status === 'failed' ||
        p.status === 'rejected' ||
        p.status === 'error'
      ) {
        consecutiveFailures++;
      } else {
        break; // Stop counting if we hit a success or pending
      }
    }

    if (consecutiveFailures >= 10) {
      await this.send(
        `🚨 *CRITICAL TRANSACTION FAILURE*\n\nDetected ${consecutiveFailures} consecutive failed transactions.\nCheck Payment Gateway immediately!`,
        'CRITICAL'
      );
    }
  }

  /**
   * Report High Error Rate (Manual Trigger)
   * To be called if an Error Boundary catches too many exceptions
   */
  static async reportHighErrorRate(errorCount: number, windowSeconds: number) {
    await this.send(
      `📉 *High Error Rate Detected*\n\n${errorCount} errors in the last ${windowSeconds}s.\nExceeds 5% threshold.`,
      'WARNING'
    );
  }
}
