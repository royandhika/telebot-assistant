import { updateReminderStatus } from '../../services/reminderService.js';
import logger from '../../logger/logger.js';

/**
 * Process snooze action from inline keyboard Telegram
 * @param {import('telegraf').Context} ctx - Telegram context object
 * @param {string} action - 'snooze_30m' or 'snooze_1d'
 */
export async function handleSnoozeReminder(ctx, action) {
  try {
    const reminderId = parseInt(ctx.match[1], 10);
    
    // Service to update reminder time
    await updateReminderStatus(reminderId, action);

    // Give reply
    let snoozeText = '';
    if (action === 'snooze_30m') {
      snoozeText = '30 menit';
    } else if (action === 'snooze_1d') {
      snoozeText = '1 hari';
    }
    await ctx.answerCbQuery(`Oke, aku ingetin lagi ${snoozeText} lagi! 💤`);
    await ctx.editMessageText(`💤 *Snoozed*\n\n${ctx.callbackQuery.message.text.replace('🔔 REMINDER\n\n', '')}\n\n_(Akan diingatkan kembali dalam ${snoozeText})_`, {
      parse_mode: 'Markdown'
    });
  } catch (error) {
    logger.error(`Error in handleSnoozeReminder for reminder ID ${reminderId}:`, error);
    await ctx.answerCbQuery('Gagal melakukan snooze.', { show_alert: true });
  }
}