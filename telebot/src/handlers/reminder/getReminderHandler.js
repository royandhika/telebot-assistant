import { getReminder } from '../../services/reminderService.js';
import { parseGetReminder } from '../../ai/reminder/getReminderAi.js';
import { buildListReminderReply } from '../../utils/formatter.js';
import logger from '../../logger/logger.js';

export async function handleGetReminder(ctx, message) {
  try {
    // AI parse to extract task details
    const reminderFilter = await parseGetReminder(message.messageText);
    logger.debug(`AI Extracted Reminder Info: ${JSON.stringify(reminderFilter)}`);
    
    // Service to fetch reminders
    const listReminder = await getReminder(message.userId, reminderFilter);
    
    // Build reply message
    const replyMessage = buildListReminderReply(listReminder);
    
    await ctx.reply(replyMessage, { parse_mode: 'HTML' });
  } catch (error) {
    logger.error(`Error in handleAddReminder for user ${message.userId}:`, error);
    await ctx.reply("Maaf, gagal membuat reminder. Coba ulangi detail reminder-nya dengan jelas.");
  }
}
