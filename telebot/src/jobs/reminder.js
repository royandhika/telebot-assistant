import cron from 'node-cron';
import { prisma } from '../prisma.js';
import logger from '../logger/logger.js';
import { Markup } from 'telegraf';

/**
 * Setup reminder job that runs every minute
 * @param {import('telegraf').Telegraf} bot 
 */
export const setupReminderJob = (bot) => {
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      
      const pendingReminders = await prisma.reminder.findMany({
        where: {
          status: 'pending',
          remindAt: {
            lte: now
          }
        }
      });

      if (pendingReminders.length === 0) {
        return;
      }

      logger.info(`[Cron Job] Found ${pendingReminders.length} pending reminders.`);

      // Loop reminder to send message and update status to 'sent'
      for (const reminder of pendingReminders) {
        try {
          const userId = reminder.userId.toString();
          
          await bot.telegram.sendMessage(userId, `🔔 *REMINDER*\n\n${reminder.message}`, {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
              Markup.button.callback('Selesai', `complete_${reminder.id}`),
              Markup.button.callback('Tunda 30 Menit', `snooze_30m_${reminder.id}`),
              Markup.button.callback('Tunda 1 Hari', `snooze_1d_${reminder.id}`)
            ])
          });

          await prisma.reminder.update({
            where: { id: reminder.id },
            data: { 
              status: 'sent',
              modifiedAt: new Date()
            }
          });

          logger.info(`[Cron Job] Reminder ID ${reminder.id} sent successfully to user ${userId}`);
        } catch (err) {
          logger.error(`[Cron Job] Failed to send reminder ID ${reminder.id}: ${err.message}`);
          
          // Optional
          if (err.description?.includes('forbidden')) {
            await prisma.reminder.update({
              where: { id: reminder.id },
              data: { status: 'cancelled' }
            });
          }
        }
      }
    } catch (error) {
      logger.error('[Cron Job] Error fetching reminders:', error);
    }
  });
  
  logger.info('[Cron Job] Reminder job initialized (every minute).');
};
