import logger from '../logger/logger.js';
import { logChat } from '../services/chatService.js';
import { createMessageObject } from '../utils/messageParser.js';

/**
 * Telegraf middleware to log every incoming text message to the database.
 * @param {import('telegraf').Context} ctx - Telegram context object
 * @param {Function} next - The next middleware function
 */
export async function chatLoggerMiddleware(ctx, next) {
  if (ctx.message && (ctx.message.text || ctx.message.document)) {
    try {
      const message = createMessageObject(ctx);
      // Save to state for handlers to use without re-parsing
      ctx.state.parsedMessage = message;
      // Log messages to database
      if (ctx.message.text) {
        await logChat(message);
      }
    } catch (error) {
      logger.error('Logging middleware error:', error);
    }
  }
  return next();
}
