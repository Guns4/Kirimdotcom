'use server';

import { createClient } from '@/utils/supabase/server';

/**
 * Search FAQ by query
 */
export async function searchFAQ(query: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await (supabase as any).rpc('search_faq', {
      p_query: query,
    });

    if (error || !data || data.length === 0) {
      return { data: [], found: false };
    }

    // Update times_shown for top result
    if (data[0]?.id) {
      await (supabase as any)
        .rpc('increment', {
          table_name: 'faq_items',
          column_name: 'times_shown',
          row_id: data[0].id,
        })
        .catch(() => {}); // Ignore errors
    }

    return { data, found: true };
  } catch (error) {
    console.error('Error searching FAQ:', error);
    return { data: [], found: false };
  }
}

/**
 * Mark FAQ as helpful/not helpful
 */
export async function markFAQHelpful(faqId: string, isHelpful: boolean) {
  try {
    const supabase = await createClient();

    const column = isHelpful ? 'helpful_count' : 'not_helpful_count';

    await (supabase as any)
      .from('faq_items')
      .update({
        [column]: (supabase as any).rpc('increment_value', { val: 1 }),
      })
      .eq('id', faqId);

    return { success: true };
  } catch (error) {
    console.error('Error marking FAQ:', error);
    return { success: false };
  }
}

/**
 * Create support ticket
 */
export async function createSupportTicket(ticket: {
  email: string;
  name: string;
  category: string;
  subject: string;
  description: string;
}) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await (supabase as any).rpc(
      'create_support_ticket',
      {
        p_email: ticket.email,
        p_name: ticket.name,
        p_category: ticket.category,
        p_subject: ticket.subject,
        p_description: ticket.description,
        p_user_id: user?.id || null,
      }
    );

    if (error || !data || data.length === 0) {
      return { success: false, error: 'Failed to create ticket' };
    }

    const result = data[0];

    return {
      success: true,
      ticketNumber: result.ticket_number,
      queuePosition: result.queue_position,
      message: `Laporan diterima! Nomor tiket: ${result.ticket_number}. Antrian #${result.queue_position}`,
    };
  } catch (error) {
    console.error('Error creating ticket:', error);
    return { success: false, error: 'System error' };
  }
}

/**
 * Get my tickets
 */
export async function getMyTickets() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: 'Not authenticated' };
    }

    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    return { data, error };
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return { data: null, error: 'System error' };
  }
}

/**
 * Log system health check
 */
export async function logHealthCheck(check: {
  checkType: string;
  targetUrl?: string;
  targetName?: string;
  isHealthy: boolean;
  responseTimeMs?: number;
  statusCode?: number;
  errorMessage?: string;
}) {
  try {
    const supabase = await createClient();

    await (supabase as any).from('system_health_logs').insert({
      check_type: check.checkType,
      target_url: check.targetUrl,
      target_name: check.targetName,
      is_healthy: check.isHealthy,
      response_time_ms: check.responseTimeMs,
      status_code: check.statusCode,
      error_message: check.errorMessage,
    });

    return { success: true };
  } catch (error) {
    console.error('Error logging health check:', error);
    return { success: false };
  }
}

/**
 * Send Telegram alert
 */
export async function sendTelegramAlert(message: string) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.log('Telegram not configured');
      return { success: false, error: 'Telegram not configured' };
    }

    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Telegram API error');
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending Telegram alert:', error);
    return { success: false, error: 'Failed to send alert' };
  }
}

/**
 * Check system health
 */
export async function checkSystemHealth() {
  const checks = [
    {
      type: 'website',
      url: process.env.NEXT_PUBLIC_APP_URL || 'https://cekkirim.com',
      name: 'Main Website',
    },
    {
      type: 'api',
      url: `${process.env.NEXT_PUBLIC_APP_URL}/api/health`,
      name: 'API Health',
    },
  ];

  const results = [];

  for (const check of checks) {
    const startTime = Date.now();
    let isHealthy = false;
    let statusCode = 0;
    let errorMessage = '';

    try {
      const response = await fetch(check.url, {
        method: 'GET',
        cache: 'no-store',
      });

      statusCode = response.status;
      isHealthy = response.ok;
    } catch (error: any) {
      errorMessage = error.message || 'Connection failed';
    }

    const responseTime = Date.now() - startTime;

    // Log to database
    await logHealthCheck({
      checkType: check.type,
      targetUrl: check.url,
      targetName: check.name,
      isHealthy,
      responseTimeMs: responseTime,
      statusCode,
      errorMessage,
    });

    // Send alert if unhealthy
    if (!isHealthy) {
      await sendTelegramAlert(
        `🚨 <b>SYSTEM ALERT</b>\n\n` +
          `Service: ${check.name}\n` +
          `Status: ❌ DOWN\n` +
          `Error: ${errorMessage || `HTTP ${statusCode}`}\n` +
          `Time: ${new Date().toISOString()}`
      );
    }

    results.push({
      name: check.name,
      isHealthy,
      responseTime,
      statusCode,
      errorMessage,
    });
  }

  return results;
}
