import { updateReminderStatus } from '../../services/reminderService.js';
import logger from '../../logger/logger.js';

/**
 * Process complete action from inline keyboard Telegram
 * @param {import('telegraf').Context} ctx - Telegram context object
 */
export async function handleCompleteReminder(ctx) {
  try {
    const reminderId = parseInt(ctx.match[1], 10);
    
    // Service to update reminder status to completed
    await updateReminderStatus(reminderId, 'complete');

    // Give reply
    await ctx.answerCbQuery('Mantap! Task selesai!');
    await ctx.editMessageText(`✅ *Task Selesai*\n\n~${ctx.callbackQuery.message.text.replace('🔔 REMINDER\n\n', '')}~`, {
      parse_mode: 'Markdown'
    });
  } catch (error) {
    logger.error(`Error in handleCompleteReminder for reminder ID ${reminderId}:`, error);
    await ctx.answerCbQuery('Gagal menyelesaikan task. Coba lagi nanti.', { show_alert: true });
  }
}