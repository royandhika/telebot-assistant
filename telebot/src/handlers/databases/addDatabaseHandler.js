import { parseDatabaseInfo } from '../../ai/parsers/databaseParser.js';
import { addDatabase } from '../../services/databaseService.js';
import { buildDatabaseReplyMessage } from '../../utils/formatter.js';
import logger from '../../logger/logger.js';

export async function handleAddDatabase(ctx, message) {
  try {
    // AI parse to extract database details
    const dbInfo = await parseDatabaseInfo(message.messageText);
    logger.debug(`AI Extracted DB Info: ${JSON.stringify(dbInfo)}`);

    // Service to add database
    const newDb = await addDatabase(dbInfo);

    // Build reply message
    const successMsg = buildDatabaseReplyMessage(newDb);
    await ctx.reply(successMsg, { parse_mode: 'HTML' });

  } catch (error) {
    logger.error(`Error in handleAddDatabase for user ${message.userId}:`, error);
    await ctx.reply("Waduh, gagal mendaftarkan. Pastikan format pesannya mengandung info detail database.");
  }
}
