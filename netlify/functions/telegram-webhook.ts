import type { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

interface TelegramUpdate {
  message?: {
    from: { id: number; first_name: string };
    chat: { id: number };
    text?: string;
  };
}

async function sendTelegramMessage(botToken: string, chatId: number, text: string): Promise<boolean> {
  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  });
  return res.ok;
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!supabaseUrl || !supabaseKey || !botToken) {
    return { statusCode: 500, body: 'Missing env vars' };
  }

  try {
    const update: TelegramUpdate = JSON.parse(event.body || '{}');

    if (!update.message?.text) {
      return { statusCode: 200, body: 'OK' };
    }

    const chatId = update.message.chat.id;
    const text = update.message.text.trim();

    // Parse /start CODE
    const startMatch = text.match(/^\/start\s+([A-Z0-9]{8})$/i);

    if (!startMatch) {
      if (text === '/start') {
        await sendTelegramMessage(botToken, chatId,
          '안녕하세요! 냉장고를 부탁해 알림 봇입니다.\n\n앱에서 연동 코드를 생성한 후 다시 시도해주세요.');
      }
      return { statusCode: 200, body: 'OK' };
    }

    const linkCode = startMatch[1].toUpperCase();
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find user with this link code
    const { data: profile, error: lookupError } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('telegram_link_code', linkCode)
      .maybeSingle();

    if (lookupError || !profile) {
      await sendTelegramMessage(botToken, chatId,
        '❌ 유효하지 않거나 만료된 연동 코드입니다.\n\n앱에서 새로운 코드를 생성해주세요.');
      return { statusCode: 200, body: 'OK' };
    }

    // Save chat_id and clear link code
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        telegram_chat_id: chatId.toString(),
        telegram_link_code: null,
        telegram_linked_at: new Date().toISOString(),
      })
      .eq('id', profile.id);

    if (updateError) {
      await sendTelegramMessage(botToken, chatId,
        '❌ 연동 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      return { statusCode: 200, body: 'OK' };
    }

    await sendTelegramMessage(botToken, chatId,
      `✅ <b>텔레그램 연동 완료!</b>\n\n사용자: <b>${profile.username}</b>\n\n매일 오전 9시에 유통기한 알림을 받습니다. 🧊`);

    return { statusCode: 200, body: 'OK' };
  } catch (err) {
    console.error('Webhook error:', err);
    return { statusCode: 200, body: 'OK' };
  }
};
