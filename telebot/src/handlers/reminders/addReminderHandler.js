import { createReminder } from '../../services/reminderService.js';
import { parseAddReminder } from '../../ai/reminders/addReminderAi.js';
import { formatNewReminderReply } from '../../utils/formatter.js';
import logger from '../../logger/logger.js';

/**
 * Handles the addition of a new reminder
 * @param {import('telegraf').Context} ctx - Telegram context object
 * @param {Object} message - The message object containing user input
 */
export async function handleAddReminder(ctx, message) {
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
    logger.error(`Error in handleAddReminder for user ${message.userId}:`, error);
    await ctx.reply("Maaf, gagal membuat reminder. Coba ulangi detail reminder-nya dengan jelas.");
  }
}
