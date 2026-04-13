import { prisma } from '../prisma.js';
import logger from '../logger/logger.js';

/**
 * Upsert user data when they start the bot
 * @param {number|BigInt} id - The Telegram user ID
 * @param {string} username - The Telegram username
 * @returns {Promise<Object>} The upserted user object
 */
async function upsertUser(id, username) {
  try {
    const user = await prisma.user.upsert({
      where: { id: BigInt(id) },
      update: {
        username: username,
        modifiedAt: new Date()
      },
      create: {
        id: BigInt(id),
        username: username
      }
    });

    logger.info(`User ID ${id} (${username}) successfully upserted.`);
    return user;
  } catch (error) {
    logger.error(`Failed to upsert user ID ${id}:`, error);
    throw error;
  }
}

export { upsertUser };