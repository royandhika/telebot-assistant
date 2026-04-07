import { logChat } from '../services/chatService.js';
import { parseIntent } from '../ai/parsers/intentParser.js';
import { handleCreateTask } from './tasks/createTaskHandler.js';
import { handleRead } from './tasks/readTaskHandler.js';
import { handleUpdate } from './tasks/updateTaskHandler.js';
import { handleAddDatabase } from './databases/addDatabaseHandler.js';
import logger from '../logger/logger.js';

export function createMessageObject(ctx) {
  return {
    userId: BigInt(ctx.message.from.id),
    username: ctx.message.from.username,
    messageId: ctx.message.message_id,
    messageText: ctx.message.text,
    langCode: ctx.message.from.language_code,
    createdAt: new Date(ctx.message.date * 1000),
  };
}

export async function handleTextMessage(ctx) {
  const message = createMessageObject(ctx);

  try {
    ctx.sendChatAction('typing');
    logger.info(`Incoming message from ${message.username} (${message.userId}): "${message.messageText}"`);

    // Log chat message to DB
    await logChat(message);

    // Intention parsing
    const intention = await parseIntent(message.messageText);
    logger.info(`Intent detected for user ${message.userId}: ${intention.intent} (Confidence: ${intention.confidence_score})`);
    
    switch (intention.intent) {
      case 'CREATE':
        await handleCreateTask(ctx, message);
        break;
      case 'READ':
        await handleRead(ctx, message);
        break;
      case 'UPDATE':
        await handleUpdate(ctx, message);
        break;
      case 'ADD_DATABASE':
        await handleAddDatabase(ctx, message);
        break;
      default:
        logger.warn(`Unknown intent for message: "${message.messageText}"`);
        ctx.reply("Maaf, untuk saat ini saya hanya bisa membantu membuat task baru. Coba kirim pesan dengan format yang mengindikasikan penambahan task ya!");
    }
  } catch (error) {
    logger.error(`Error in textHandler for user ${message.userId}:`, error);
    ctx.reply("Waduh, ada kendala pas menyimpan pesanmu.");
  }
}
