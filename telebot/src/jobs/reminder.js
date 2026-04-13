import cron from 'node-cron';
import { getPendingReminders, markReminderAsSent, markReminderAsCancelled } from '../services/reminderService.js';
import { formatReminderMessage } from '../utils/formatter.js';
import logger from '../logger/logger.js';
import { Markup } from 'telegraf';

/**
 * Setup reminder job that runs every minute
 * @param {import('telegraf').Telegraf} bot 
 */
export const setupReminderJob = (bot) => {
  cron.schedule('* * * * *', async () => {
    try {
      const pendingReminders = await getPendingReminders();

      if (pendingReminders.length === 0) {
        return;
      }

      logger.info(`[Cron Job] Found ${pendingReminders.length} pending reminders.`);

      // Loop reminder to send message and update status to 'sent'
      for (const reminder of pendingReminders) {
        try {
          const userId = reminder.userId.toString();
          const messageText = formatReminderMessage(reminder.message);
          
          await bot.telegram.sendMessage(userId, messageText, {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
              Markup.button.callback('Selesai', `complete_${reminder.id}`),
              Markup.button.callback('Tunda 30 Menit', `snooze_30m_${reminder.id}`),
              Markup.button.callback('Tunda 1 Hari', `snooze_1d_${reminder.id}`)
            ])
          });

          await markReminderAsSent(reminder.id);

          logger.info(`[Cron Job] Reminder ID ${reminder.id} sent successfully to user ${userId}`);
        } catch (err) {
          logger.error(`[Cron Job] Failed to send reminder ID ${reminder.id}: ${err.message}`);
          
          // If the bot is blocked by the user, cancel the reminder
          if (err.description?.includes('forbidden')) {
            await markReminderAsCancelled(reminder.id);
          }
        }
      }
    } catch (error) {
      logger.error('[Cron Job] Error during execution:', error);
    }
  });
  
  logger.info('[Cron Job] Reminder job initialized (every minute).');
};