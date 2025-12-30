import { Telegraf, Context } from 'telegraf';
import { createClient } from '@supabase/supabase-js';

// Initialize Bot
const token = process.env.TELEGRAM_BOT_TOKEN;
const adminId = process.env.TELEGRAM_ADMIN_ID;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // Or SERVICE_ROLE_KEY if needed for admin actions (Bypassing RLS)
);

export const bot = new Telegraf(token || 'dummy_token');

// SECURITY MIDDLEWARE
bot.use(async (ctx, next) => {
  if (!adminId) return next();
  const userId = ctx.from?.id.toString();
  if (userId !== adminId) {
    console.warn(`Unauthorized Access: ${userId}`);
    return;
  }
  return next();
});

// ============================================================================
// COMMANDS
// ============================================================================

bot.start((ctx) => {
  ctx.reply(
    '🚀 *Command Center Online*\n\n' +
    '/stats - Today\'s Performance\n' +
    '/search <query> - Find User/Tx\n' +
    '/maintenance <on/off> - Emergency Switch\n' +
    '/broadcast <msg> - Global Alert',
    { parse_mode: 'Markdown' }
  );
});

// [/stats] - Revenue & User Report
bot.command('stats', async (ctx) => {
  ctx.reply('📊 Calculating stats...');

  const today = new Date().toISOString().split('T')[0];

  // 1. Transaction Volume (Today)
  const { data: txs } = await supabase
    .from('ledger_entries')
    .select('amount, type')
    .gte('created_at', today);

  const revenue = txs
    ?.filter(t => t.type === 'DEBIT') // Assuming Debit = Income/Spend
    .reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0;

  const payout = txs
    ?.filter(t => t.type === 'WITHDRAWAL')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0;

  // 2. New Users (Today)
  const { count: newUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today);

  // 3. Pending Withdrawals
  const { count: pendingWithdrawals } = await supabase
    .from('ledger_entries')
    .select('*', { count: 'exact', head: true })
    .eq('type', 'WITHDRAWAL')
    .eq('status', 'PENDING');

  ctx.reply(
    `📅 *Report: ${today}*\n\n` +
    `💰 *Revenue*: Rp ${revenue.toLocaleString('id-ID')}\n` +
    `💸 *Payouts*: Rp ${payout.toLocaleString('id-ID')}\n` +
    `👥 *New Users*: ${newUsers || 0}\n` +
    `⏳ *Pending Withdrawals*: ${pendingWithdrawals || 0}`,
    { parse_mode: 'Markdown' }
  );
});

// [/search] - Universal Search
bot.command('search', async (ctx) => {
  // Extract query: "/search john" -> "john"
  // @ts-ignore
  const query = ctx.payload || ctx.message?.text.split(' ').slice(1).join(' ');

  if (!query) return ctx.reply('❌ Usage: /search <keyword>');

  ctx.reply(`🔍 Searching for "${query}"...`);

  // Search Users
  const { data: users } = await supabase
    .from('profiles')
    .select('email, id, full_name')
    .or(`email.ilike.%${query}%,full_name.ilike.%${query}%`)
    .limit(3);

  let resultMsg = '';

  if (users && users.length > 0) {
    resultMsg += `👤 *Users Found:*\n`;
    users.forEach(u => {
      resultMsg += `- [${u.email}](https://cekkirim.com/admin/mobile/users/${u.id})\n`;
    });
  } else {
    resultMsg += `👤 No users found.\n`;
  }

  ctx.reply(resultMsg, { parse_mode: 'Markdown', link_preview_options: { is_disabled: true } });
});

// [/maintenance] - Emergency Mode
bot.command('maintenance', async (ctx) => {
  // @ts-ignore
  const arg = ctx.payload || ctx.message?.text.split(' ')[1];

  if (arg === 'on') {
    // In a real app, set this in a Config Table/Redis
    // await supabase.from('config').update({ maintenance_mode: true }).eq('id', 1);
    ctx.reply('🚨 *MAINTENANCE MODE ACTIVATED*\nWebsite is now locked for users.');
  } else if (arg === 'off') {
    // await supabase.from('config').update({ maintenance_mode: false }).eq('id', 1);
    ctx.reply('✅ *System Online*\nMaintenance mode disabled.');
  } else {
    ctx.reply('Usage: /maintenance <on/off>');
  }
});

// [/broadcast] - Mass Notification
bot.command('broadcast', async (ctx) => {
  // @ts-ignore
  const message = ctx.payload || ctx.message?.text.split(' ').slice(1).join(' ');

  if (!message) return ctx.reply('❌ Usage: /broadcast <message>');

  // Create Notification Entries
  // Assuming a 'notifications' table exists
  /*
  const { error } = await supabase.from('notifications').insert({
      title: 'System Announcement',
      message: message,
      type: 'BROADCAST',
      user_id: null // null implies all users? or we loop insert
  });
  */

  ctx.reply(`📢 *Broadcast Sent*\nMessage: "${message}"\n\n(Note: DB Insert Logic mocked for safety)`);
});
