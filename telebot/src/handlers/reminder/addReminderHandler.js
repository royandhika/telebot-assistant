import { createReminder } from '../../services/reminderService.js';
import { parseAddReminder } from '../../ai/reminder/addReminderAi.js';
import { buildNewReminderReply } from '../../utils/formatter.js';
import logger from '../../logger/logger.js';

export async function handleAddReminder(ctx, message) {
  try {
    // AI parse to extract task details
    const reminderInfo = await parseAddReminder(message.messageText);
    logger.debug(`AI Extracted Reminder Info: ${JSON.stringify(reminderInfo)}`);
    
    // Service to create task
    const newReminder = await createReminder(message.userId, reminderInfo);
    
    // Build reply message
    const replyMessage = buildNewReminderReply(newReminder);
    
    await ctx.reply(replyMessage, { parse_mode: 'HTML' });
  } catch (error) {
    logger.error(`Error in handleAddReminder for user ${message.userId}:`, error);
    await ctx.reply("Maaf, gagal membuat reminder. Coba ulangi detail reminder-nya dengan jelas.");
  }
}
