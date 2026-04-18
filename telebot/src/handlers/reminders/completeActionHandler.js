import { updateReminderStatus } from '../../services/reminderService.js';
import { formatCompletedReminder } from '../../utils/formatter.js';
import logger from '../../logger/logger.js';

/**
 * Process complete action from inline keyboard Telegram
 * @param {import('telegraf').Context} ctx - Telegram context object
 */
export async function handleCompleteReminder(ctx) {
  let reminderId;
  try {
    reminderId = parseInt(ctx.match[1], 10);
    
    // Service to update reminder status to completed
    await updateReminderStatus(reminderId, 'complete');

    // Build the updated message text using the formatter
    const originalText = ctx.callbackQuery.message.text;
    const updatedText = formatCompletedReminder(originalText);

    // Give reply
    await ctx.answerCbQuery('Mantap! Task selesai! ✅');
    await ctx.editMessageText(updatedText, {
      parse_mode: 'Markdown'
    });
  } catch (error) {
    logger.error(`Error in handleCompleteReminder for reminder ID ${reminderId}:`, error);
    await ctx.answerCbQuery('Gagal menyelesaikan task. Coba lagi nanti.', { show_alert: true });
  }
}