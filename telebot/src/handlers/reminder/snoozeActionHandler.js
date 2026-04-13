import { updateReminderStatus } from '../../services/reminderService.js';
import { formatSnoozedReminder } from '../../utils/formatter.js';
import logger from '../../logger/logger.js';

/**
 * Process snooze action from inline keyboard Telegram
 * @param {import('telegraf').Context} ctx - Telegram context object
 * @param {string} action - 'snooze_30m' or 'snooze_1d'
 */
export async function handleSnoozeReminder(ctx, action) {
  let reminderId;
  try {
    reminderId = parseInt(ctx.match[2], 10);
    
    // Service to update reminder time
    await updateReminderStatus(reminderId, action);

    // Get snooze human-readable text
    const snoozeText = action === 'snooze_30m' ? '30 menit' : '1 hari';

    // Build the updated message text using the formatter
    const originalText = ctx.callbackQuery.message.text;
    const updatedText = formatSnoozedReminder(originalText, snoozeText);

    // Give reply
    await ctx.answerCbQuery(`Oke, aku ingetin lagi ${snoozeText} lagi! 💤`);
    await ctx.editMessageText(updatedText, {
      parse_mode: 'Markdown'
    });
  } catch (error) {
    logger.error(`Error in handleSnoozeReminder for reminder ID ${reminderId}:`, error);
    await ctx.answerCbQuery('Gagal melakukan snooze.', { show_alert: true });
  }
}