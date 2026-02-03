import { schedule } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

// ─── Types ───────────────────────────────────────────────────────

interface FridgeItemRow {
  id: string;
  name: string;
  quantity: number;
  expiry_date: string;
  category: string;
  location: string;
  user_id: string;
}

interface ProfileRow {
  id: string;
  username: string;
}

interface AlertItem {
  name: string;
  quantity: number;
  days: number;
  ownerName: string;
}

// ─── Core logic ──────────────────────────────────────────────────

async function checkAndNotify(): Promise<string> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!supabaseUrl || !supabaseKey || !botToken || !chatId) {
    const missing = [
      !supabaseUrl && 'SUPABASE_URL',
      !supabaseKey && 'SUPABASE_SERVICE_ROLE_KEY',
      !botToken && 'TELEGRAM_BOT_TOKEN',
      !chatId && 'TELEGRAM_CHAT_ID',
    ].filter(Boolean);
    return `Missing env vars: ${missing.join(', ')}`;
  }

  // Supabase client with service_role key (bypasses RLS)
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Fetch all fridge items
  const { data: items, error: itemsError } = await supabase
    .from('fridge_items')
    .select('id, name, quantity, expiry_date, category, location, user_id');

  if (itemsError) {
    return `DB error: ${itemsError.message}`;
  }

  if (!items || items.length === 0) {
    return 'No items in fridge';
  }

  // Calculate days until expiry
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const expired: AlertItem[] = [];
  const expiring: AlertItem[] = [];
  const userIds = new Set<string>();

  for (const item of items as FridgeItemRow[]) {
    userIds.add(item.user_id);
  }

  // Fetch owner names
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username')
    .in('id', [...userIds]);

  const ownerMap = new Map<string, string>();
  if (profiles) {
    for (const p of profiles as ProfileRow[]) {
      ownerMap.set(p.id, p.username);
    }
  }

  // Categorize items
  for (const item of items as FridgeItemRow[]) {
    const expiryDate = new Date(item.expiry_date);
    expiryDate.setHours(0, 0, 0, 0);
    const days = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const ownerName = ownerMap.get(item.user_id) || '알 수 없음';

    if (days < 0) {
      expired.push({ name: item.name, quantity: item.quantity, days, ownerName });
    } else if (days <= 3) {
      expiring.push({ name: item.name, quantity: item.quantity, days, ownerName });
    }
  }

  // Nothing to report
  if (expired.length === 0 && expiring.length === 0) {
    return 'No expired or expiring items';
  }

  // Build message
  const lines: string[] = ['🧊 <b>냉장고 알림</b>', ''];

  if (expired.length > 0) {
    lines.push('🔴 <b>만료된 식품:</b>');
    for (const item of expired) {
      lines.push(`• ${item.name} (${item.quantity}개) - ${item.ownerName}`);
    }
    lines.push('');
  }

  if (expiring.length > 0) {
    lines.push('🟡 <b>곧 만료 (3일 이내):</b>');
    for (const item of expiring) {
      lines.push(`• ${item.name} (${item.quantity}개) D-${item.days} - ${item.ownerName}`);
    }
    lines.push('');
  }

  const total = expired.length + expiring.length;
  lines.push(`총 <b>${total}개</b> 식품 확인 필요!`);

  const message = lines.join('\n');

  // Send via Telegram Bot API
  const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const res = await fetch(telegramUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML',
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    return `Telegram API error: ${res.status} ${body}`;
  }

  return `Sent alert: ${expired.length} expired, ${expiring.length} expiring`;
}

// ─── Scheduled handler (매일 UTC 00:00 = KST 09:00) ─────────────

export const handler = schedule('0 0 * * *', async () => {
  const result = await checkAndNotify();
  console.log(result);
  return { statusCode: 200, body: result };
});
