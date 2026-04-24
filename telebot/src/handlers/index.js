import logger from '../logger/logger.js';
import { handleStart } from './startHandler.js';
import { 
  handleAddReminder, 
  handleGetReminder, 
  handleCompleteReminder, 
  handleSnoozeReminder 
} from './reminderHandler.js';
import { 
  handleUploadDocument, 
  handleReadTable 
} from './dataWarehouseHandler.js';

/**
 * Routing every input from user to the right handler
 * @param {import('telegraf').Telegraf} bot 
 */
function setupHandlers(bot) {
  bot.start(async (ctx) => {
    logger.info(`User ${ctx.from.id} triggered /start`);
    await handleStart(ctx);
  });

  bot.help((ctx) => {
    logger.info(`User ${ctx.from.id} requested help`);
    ctx.reply('Saat ini anda bisa mendaftarkan task atau database.');
  });

  bot.command('read', handleReadTable);

  bot.command('add', async (ctx) => {
    logger.info(`User ${ctx.from.id} triggered /add`);
    await handleAddReminder(ctx);
  });

  bot.command('list', async (ctx) => {
    logger.info(`User ${ctx.from.id} triggered /list`);
    await handleGetReminder(ctx);
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

  bot.on('document', async (ctx) => {
    logger.info(`User ${ctx.from.id} sent a document`);
    await handleUploadDocument(ctx);
  });
}

export { setupHandlers };
