/**
 * Helper script to register the Telegram webhook with secret token verification
 * Run with: npx tsx scripts/set-telegram-webhook.ts
 */

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-deployed-domain.vercel.app';

if (!botToken || !webhookSecret) {
  console.error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_WEBHOOK_SECRET in environment.');
  process.exit(1);
}

const webhookUrl = `${siteUrl.replace(/\/$/, '')}/api/telegram/webhook`;

async function setWebhook() {
  console.log(`Setting Telegram webhook for bot to: ${webhookUrl}`);

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: webhookUrl,
        secret_token: webhookSecret,
        allowed_updates: ['message'],
        drop_pending_updates: false,
      }),
    });

    const data = await response.json();
    if (data.ok) {
      console.log('✅ Telegram webhook registered successfully!');
      console.log('Result:', data.description);
    } else {
      console.error('❌ Failed to register webhook:', data.description);
    }
  } catch (err: unknown) {
    console.error('Network exception registering webhook:', (err as Error).message);
  }
}

setWebhook();
