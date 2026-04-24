import { prisma } from '../prisma.js';
import logger from '../logger/logger.js';

/**
 * Logs a chat message to the database.
 * @param {Object} message - The message object to log.
 * @param {number|BigInt} message.messageId - The unique ID of the message.
 * @param {number|BigInt} message.userId - The ID of the user who sent the message.
 * @param {string} [message.username] - The username of the user.
 * @param {string} [message.messageText] - The content of the message.
 * @param {string} [message.langCode] - The language code of the user.
 * @param {Date} message.createdAt - The timestamp when the message was created.
 * @returns {Promise<Object|undefined>} The created chat log record or undefined if failed.
 */
async function logChat(message) {
  try {
    const chatLog = await prisma.chatLog.create({
      data: {
        id: message.messageId,
        users: {
          connectOrCreate: {
            where: { id: message.userId },
            create: { id: message.userId, username: message.username }
          }
        },
        body: message.messageText,
        lang: message.langCode,
        createdAt: message.createdAt,
      }
    });

    logger.debug(`Chat log saved: messageId ${message.messageId} from user ${message.userId}`);
    return chatLog;
  } catch (error) {
    logger.error(`Failed to log chat message ${message.messageId}:`, error);
    // Don't throw to avoid interrupting the main bot flow for logging errors
  }
}

export { logChat };
