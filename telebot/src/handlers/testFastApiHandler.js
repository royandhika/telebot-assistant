import logger from '../logger/logger.js';

/**
 * Handle /test command to verify connectivity with FastAPI
 * @param {import('telegraf').Context} ctx - Telegram context object
 */
export async function handleTestFastApi(ctx) {
  const apiUrl = process.env.DATA_PROCESSOR_URL || 'http://localhost:8000';
  
  try {
    logger.info(`User ${ctx.from.id} triggering /test to FastAPI at ${apiUrl}`);
    
    const payload = {
      source: 'telegraf-bot',
      user_id: ctx.from.id,
      username: ctx.from.username,
      message_text: ctx.message.text,
      chat_id: ctx.chat.id,
      timestamp: new Date().toISOString()
    };

    const response = await fetch(`${apiUrl}/test-debug`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`FastAPI responded with status: ${response.status}`);
    }

    const result = await response.json();
    logger.info('FastAPI test response:', result);

    await ctx.reply(`✅ *Koneksi ke FastAPI Berhasil!*\n\nData telah terkirim dan diterima oleh Python service.\n\n_Response:_ \`${JSON.stringify(result.data)}\``, {
      parse_mode: 'Markdown'
    });
  } catch (error) {
    logger.error('Error hitting FastAPI /test-debug:', error);
    await ctx.reply(`❌ *Gagal hit FastAPI*\n\nError: \`${error.message}\`\nPastikan service \`data-processor\` sedang berjalan di \`${apiUrl}\``, {
      parse_mode: 'Markdown'
    });
  }
}
