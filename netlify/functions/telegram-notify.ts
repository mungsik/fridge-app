import { schedule } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

// ─── Types ───────────────────────────────────────────────────────

interface FridgeItemRow {
  id: string;
  name: string;
  quantity: number;
  expiry_date: string;
  user_id: string;
}

interface ProfileRow {
  id: string;
  username: string;
  telegram_chat_id: string | null;
}

interface AlertItem {
  name: string;
  quantity: number;
  days: number;
}

// ─── Helpers ─────────────────────────────────────────────────────

async function sendTelegramMessage(botToken: string, chatId: string, text: string): Promise<boolean> {
  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  });
  return res.ok;
}

function buildMessage(username: string, expired: AlertItem[], expiring: AlertItem[]): string {
  const lines: string[] = [`🧊 <b>${username}님의 냉장고 알림</b>`, ''];

  if (expired.length > 0) {
    lines.push('🔴 <b>만료된 식품:</b>');
    for (const item of expired) {
      lines.push(`• ${item.name} (${item.quantity}개)`);
    }
    lines.push('');
  }

  if (expiring.length > 0) {
    lines.push('🟡 <b>곧 만료 (3일 이내):</b>');
    for (const item of expiring) {
      lines.push(`• ${item.name} (${item.quantity}개) D-${item.days}`);
    }
    lines.push('');
  }

  const total = expired.length + expiring.length;
  lines.push(`총 <b>${total}개</b> 식품 확인 필요!`);
  return lines.join('\n');
}

// ─── Core logic ──────────────────────────────────────────────────

async function checkAndNotify(): Promise<string> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!supabaseUrl || !supabaseKey || !botToken) {
    const missing = [
      !supabaseUrl && 'SUPABASE_URL',
      !supabaseKey && 'SUPABASE_SERVICE_ROLE_KEY',
      !botToken && 'TELEGRAM_BOT_TOKEN',
    ].filter(Boolean);
    return `Missing env vars: ${missing.join(', ')}`;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Fetch profiles with telegram linked
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, username, telegram_chat_id')
    .not('telegram_chat_id', 'is', null);

  if (profilesError) return `Profile error: ${profilesError.message}`;
  if (!profiles || profiles.length === 0) return 'No users with Telegram linked';

  // Fetch all fridge items
  const { data: items, error: itemsError } = await supabase
    .from('fridge_items')
    .select('id, name, quantity, expiry_date, user_id');

  if (itemsError) return `DB error: ${itemsError.message}`;
  if (!items || items.length === 0) return 'No items in fridge';

  // Build profile map
  const profileMap = new Map<string, ProfileRow>();
  for (const p of profiles as ProfileRow[]) {
    profileMap.set(p.id, p);
  }

  // Group items by user
  const itemsByUser = new Map<string, FridgeItemRow[]>();
  for (const item of items as FridgeItemRow[]) {
    if (!profileMap.has(item.user_id)) continue;
    if (!itemsByUser.has(item.user_id)) itemsByUser.set(item.user_id, []);
    itemsByUser.get(item.user_id)!.push(item);
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  let sentCount = 0;
  let skipCount = 0;

  // Send per-user notifications
  for (const [userId, userItems] of itemsByUser.entries()) {
    const profile = profileMap.get(userId);
    if (!profile?.telegram_chat_id) continue;

    const expired: AlertItem[] = [];
    const expiring: AlertItem[] = [];

    for (const item of userItems) {
      const expiryDate = new Date(item.expiry_date);
      expiryDate.setHours(0, 0, 0, 0);
      const days = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (days < 0) {
        expired.push({ name: item.name, quantity: item.quantity, days });
      } else if (days <= 3) {
        expiring.push({ name: item.name, quantity: item.quantity, days });
      }
    }

    if (expired.length === 0 && expiring.length === 0) {
      skipCount++;
      continue;
    }

    const message = buildMessage(profile.username, expired, expiring);
    const ok = await sendTelegramMessage(botToken, profile.telegram_chat_id, message);
    if (ok) sentCount++;
  }

  return `Sent to ${sentCount} users, ${skipCount} skipped (no alerts)`;
}

// ─── Scheduled handler (매일 UTC 00:00 = KST 09:00) ─────────────

export const handler = schedule('0 0 * * *', async () => {
  const result = await checkAndNotify();
  console.log(result);
  return { statusCode: 200, body: result };
});
