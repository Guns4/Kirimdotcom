import { bot } from './telegram';
import { Markup } from 'telegraf';

const ADMIN_ID = process.env.TELEGRAM_ADMIN_ID;

export type AlertType = 'SECURITY' | 'ERROR' | 'TRANSACTION';

export async function sendSystemAlert(
  type: AlertType,
  message: string,
  meta?: any
) {
  if (!ADMIN_ID) {
    console.warn('Cannot send Telegram Alert. ADMIN_ID not set.');
    return;
  }

  let title = '⚠️ SYSTEM ALERT';
  let color = '🔴'; // Red default

  if (type === 'SECURITY') {
    title = '🛡️ SECURITY BREACH ATTEMPT';
    color = '⛔';
  } else if (type === 'TRANSACTION') {
    title = '💸 TRANSACTION FAILURE';
    color = '📉';
  }

  const formattedMessage = `${color} *${title}*\n\n${message}\n\n\`Details: ${JSON.stringify(meta || {}, null, 2)}\``;

  const keyboard = [];

  // Add Contextual Buttons
  if (type === 'SECURITY' && meta?.ip) {
    keyboard.push([
      Markup.button.callback(`🚫 Ban IP ${meta.ip}`, `ban_ip:${meta.ip}`),
      Markup.button.callback(`✅ Allow IP`, `allow_ip:${meta.ip}`),
    ]);
  } else if (type === 'ERROR') {
    keyboard.push([
      Markup.button.callback(`🔄 Restart Server`, `restart_server`),
      Markup.button.callback(`❌ Ignore`, `ignore_alert`),
    ]);
  }

  try {
    await bot.telegram.sendMessage(ADMIN_ID, formattedMessage, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard(keyboard),
    });
  } catch (error) {
    console.error('Failed to send Telegram alert:', error);
  }
}
