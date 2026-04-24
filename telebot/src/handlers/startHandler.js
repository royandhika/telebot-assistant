import logger from '../logger/logger.js';
import { upsertUser } from '../services/userService.js';

/**
 * Handle /start command
 * @param {import('telegraf').Context} ctx - Telegram context object
 */
export async function handleStart(ctx) {
  const { id, username } = ctx.from;
  
  try {
    // Call userService to upsert user data
    await upsertUser(id, username);
    
    await ctx.reply(`Welcome to ETL Assistant Bot, @${username}! 🚀\n\nSaya akan membantu anda mengelola task dan seputar.`);
  } catch (error) {
    logger.error(`Error in handleStart for user ${id}:`, error);
    await ctx.reply('Welcome! Ada sedikit kendala saat mendaftarkan akunmu, tapi kamu tetap bisa mencoba menggunakan bot ini.');
  }
}
