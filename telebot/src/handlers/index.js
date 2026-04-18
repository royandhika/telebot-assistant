import logger from '../logger/logger.js';
import { handleTextMessage, createMessageObject } from './textHandler.js';
import { handleCreateTask } from './tasks/createTaskHandler.js';
import { handleReadTask } from './tasks/readTaskHandler.js';
import { handleUpdate } from './tasks/updateTaskHandler.js';
import { handleAddReminder } from './reminders/addReminderHandler.js';
import { handleGetReminder } from './reminders/getReminderHandler.js';
import { handleCompleteReminder } from './reminders/completeActionHandler.js';
import { handleSnoozeReminder } from './reminders/snoozeActionHandler.js';
import { handleStart } from './startHandler.js';
import { handleTestFastApi } from './testFastApiHandler.js';
import { handleUploadDocument } from './documents/uploadDocumentHandler.js';

/**
 * Routing every input from user to the right handler
 * @param {import('telegraf').Telegraf} bot 
 */
function setupHandlers(bot) {
  bot.start(async (ctx) => {
    logger.info(`User ${ctx.from.id} triggered /start`);
    const message = createMessageObject(ctx);
    await handleStart(ctx, message);
  });

  bot.help((ctx) => {
    logger.info(`User ${ctx.from.id} requested help`);
    ctx.reply('Saat ini anda bisa mendaftarkan task atau database.');
  });

  bot.command('test', handleTestFastApi);

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

  bot.on('document', async (ctx) => {
    logger.info(`User ${ctx.from.id} sent a document`);
    const message = createMessageObject(ctx);
    await handleUploadDocument(ctx, message);
  });
}

export { setupHandlers };
