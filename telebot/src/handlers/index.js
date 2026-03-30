import { handleTextMessage } from './textHandler.js';

function setupHandlers(bot) {
    bot.start((ctx) => ctx.reply('Welcome!'));
    bot.help((ctx) => ctx.reply('Send me a sticker'));
    bot.on('text', handleTextMessage);
}

export { setupHandlers };
