import logger from '../logger/logger.js';
import { handleTextMessage } from './textHandler.js';

function setupHandlers(bot) {
  // bot.use(async (ctx, next) => {
  //   const start = Date.now();
  //   await next();
  //   const ms = Date.now() - start;
  //   logger.debug(`Update processed in ${ms}ms`);
  // });

  bot.start((ctx) => {
    logger.info(`User ${ctx.from.id} (${ctx.from.username}) started the bot.`);
    ctx.reply('Welcome to ETL Assistant Bot!')
  });

  bot.help((ctx) => {
    logger.info(`User ${ctx.from.id} requested help`);
    ctx.reply('Saat ini anda bisa mendaftarkan task atau database.');
  });

  bot.on('text', handleTextMessage);
}

export { setupHandlers };
