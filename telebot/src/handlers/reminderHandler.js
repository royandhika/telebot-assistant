import { createReminder, getReminder, updateReminderStatus } from '../services/reminderService.js';
import { parseAddReminder } from '../ai/reminders/addReminderAi.js';
import { parseGetReminder } from '../ai/reminders/getReminderAi.js';
import { 
  formatNewReminderReply, 
  formatListReminderReply, 
  formatCompletedReminder, 
  formatSnoozedReminder 
} from '../utils/formatter.js';
import logger from '../logger/logger.js';

/**
 * Handles the addition of a new reminder
 * @param {import('telegraf').Context} ctx - Telegram context object
 */
export async function handleAddReminder(ctx) {
  const message = ctx.state.parsedMessage;
  try {
    // AI parse to extract task details
    const reminderInfo = await parseAddReminder(message.messageText);
    logger.debug(`AI Extracted Reminder Info: ${JSON.stringify(reminderInfo)}`);
    
    // Service to create task
    const newReminder = await createReminder(message.userId, reminderInfo);
    
    // Build reply message
    const replyMessage = formatNewReminderReply(newReminder);
    
    await ctx.reply(replyMessage, { parse_mode: 'HTML' });
  } catch (error) {
    logger.error(`Error in handleAddReminder for user ${message?.userId}:`, error);
    await ctx.reply("Maaf, gagal membuat reminder. Coba ulangi detail reminder-nya dengan jelas.");
  }
}

/**
 * Handles the retrieval of reminders
 * @param {import('telegraf').Context} ctx - Telegram context object
 */
export async function handleGetReminder(ctx) {
  const message = ctx.state.parsedMessage;
  try {
    // AI parse to extract task details
    const reminderFilter = await parseGetReminder(message.messageText);
    logger.debug(`AI Extracted Reminder Info: ${JSON.stringify(reminderFilter)}`);
    
    // Service to fetch reminders
    const listReminder = await getReminder(message.userId, reminderFilter);
    
    // Build reply message
    const replyMessage = formatListReminderReply(listReminder);
    
    await ctx.reply(replyMessage, { parse_mode: 'HTML' });
  } catch (error) {
    logger.error(`Error in handleGetReminder for user ${message?.userId}:`, error);
    await ctx.reply("Maaf, gagal mengambil daftar reminder.");
  }
}

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
