import { prisma } from '../prisma.js';
import logger from '../logger/logger.js';

async function logChat(message) {
  try {
    const chatLog = await prisma.chat.create({
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
