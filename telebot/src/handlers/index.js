import logger from '../logger/logger.js';
import { handleTextMessage, createMessageObject } from './textHandler.js';
import { handleCreateTask } from './tasks/createTaskHandler.js';
import { handleRead } from './tasks/readTaskHandler.js';
import { handleUpdate } from './tasks/updateTaskHandler.js';

function setupHandlers(bot) {
  bot.start((ctx) => {
    logger.info(`User ${ctx.from.id} (${ctx.from.username}) started the bot.`);
    ctx.reply('Welcome to ETL Assistant Bot!')
  });

  bot.help((ctx) => {
    logger.info(`User ${ctx.from.id} requested help`);
    ctx.reply('Saat ini anda bisa mendaftarkan task atau database.');
  });

  bot.command('create_task', async (ctx) => {
    logger.info(`User ${ctx.from.id} triggered /create_task`);
    const message = createMessageObject(ctx);
    await handleCreateTask(ctx, message);
  });

  bot.command('view_task', async (ctx) => {
    logger.info(`User ${ctx.from.id} triggered /view_task`);
    const message = createMessageObject(ctx);
    await handleRead(ctx, message);
  });

  bot.command('edit_task', async (ctx) => {
    logger.info(`User ${ctx.from.id} triggered /edit_task`);
    const message = createMessageObject(ctx);
    await handleUpdate(ctx, message);
  });

  bot.on('text', handleTextMessage);
}

export { setupHandlers };
