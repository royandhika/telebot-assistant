import logger from '../logger/logger.js';
import { handleTextMessage, createMessageObject } from './textHandler.js';
import { handleCreateTask } from './tasks/createTaskHandler.js';
import { handleReadTask } from './tasks/readTaskHandler.js';
import { handleUpdate } from './tasks/updateTaskHandler.js';
import { handleAddReminder } from './reminder/addReminderHandler.js';
import { handleGetReminder } from './reminder/getReminderHandler.js';
import { handleCompleteReminder } from './reminder/completeActionHandler.js';
import { handleSnoozeReminder } from './reminder/snoozeActionHandler.js';

/**
 * Routing every input from user to the right handler
 * @param {import('telegraf').Telegraf} bot 
 */
function setupHandlers(bot) {
  bot.start((ctx) => {
    logger.info(`User ${ctx.from.id} (${ctx.from.username}) started the bot.`);
    ctx.reply('Welcome to ETL Assistant Bot!')
  });

  bot.help((ctx) => {
    logger.info(`User ${ctx.from.id} requested help`);
    ctx.reply('Saat ini anda bisa mendaftarkan task atau database.');
  });

  bot.command('add', async (ctx) => {
    logger.info(`User ${ctx.from.id} triggered /add`);
    const message = createMessageObject(ctx);
    await handleAddReminder(ctx, message);
  });

  bot.command('list', async (ctx) => {
    logger.info(`User ${ctx.from.id} triggered /list`);
    const message = createMessageObject(ctx);
    await handleGetReminder(ctx, message);
  });

  bot.action(/complete_(\d+)/, async (ctx) => {
    logger.info(`User ${ctx.from.id} triggered complete action for reminder ID ${ctx.match[1]}`);
    await handleCompleteReminder(ctx);
  });
  
  bot.action(/snooze_([0-9a-z]+)_(.+)/, async (ctx) => {
    const duration = ctx.match[1];
    const action = `snooze_${duration}`;
    const reminderId = ctx.match[2];
    logger.info(`User ${ctx.from.id} triggered ${action} action for reminder ID ${reminderId}`);
    await handleSnoozeReminder(ctx, action);
  });

  bot.on('text', handleTextMessage);
}

export { setupHandlers };
